/**
 * Lead Intelligence Checker — validates email, domain, and phone numbers,
 * detects disposable email domains, and returns a composite risk score.
 *
 * POST /api/tools/lead-intelligence
 * Body: { target: string }
 */

import type { NextRequest } from "next/server";
import { isValidIP } from "@/lib/validators";

// ---------------------------------------------------------------------------
// Known disposable / throwaway email domain list (representative sample)
// ---------------------------------------------------------------------------

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamailblock.com",
  "sharklasers.com",
  "spam4.me",
  "grr.la",
  "guerillamail.com",
  "spam.la",
  "yopmail.com",
  "yopmail.fr",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "10minutemail.co.uk",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "trashmail.at",
  "trashmail.io",
  "trashmail.org",
  "trashmail.xyz",
  "dispostable.com",
  "throwam.com",
  "throwam.net",
  "mailnull.com",
  "mailnesia.com",
  "maildrop.cc",
  "discard.email",
  "spamgourmet.com",
  "spamgourmet.net",
  "fakeinbox.com",
  "tempmail.com",
  "tempmail.net",
  "temp-mail.org",
  "temp-mail.io",
  "getnada.com",
  "tempr.email",
  "discard.ga",
  "throwam.info",
  "mytemp.email",
  "crazymailing.com",
  "sharklasers.com",
  "binkmail.com",
  "bob.email",
  "clrmail.com",
  "dispostable.com",
  "getairmail.com",
  "getonemail.net",
  "inboxbear.com",
  "mohmal.com",
  "spamavert.com",
  "spamfree24.org",
  "spamgob.com",
  "spamhereplease.com",
  "spamoff.de",
  "spamspot.com",
  "spamthisplease.com",
  "superrito.com",
  "kurzepost.de",
  "objectmail.com",
  "obobbo.com",
  "oneoffemail.com",
  "pookmail.com",
  "reallymymail.com",
  "regbypass.com",
  "sharklasers.com",
  "spambob.net",
  "spambob.org",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
]);

// High-risk TLDs commonly associated with spam/abuse
const HIGH_RISK_TLDS = new Set([".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click", ".loan", ".win", ".download", ".racing"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractEmailParts(email: string): { local: string; domain: string } | null {
  const m = email.match(/^([^@\s]+)@([^@\s]+\.[^@\s]+)$/);
  if (!m) return null;
  return { local: m[1], domain: m[2].toLowerCase() };
}

function isValidEmailFormat(email: string): boolean {
  // RFC 5322 simplified
  return /^[^\s@"'<>]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

function detectInputType(target: string): "email" | "domain" | "phone" | "ip" | "unknown" {
  const t = target.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "email";
  if (/^\+?[\d\s\-().]{7,20}$/.test(t) && /\d{7,}/.test(t.replace(/\D/g, ""))) return "phone";
  if (isValidIP(t)) return "ip";
  if (/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(t) && t.length <= 253) return "domain";
  return "unknown";
}

async function resolveDNS(hostname: string): Promise<{ hasA: boolean; hasMX: boolean; error?: string }> {
  try {
    const [aRes, mxRes] = await Promise.allSettled([
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`).then((r) => r.json()),
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=MX`).then((r) => r.json()),
    ]);

    const hasA =
      aRes.status === "fulfilled" &&
      Array.isArray(aRes.value?.Answer) &&
      aRes.value.Answer.length > 0;

    const hasMX =
      mxRes.status === "fulfilled" &&
      Array.isArray(mxRes.value?.Answer) &&
      mxRes.value.Answer.length > 0;

    return { hasA, hasMX };
  } catch {
    return { hasA: false, hasMX: false, error: "DNS lookup failed" };
  }
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface LeadFinding {
  label: string;
  detail: string;
  severity: "info" | "warning" | "risk" | "pass";
}

export interface LeadIntelligenceResult {
  target: string;
  targetType: "email" | "domain" | "phone" | "ip" | "unknown";
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High" | "Critical";
  isDisposable: boolean;
  isValidFormat: boolean;
  domainExists: boolean;
  hasMXRecords: boolean;
  findings: LeadFinding[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const target = ((body as Record<string, unknown>).target ?? "").toString().trim();
  if (!target) {
    return Response.json({ error: "A target (email, domain, or phone) is required." }, { status: 400 });
  }
  if (target.length > 500) {
    return Response.json({ error: "Target value is too long." }, { status: 400 });
  }

  const targetType = detectInputType(target);
  const findings: LeadFinding[] = [];
  let riskScore = 0;
  let isDisposable = false;
  let isValidFormat = false;
  let domainExists = false;
  let hasMXRecords = false;

  // ---------------------------------------------------------------------------
  // Email analysis
  // ---------------------------------------------------------------------------

  if (targetType === "email") {
    isValidFormat = isValidEmailFormat(target);
    if (!isValidFormat) {
      findings.push({ label: "Invalid email format", detail: "The email address does not match standard RFC formatting.", severity: "risk" });
      riskScore += 40;
    } else {
      findings.push({ label: "Valid email format", detail: "The email address matches standard RFC formatting.", severity: "pass" });
    }

    const parts = extractEmailParts(target);
    if (parts) {
      const { domain } = parts;

      // Disposable check
      isDisposable = DISPOSABLE_DOMAINS.has(domain);
      if (isDisposable) {
        findings.push({ label: "Disposable email domain", detail: `${domain} is a known throwaway email provider.`, severity: "risk" });
        riskScore += 40;
      } else {
        findings.push({ label: "Not a known disposable domain", detail: "Domain is not found in the disposable email domain list.", severity: "pass" });
      }

      // High-risk TLD check
      const tldMatch = domain.match(/(\.[^.]+)$/);
      if (tldMatch && HIGH_RISK_TLDS.has(tldMatch[1].toLowerCase())) {
        findings.push({ label: "High-risk TLD", detail: `Domain uses a TLD (${tldMatch[1]}) frequently associated with spam or phishing.`, severity: "warning" });
        riskScore += 15;
      }

      // DNS check
      const dns = await resolveDNS(domain);
      domainExists = dns.hasA;
      hasMXRecords = dns.hasMX;

      if (!dns.hasA && !dns.hasMX) {
        findings.push({ label: "Domain does not resolve", detail: `No DNS A or MX records found for ${domain}.`, severity: "risk" });
        riskScore += 30;
      } else {
        if (dns.hasA) findings.push({ label: "Domain resolves (A record)", detail: `${domain} has at least one A record.`, severity: "pass" });
        if (dns.hasMX) {
          findings.push({ label: "MX records present", detail: `${domain} has valid mail exchange (MX) records — can receive email.`, severity: "pass" });
        } else {
          findings.push({ label: "No MX records", detail: `${domain} has no MX records. Emails may bounce.`, severity: "warning" });
          riskScore += 10;
        }
      }

      // Local-part checks
      if (/^(admin|noreply|no-reply|test|info|support|sales|contact|hello|hi|postmaster)$/i.test(parts.local)) {
        findings.push({ label: "Generic local-part", detail: `The "${parts.local}" prefix is commonly used for role-based or test accounts.`, severity: "info" });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Domain analysis
  // ---------------------------------------------------------------------------

  if (targetType === "domain") {
    isValidFormat = true;
    const domain = target.toLowerCase();

    // High-risk TLD
    const tldMatch = domain.match(/(\.[^.]+)$/);
    if (tldMatch && HIGH_RISK_TLDS.has(tldMatch[1])) {
      findings.push({ label: "High-risk TLD", detail: `Domain uses a TLD (${tldMatch[1]}) frequently associated with spam or phishing.`, severity: "warning" });
      riskScore += 15;
    }

    // DNS check
    const dns = await resolveDNS(domain);
    domainExists = dns.hasA;
    hasMXRecords = dns.hasMX;

    if (dns.hasA) {
      findings.push({ label: "Domain resolves", detail: "Domain has DNS A records and is publicly accessible.", severity: "pass" });
    } else {
      findings.push({ label: "Domain does not resolve", detail: "No DNS A records found — domain may be inactive.", severity: "warning" });
      riskScore += 10;
    }

    if (dns.hasMX) {
      findings.push({ label: "MX records present", detail: "Domain can receive email.", severity: "pass" });
    } else {
      findings.push({ label: "No MX records", detail: "Domain has no MX records.", severity: "info" });
    }

    // Subdomain depth check
    const labels = domain.split(".");
    if (labels.length > 4) {
      findings.push({ label: "Deep subdomain chain", detail: `Domain has ${labels.length - 1} subdomain levels, which is unusual and may indicate phishing.`, severity: "warning" });
      riskScore += 10;
    }
  }

  // ---------------------------------------------------------------------------
  // Phone analysis
  // ---------------------------------------------------------------------------

  if (targetType === "phone") {
    isValidFormat = true;
    const digits = target.replace(/\D/g, "");

    if (digits.length < 7 || digits.length > 15) {
      isValidFormat = false;
      findings.push({ label: "Invalid phone number length", detail: `Phone number has ${digits.length} digits; valid numbers are 7–15 digits (E.164).`, severity: "risk" });
      riskScore += 30;
    } else {
      findings.push({ label: "Valid phone number format", detail: "Number length matches E.164 standard (7–15 digits).", severity: "pass" });
    }

    // Check for common premium-rate / VOIP prefixes
    if (target.startsWith("+900") || target.startsWith("+1900")) {
      findings.push({ label: "Potential premium-rate number", detail: "Number prefix matches known premium-rate ranges.", severity: "warning" });
      riskScore += 20;
    }

    if (!target.trim().startsWith("+") && digits.length === 10) {
      findings.push({ label: "No country code", detail: "Number appears to lack an international country code (+XX). Validation may be incomplete.", severity: "info" });
    }

    domainExists = isValidFormat;
    hasMXRecords = false;
  }

  // ---------------------------------------------------------------------------
  // IP analysis
  // ---------------------------------------------------------------------------

  if (targetType === "ip") {
    isValidFormat = true;
    findings.push({ label: "Valid IP address format", detail: "The input is a valid IPv4 or IPv6 address.", severity: "info" });
    findings.push({ label: "Use IP Reputation tool", detail: "For a full threat assessment of this IP, use the IP Reputation or Threat Score tools.", severity: "info" });
    domainExists = true;
  }

  // ---------------------------------------------------------------------------
  // Unknown input
  // ---------------------------------------------------------------------------

  if (targetType === "unknown") {
    findings.push({ label: "Unrecognised input", detail: "Could not classify the input as an email, domain, phone number, or IP address.", severity: "risk" });
    riskScore += 20;
  }

  // Clamp score
  riskScore = Math.min(100, Math.max(0, riskScore));
  const riskLabel: LeadIntelligenceResult["riskLabel"] =
    riskScore >= 75 ? "Critical" : riskScore >= 50 ? "High" : riskScore >= 25 ? "Medium" : "Low";

  const riskFindings = findings.filter((f) => f.severity === "risk").length;
  const warnFindings = findings.filter((f) => f.severity === "warning").length;

  const summary =
    riskScore === 0
      ? `${target} passed all checks with no issues detected.`
      : `${target} has a ${riskLabel.toLowerCase()} risk score (${riskScore}/100) with ${riskFindings} risk issue${riskFindings !== 1 ? "s" : ""} and ${warnFindings} warning${warnFindings !== 1 ? "s" : ""}.`;

  const result: LeadIntelligenceResult = {
    target,
    targetType,
    riskScore,
    riskLabel,
    isDisposable,
    isValidFormat,
    domainExists,
    hasMXRecords,
    findings,
    summary,
  };

  return Response.json({ data: result });
}

"use client";

import { useState } from "react";
import type { DNSResult, BlacklistResult } from "@/lib/types";
import { validateDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CheckStatus = "pass" | "warning" | "fail" | "info";

interface DeliverabilityCheck {
  name: string;
  status: CheckStatus;
  value: string | null;
  detail: string;
  guidance?: string;
}

interface DeliverabilityResult {
  domain: string;
  checks: DeliverabilityCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
  overallScore: number;
}

// ---------------------------------------------------------------------------
// Helpers: extract SPF / DKIM / DMARC from DNS records
// ---------------------------------------------------------------------------

function extractSPF(dns: DNSResult): string | null {
  const txt = dns.records.filter((r) => r.type === "TXT");
  const spf = txt.find((r) => r.value.trim().startsWith("v=spf1"));
  return spf?.value ?? null;
}

function extractDMARC(dns: DNSResult): string | null {
  const txt = dns.records.filter((r) => r.type === "TXT");
  // DMARC record is on _dmarc subdomain; the DNS lookup for the apex domain may include it
  const dmarc = txt.find((r) => r.value.trim().startsWith("v=DMARC1"));
  return dmarc?.value ?? null;
}

function extractMX(dns: DNSResult): string[] {
  return dns.records.filter((r) => r.type === "MX").map((r) => r.value);
}

function scoreSPF(value: string | null): CheckStatus {
  if (!value) return "fail";
  if (value.includes("~all")) return "warning";
  if (value.includes("-all")) return "pass";
  if (value.includes("+all")) return "fail";
  return "warning";
}

function scoreDMARC(value: string | null): CheckStatus {
  if (!value) return "fail";
  if (value.includes("p=reject")) return "pass";
  if (value.includes("p=quarantine")) return "warning";
  if (value.includes("p=none")) return "warning";
  return "warning";
}

function detectM365MX(mxRecords: string[]): boolean {
  return mxRecords.some((mx) => {
    // Extract hostname from MX record (may include priority like "10 mail.protection.outlook.com")
    const host = mx.trim().toLowerCase().split(/\s+/).pop() ?? "";
    // Match exactly .mail.protection.outlook.com or .microsoft.com domains
    return host === "mail.protection.outlook.com" ||
      host.endsWith(".mail.protection.outlook.com") ||
      host.endsWith(".microsoft.com");
  });
}

function detectGoogleMX(mxRecords: string[]): boolean {
  return mxRecords.some((mx) => {
    const host = mx.trim().toLowerCase().split(/\s+/).pop() ?? "";
    return host.endsWith(".google.com") ||
      host.endsWith(".googlemail.com");
  });
}

// ---------------------------------------------------------------------------
// Build deliverability result from DNS + blacklist data
// ---------------------------------------------------------------------------

function buildDeliverabilityResult(
  domain: string,
  dns: DNSResult,
  blacklist: BlacklistResult | null,
  dmarcDns: DNSResult | null,
): DeliverabilityResult {
  const checks: DeliverabilityCheck[] = [];

  // 1. MX records
  const mxRecords = extractMX(dns);
  const hasMX = mxRecords.length > 0;
  const isM365 = detectM365MX(mxRecords);
  const isGoogle = detectGoogleMX(mxRecords);
  const providerHint = isM365
    ? "Microsoft 365 (Exchange Online)"
    : isGoogle
    ? "Google Workspace / Gmail"
    : mxRecords.length > 0
    ? "Custom mail provider"
    : null;

  checks.push({
    name: "MX Records",
    status: hasMX ? "pass" : "fail",
    value: hasMX ? mxRecords.slice(0, 3).join(", ") + (mxRecords.length > 3 ? ` (+${mxRecords.length - 3} more)` : "") : null,
    detail: hasMX
      ? `${mxRecords.length} MX record${mxRecords.length > 1 ? "s" : ""} found.${providerHint ? ` Provider detected: ${providerHint}.` : ""}`
      : "No MX records found. This domain cannot receive email.",
    guidance: !hasMX
      ? "Add an MX record pointing to your mail provider. Without it, all incoming email will bounce."
      : undefined,
  });

  // 2. SPF
  const spfValue = extractSPF(dns);
  const spfStatus = scoreSPF(spfValue);
  checks.push({
    name: "SPF Record",
    status: spfStatus,
    value: spfValue,
    detail: !spfValue
      ? "No SPF record found in TXT records."
      : spfValue.includes("+all")
      ? "SPF record uses +all which allows all senders — this is dangerous."
      : spfValue.includes("-all")
      ? "SPF record uses -all (hard fail) — best practice."
      : spfValue.includes("~all")
      ? "SPF record uses ~all (soft fail) — consider upgrading to -all for stricter enforcement."
      : "SPF record found.",
    guidance: !spfValue
      ? 'Add a TXT record to your DNS: "v=spf1 include:spf.protection.outlook.com -all" (adjust include for your mail provider).'
      : spfValue.includes("~all")
      ? 'Consider changing ~all to -all for stricter enforcement once you have confirmed all sending sources are included.'
      : undefined,
  });

  // 3. DKIM (placeholder — requires subdomain query we don't have here)
  checks.push({
    name: "DKIM",
    status: "info",
    value: null,
    detail: "DKIM lookup requires checking the selector subdomain (e.g. selector1._domainkey.domain.com). This is provider-specific.",
    guidance: isM365
      ? "For Microsoft 365: Microsoft 365 admin centre → Settings → Domains → DKIM → Enable DKIM for your domain."
      : isGoogle
      ? "For Google Workspace: Admin console → Apps → Gmail → Authenticate email → Generate DKIM key."
      : "Obtain your DKIM selector from your mail provider and add the TXT record to your DNS.",
  });

  // 4. DMARC
  const dmarcValue =
    dmarcDns
      ? extractDMARC(dmarcDns) ?? dns.records.find((r) => r.type === "TXT" && r.value.trim().startsWith("v=DMARC1"))?.value ?? null
      : extractDMARC(dns);
  const dmarcStatus = scoreDMARC(dmarcValue);

  checks.push({
    name: "DMARC Policy",
    status: dmarcStatus,
    value: dmarcValue,
    detail: !dmarcValue
      ? "No DMARC record found. Unauthenticated emails cannot be rejected by receiving mail servers."
      : dmarcValue.includes("p=reject")
      ? "DMARC policy is set to reject — best practice. Unauthenticated mail will be rejected."
      : dmarcValue.includes("p=quarantine")
      ? "DMARC policy is set to quarantine — good, but consider upgrading to reject once you have monitored reports."
      : dmarcValue.includes("p=none")
      ? "DMARC policy is p=none (monitor-only). Email is not actively protected."
      : "DMARC record found.",
    guidance: !dmarcValue
      ? 'Add a TXT record at _dmarc.yourdomain.com: "v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com". Start with p=none, monitor, then move to quarantine and reject.'
      : dmarcValue.includes("p=none")
      ? "Move to p=quarantine then p=reject after reviewing DMARC aggregate reports from your rua address."
      : undefined,
  });

  // 5. Blacklist (if available)
  if (blacklist) {
    const listedCount = blacklist.listedCount;
    checks.push({
      name: "Blacklist Reputation",
      status: listedCount === 0 ? "pass" : listedCount <= 2 ? "warning" : "fail",
      value: listedCount === 0 ? "Not listed on any checked blacklist" : `Listed on ${listedCount} blacklist${listedCount > 1 ? "s" : ""}`,
      detail: listedCount === 0
        ? `Clean across all ${blacklist.totalChecked} blacklist checks.`
        : `Found on ${listedCount} of ${blacklist.totalChecked} blacklists: ${blacklist.entries.filter((e) => e.listed).map((e) => e.source).join(", ")}.`,
      guidance: listedCount > 0
        ? "Request delisting from each affected blacklist. Investigate and fix any sending behaviour that caused the listing (open relay, spam complaints, compromised account)."
        : undefined,
    });
  }

  // 6. Microsoft 365 mail flow note (contextual)
  if (isM365) {
    checks.push({
      name: "Microsoft 365 Mail Flow",
      status: "info",
      value: "Microsoft 365 (Exchange Online Protection) detected",
      detail: "EOP is your mail gateway. Enable Advanced Threat Protection (Defender for Office 365) for Safe Links and Safe Attachments. Verify your connectors in Exchange admin centre.",
      guidance: "M365 admin → Exchange admin → Mail flow → Connectors. Also check: Security → Defender for Office 365 → Anti-spam, Anti-phishing, Safe Links, Safe Attachments.",
    });
  }

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warning").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const scorableChecks = checks.filter((c) => c.status !== "info");
  const overallScore = scorableChecks.length === 0
    ? 0
    : Math.round((passCount / scorableChecks.length) * 100);

  return { domain, checks, passCount, warnCount, failCount, overallScore };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<CheckStatus, { bg: string; text: string; badge: string; dot: string }> = {
  pass:    { bg: "bg-emerald-500/8 border-emerald-500/20",  text: "text-emerald-400", badge: "Pass",    dot: "bg-emerald-400" },
  warning: { bg: "bg-amber-500/8 border-amber-500/20",      text: "text-amber-400",   badge: "Warning", dot: "bg-amber-400"   },
  fail:    { bg: "bg-red-500/8 border-red-500/20",          text: "text-red-400",     badge: "Fail",    dot: "bg-red-400"     },
  info:    { bg: "bg-blue-500/8 border-blue-500/20",        text: "text-blue-400",    badge: "Info",    dot: "bg-blue-400"    },
};

function CheckCard({ check }: { check: DeliverabilityCheck }) {
  const style = STATUS_STYLES[check.status];
  return (
    <div className={`rounded-xl border p-4 ${style.bg}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-slate-200">{check.name}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${style.bg} ${style.text}`}>
              {style.badge}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{check.detail}</p>
          {check.value && (
            <p className="text-xs font-mono text-slate-500 mt-1 break-all">{check.value}</p>
          )}
          {check.guidance && (
            <div className="mt-2.5 rounded-lg bg-black/20 border border-white/5 p-3">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className={`font-semibold ${style.text}`}>Guidance: </span>
                {check.guidance}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EmptyIcon = (
  <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EmailDeliverabilityPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeliverabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);

  async function handleSubmit(domain: string) {
    const clean = domain.trim().toLowerCase();
    setLoading(true);
    setError(null);
    setResult(null);
    setIsMock(null);

    try {
      // Fetch DNS records for the apex domain
      const [dnsRes, blacklistRes, dmarcRes] = await Promise.allSettled([
        fetch(`/api/lookup/dns?domain=${encodeURIComponent(clean)}`).then((r) => r.json() as Promise<{ data: DNSResult; mock: boolean }>),
        fetch(`/api/lookup/blacklist?target=${encodeURIComponent(clean)}`).then((r) => r.json() as Promise<{ data: BlacklistResult; mock: boolean }>),
        // Query _dmarc subdomain for DMARC record
        fetch(`/api/lookup/dns?domain=${encodeURIComponent(`_dmarc.${clean}`)}`).then((r) => r.json() as Promise<{ data: DNSResult; mock: boolean }>),
      ]);

      const dns = dnsRes.status === "fulfilled" && !("error" in dnsRes.value)
        ? dnsRes.value.data
        : null;
      const blacklist = blacklistRes.status === "fulfilled" && !("error" in blacklistRes.value)
        ? blacklistRes.value.data
        : null;
      const dmarcDns = dmarcRes.status === "fulfilled" && !("error" in dmarcRes.value)
        ? dmarcRes.value.data
        : null;

      const wasMock =
        (dnsRes.status === "fulfilled" && "mock" in dnsRes.value && dnsRes.value.mock) ||
        (blacklistRes.status === "fulfilled" && "mock" in blacklistRes.value && blacklistRes.value.mock);
      setIsMock(wasMock);

      if (!dns) {
        setError("Could not retrieve DNS records for this domain. Please try again.");
        return;
      }

      setResult(buildDeliverabilityResult(clean, dns, blacklist, dmarcDns));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    result && result.overallScore >= 80
      ? "text-emerald-400"
      : result && result.overallScore >= 50
      ? "text-amber-400"
      : "text-red-400";

  return (
    <ToolPageLayout
      title="Email Deliverability Checker"
      description="Audit your domain's email authentication setup — SPF, DKIM guidance, DMARC policy, MX records, and blacklist status."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a domain (e.g. example.com)"
        buttonLabel="Check Deliverability"
        validate={validateDomain}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["google.com", "microsoft.com", "cloudflare.com"]}
      />

      {loading && (
        <LoadingSpinner
          label="Checking email deliverability…"
          sublabel="Querying DNS records, DMARC policy, and blacklist status…"
        />
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && result && (
        <div className="space-y-4 mt-2">
          {/* Score summary */}
          <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
            <div className="flex flex-wrap gap-6 items-center">
              <div className="text-center">
                <p className={`text-4xl font-bold ${scoreColor}`}>{result.overallScore}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Deliverability score</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{result.passCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{result.warnCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Warnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{result.failCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Failed</p>
                </div>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500">Domain</p>
                <p className="font-mono text-cyan-400 text-sm">{result.domain}</p>
              </div>
            </div>
          </div>

          {/* Individual checks */}
          <div className="space-y-3">
            {result.checks.map((check) => (
              <CheckCard key={check.name} check={check} />
            ))}
          </div>

          {/* Note about mock data */}
          {isMock && (
            <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-4 text-xs text-amber-400">
              Some results shown are demo/mock data because live API keys are not configured. Results may not reflect the actual domain configuration.
            </div>
          )}
        </div>
      )}

      {!loading && !error && !result && (
        <ToolEmptyState
          icon={EmptyIcon}
          title="Enter a domain to audit"
          description="Submit any domain to check its email authentication setup including SPF, DKIM guidance, DMARC policy, MX records, and blacklist reputation."
        />
      )}
    </ToolPageLayout>
  );
}

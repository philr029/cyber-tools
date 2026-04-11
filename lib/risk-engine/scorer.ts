// ---------------------------------------------------------------------------
// Risk Scoring Engine — scorer functions
//
// Each function accepts a domain-specific result type and returns a RiskScore
// (score 0–100, severity, label, explanation, recommendations, confidence).
//
// Severity thresholds:
//   0–19   → safe
//   20–39  → low
//   40–59  → medium
//   60–79  → high
//   80–100 → critical
// ---------------------------------------------------------------------------

import type {
  IPReputationResult,
  DomainReputationResult,
  BlacklistResult,
  SSLCertificateResult,
  SecurityHeadersResult,
  DNSResult,
  WHOISResult,
  EmailHeaderResult,
  OpenPortsResult,
  RedirectTraceResult,
  URLAnalysisResult,
  PhoneResult,
} from "@/lib/types";
import type { RiskScore, RiskSeverity, RiskRecommendation } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function severityFromScore(score: number): RiskSeverity {
  if (score < 20) return "safe";
  if (score < 40) return "low";
  if (score < 60) return "medium";
  if (score < 80) return "high";
  return "critical";
}

const SEVERITY_LABEL: Record<RiskSeverity, RiskScore["label"]> = {
  safe: "Safe",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

function confidenceLabel(c: number): RiskScore["confidenceLabel"] {
  if (c >= 75) return "High";
  if (c >= 45) return "Medium";
  return "Low";
}

function buildScore(
  raw: number,
  confidence: number,
  explanation: string,
  recommendations: RiskRecommendation[],
): RiskScore {
  const score = clamp(raw);
  const severity = severityFromScore(score);
  return {
    score,
    severity,
    label: SEVERITY_LABEL[severity],
    explanation,
    recommendations: recommendations.sort((a, b) => {
      const order = { immediate: 0, soon: 1, optional: 2 };
      return order[a.priority] - order[b.priority];
    }),
    confidence: clamp(confidence),
    confidenceLabel: confidenceLabel(confidence),
  };
}

// ---------------------------------------------------------------------------
// IP Reputation
// ---------------------------------------------------------------------------

export function scoreIPReputation(data: IPReputationResult): RiskScore {
  const base = data.abuseConfidenceScore;
  const reportBonus = data.totalReports > 50 ? 10 : data.totalReports > 10 ? 5 : 0;
  const raw = clamp(base + reportBonus);

  let explanation: string;
  if (raw < 20) {
    explanation = `${data.ipAddress} has a very low abuse confidence score (${data.abuseConfidenceScore}%) with ${data.totalReports} reports. No significant threat signals detected.`;
  } else if (raw < 40) {
    explanation = `${data.ipAddress} has a minor abuse confidence score (${data.abuseConfidenceScore}%) with ${data.totalReports} report(s). Monitor but no immediate action required.`;
  } else if (raw < 60) {
    explanation = `${data.ipAddress} carries a moderate abuse confidence score (${data.abuseConfidenceScore}%) with ${data.totalReports} report(s). Consider further investigation.`;
  } else if (raw < 80) {
    explanation = `${data.ipAddress} has a high abuse confidence score (${data.abuseConfidenceScore}%) with ${data.totalReports} report(s). This IP is likely associated with malicious activity.`;
  } else {
    explanation = `${data.ipAddress} has a critical abuse confidence score (${data.abuseConfidenceScore}%) with ${data.totalReports} report(s). This IP is actively used for attacks or spam.`;
  }

  const recs: RiskRecommendation[] = [];
  if (raw >= 80) {
    recs.push({ priority: "immediate", text: "Block this IP at your firewall or WAF immediately." });
    recs.push({ priority: "immediate", text: "Check server logs for any prior connections from this IP." });
  } else if (raw >= 60) {
    recs.push({ priority: "soon", text: "Add this IP to your watchlist and monitor for further activity." });
    recs.push({ priority: "soon", text: "Consider blocking this IP in your firewall rules." });
  } else if (raw >= 40) {
    recs.push({ priority: "soon", text: "Investigate the abuse reports to understand the nature of reported activity." });
  } else if (raw >= 20) {
    recs.push({ priority: "optional", text: "Monitor this IP passively; the risk level is minor." });
  } else {
    recs.push({ priority: "optional", text: "No action required. This IP appears clean." });
  }

  if (data.usageType === "Data Center/Web Hosting/Transit" && raw < 40) {
    recs.push({ priority: "optional", text: "This is a data-centre IP — typical for CDNs, APIs, and cloud services." });
  }

  const confidence = data.abuseConfidenceScore !== undefined ? 88 : 40;
  return buildScore(raw, confidence, explanation, recs);
}

// ---------------------------------------------------------------------------
// Domain Reputation
// ---------------------------------------------------------------------------

export function scoreDomainReputation(data: DomainReputationResult): RiskScore {
  const total = data.malicious + data.suspicious + data.harmless + data.undetected;
  let raw = 20;
  let confidence = 55;

  if (total > 0) {
    const maliciousRatio = (data.malicious / total) * 100;
    const suspiciousRatio = (data.suspicious / total) * 50;
    raw = clamp(maliciousRatio * 0.8 + suspiciousRatio * 0.2);
    confidence = Math.min(90, 50 + total * 0.5);
  }

  let explanation: string;
  if (raw < 20) {
    explanation = `${data.domain} is rated clean by all ${total} security vendors checked. No malicious or suspicious flags detected.`;
  } else if (raw < 40) {
    explanation = `${data.domain} has minor flags from ${data.suspicious} vendor(s) as suspicious out of ${total} checked.`;
  } else if (raw < 60) {
    explanation = `${data.domain} is flagged by ${data.suspicious} vendor(s) as suspicious and ${data.malicious} as malicious out of ${total} checked.`;
  } else {
    explanation = `${data.domain} is flagged malicious by ${data.malicious} out of ${total} security vendors. High threat confidence.`;
  }

  const recs: RiskRecommendation[] = [];
  if (data.malicious > 0) {
    recs.push({ priority: "immediate", text: "Do not visit or interact with this domain — multiple vendors flag it as malicious." });
    recs.push({ priority: "immediate", text: "Block this domain on your DNS resolver, firewall, or email gateway." });
  } else if (data.suspicious > 0) {
    recs.push({ priority: "soon", text: "Treat this domain with caution — it is flagged suspicious by some vendors." });
    recs.push({ priority: "soon", text: "Run a full URL analysis and check the domain's WHOIS registration date." });
  } else {
    recs.push({ priority: "optional", text: "Domain appears clean. Proceed with normal caution." });
  }

  return buildScore(raw, clamp(confidence), explanation, recs);
}

// ---------------------------------------------------------------------------
// Blacklist
// ---------------------------------------------------------------------------

export function scoreBlacklist(data: BlacklistResult): RiskScore {
  const raw = data.totalChecked > 0 ? (data.listedCount / data.totalChecked) * 100 : 0;
  const confidence = data.totalChecked >= 5 ? 92 : data.totalChecked >= 3 ? 70 : 40;

  const listedSources = data.entries.filter((e) => e.listed).map((e) => e.source);

  let explanation: string;
  if (data.listedCount === 0) {
    explanation = `${data.target} is not listed on any of the ${data.totalChecked} blacklist(s) checked. No spam or abuse history found.`;
  } else if (data.listedCount === 1) {
    explanation = `${data.target} appears on 1 out of ${data.totalChecked} blacklist(s): ${listedSources.join(", ")}.`;
  } else {
    explanation = `${data.target} is listed on ${data.listedCount} out of ${data.totalChecked} blacklist(s): ${listedSources.join(", ")}.`;
  }

  const recs: RiskRecommendation[] = [];
  if (data.listedCount >= 3) {
    recs.push({ priority: "immediate", text: "This target is widely blacklisted — block it immediately and investigate the source of the listings." });
    recs.push({ priority: "soon", text: "If this is your own IP/domain, submit delisting requests to each blacklist operator." });
  } else if (data.listedCount > 0) {
    recs.push({ priority: "soon", text: `Review the listing on ${listedSources.join(", ")} and investigate any associated sending activity.` });
    recs.push({ priority: "optional", text: "If this is your IP/domain, take corrective action and request delisting." });
  } else {
    recs.push({ priority: "optional", text: "No action required. Target is not blacklisted." });
  }

  return buildScore(clamp(raw), confidence, explanation, recs);
}

// ---------------------------------------------------------------------------
// SSL Certificate
// ---------------------------------------------------------------------------

export function scoreSSL(data: SSLCertificateResult): RiskScore {
  let raw = 0;
  const parts: string[] = [];

  if (data.daysRemaining <= 0) {
    raw += 60;
    parts.push("certificate is expired");
  } else if (data.daysRemaining <= 7) {
    raw += 45;
    parts.push(`certificate expires in ${data.daysRemaining} day(s)`);
  } else if (data.daysRemaining <= 30) {
    raw += 30;
    parts.push(`certificate expires in ${data.daysRemaining} days`);
  } else if (data.daysRemaining <= 90) {
    raw += 10;
    parts.push(`certificate expires in ${data.daysRemaining} days`);
  }

  const weakProtocols = ["SSLv2", "SSLv3", "TLSv1.0", "TLSv1.1"];
  if (weakProtocols.some((p) => data.protocol.startsWith(p))) {
    raw += 25;
    parts.push(`deprecated protocol in use (${data.protocol})`);
  }

  if (data.keySize > 0 && data.keySize < 2048 && !["ECDSA", "EdDSA"].includes(data.signatureAlgorithm)) {
    raw += 15;
    parts.push(`weak key size (${data.keySize}-bit)`);
  }

  const explanation =
    parts.length === 0
      ? `SSL certificate for ${data.domain} is valid for ${data.daysRemaining} days, uses ${data.protocol}, and shows no significant weaknesses.`
      : `SSL certificate for ${data.domain} has risk factors: ${parts.join("; ")}.`;

  const recs: RiskRecommendation[] = [];
  if (data.daysRemaining <= 0) {
    recs.push({ priority: "immediate", text: "Renew the SSL certificate immediately — it is expired and connections will be rejected or untrusted." });
  } else if (data.daysRemaining <= 30) {
    recs.push({ priority: "immediate", text: `Renew the SSL certificate within ${data.daysRemaining} days to avoid service disruption.` });
  } else if (data.daysRemaining <= 90) {
    recs.push({ priority: "soon", text: "Schedule SSL certificate renewal before it enters the critical window." });
  }
  if (weakProtocols.some((p) => data.protocol.startsWith(p))) {
    recs.push({ priority: "immediate", text: `Disable ${data.protocol} and configure TLS 1.2 or TLS 1.3 only.` });
  }
  if (data.keySize > 0 && data.keySize < 2048) {
    recs.push({ priority: "soon", text: "Reissue the certificate with at least a 2048-bit RSA key or an ECDSA P-256 key." });
  }
  if (recs.length === 0) {
    recs.push({ priority: "optional", text: "SSL certificate is healthy. Consider automating renewals with Let's Encrypt / ACME." });
  }

  return buildScore(clamp(raw), 95, explanation, recs);
}

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------

export function scoreSecurityHeaders(data: SecurityHeadersResult): RiskScore {
  const raw = clamp(100 - data.score);
  const missingHeaders = data.headers.filter((h) => !h.present).map((h) => h.name);
  const presentCount = data.headers.length - missingHeaders.length;

  let explanation: string;
  if (raw < 20) {
    explanation = `${data.domain} has excellent security header coverage (${presentCount}/${data.headers.length} headers present, grade ${data.grade}).`;
  } else if (raw < 40) {
    explanation = `${data.domain} is missing ${missingHeaders.length} security header(s) (grade ${data.grade}). Minor gaps in protection.`;
  } else if (raw < 60) {
    explanation = `${data.domain} is missing ${missingHeaders.length} security header(s) (grade ${data.grade}). Multiple protection gaps increase exposure to XSS and clickjacking.`;
  } else {
    explanation = `${data.domain} is missing ${missingHeaders.length} critical security headers (grade ${data.grade}). Significant exposure to client-side attacks.`;
  }

  const recs: RiskRecommendation[] = [];

  const criticalHeaders = ["Strict-Transport-Security", "Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options"];
  const missingCritical = missingHeaders.filter((h) => criticalHeaders.includes(h));

  if (missingCritical.length > 0) {
    recs.push({ priority: "soon", text: `Add the following critical headers: ${missingCritical.join(", ")}.` });
  }
  const remainingMissing = missingHeaders.filter((h) => !criticalHeaders.includes(h));
  if (remainingMissing.length > 0) {
    recs.push({ priority: "optional", text: `Consider adding these additional headers for defence-in-depth: ${remainingMissing.join(", ")}.` });
  }
  if (missingHeaders.length === 0) {
    recs.push({ priority: "optional", text: "All checked security headers are present. Periodically review CSP and Permissions-Policy directives." });
  }

  return buildScore(raw, 90, explanation, recs);
}

// ---------------------------------------------------------------------------
// DNS
// ---------------------------------------------------------------------------

export function scoreDNS(data: DNSResult): RiskScore {
  let raw = 0;
  const parts: string[] = [];

  if (data.records.length === 0) {
    raw += 15;
    parts.push("no DNS records found");
  }
  if (data.nameservers.length === 0) {
    raw += 10;
    parts.push("no nameservers listed");
  }

  const spfRecords = data.records.filter((r) => r.type === "TXT" && r.value.includes("v=spf1"));
  const dmarcRecords = data.records.filter((r) => r.type === "TXT" && r.value.includes("v=DMARC1"));

  if (spfRecords.length === 0 && data.records.some((r) => r.type === "MX")) {
    raw += 15;
    parts.push("MX records present but no SPF TXT record found");
  }
  if (dmarcRecords.length === 0 && data.records.some((r) => r.type === "MX")) {
    raw += 10;
    parts.push("no DMARC policy found");
  }

  const explanation =
    parts.length === 0
      ? `DNS records for ${data.domain} look normal — records found, nameservers configured.`
      : `DNS review for ${data.domain} flagged: ${parts.join("; ")}.`;

  const recs: RiskRecommendation[] = [];
  if (!data.records.some((r) => r.type === "MX")) {
    recs.push({ priority: "optional", text: "No MX records — if this domain sends email, add MX records and configure SPF/DMARC." });
  } else {
    if (spfRecords.length === 0) {
      recs.push({ priority: "soon", text: "Add an SPF TXT record to prevent email spoofing from this domain." });
    }
    if (dmarcRecords.length === 0) {
      recs.push({ priority: "soon", text: "Add a DMARC policy (v=DMARC1) to protect against domain impersonation." });
    }
  }
  if (recs.length === 0) {
    recs.push({ priority: "optional", text: "DNS configuration appears standard. Regularly audit records for unwanted changes." });
  }

  return buildScore(clamp(raw), 70, explanation, recs);
}

// ---------------------------------------------------------------------------
// WHOIS
// ---------------------------------------------------------------------------

export function scoreWHOIS(data: WHOISResult): RiskScore {
  let raw = 0;
  const parts: string[] = [];

  const ageMs = Date.now() - new Date(data.createdDate).getTime();
  const ageDays = ageMs / 86_400_000;

  if (!isNaN(ageDays)) {
    if (ageDays < 30) {
      raw += 50;
      parts.push("domain registered less than 30 days ago");
    } else if (ageDays < 90) {
      raw += 30;
      parts.push("domain registered less than 90 days ago");
    } else if (ageDays < 365) {
      raw += 15;
      parts.push("domain registered less than 1 year ago");
    }
  }

  const expiryMs = new Date(data.expiryDate).getTime() - Date.now();
  const expiryDays = expiryMs / 86_400_000;
  if (!isNaN(expiryDays) && expiryDays < 30 && expiryDays > 0) {
    raw += 20;
    parts.push(`domain expires in ${Math.round(expiryDays)} days`);
  }

  if (!data.dnssec) {
    raw += 10;
    parts.push("DNSSEC not enabled");
  }

  const explanation =
    parts.length === 0
      ? `${data.domain} has an established registration history and no expiry concerns.`
      : `WHOIS review for ${data.domain}: ${parts.join("; ")}.`;

  const recs: RiskRecommendation[] = [];
  if (ageDays < 30) {
    recs.push({ priority: "immediate", text: "Treat newly registered domains with extreme caution — they are commonly used in phishing campaigns." });
  } else if (ageDays < 90) {
    recs.push({ priority: "soon", text: "This domain is relatively new. Verify legitimacy before trusting it with sensitive data." });
  }
  if (!isNaN(expiryDays) && expiryDays < 30 && expiryDays > 0) {
    recs.push({ priority: "immediate", text: "Renew the domain registration before it expires to prevent domain hijacking." });
  }
  if (!data.dnssec) {
    recs.push({ priority: "optional", text: "Enable DNSSEC at your registrar to protect against DNS spoofing attacks." });
  }
  if (recs.length === 0) {
    recs.push({ priority: "optional", text: "Domain registration appears healthy. Set up auto-renewal to avoid accidental expiry." });
  }

  return buildScore(clamp(raw), 75, explanation, recs);
}

// ---------------------------------------------------------------------------
// Email Headers
// ---------------------------------------------------------------------------

export function scoreEmailHeaders(data: EmailHeaderResult): RiskScore {
  let raw = 0;
  const parts: string[] = [];

  if (!data.spf.present) { raw += 20; parts.push("SPF record missing"); }
  else if (!data.spf.pass) { raw += 30; parts.push(`SPF failed (${data.spf.result ?? "unknown"})`); }

  if (!data.dkim.present) { raw += 20; parts.push("DKIM signature missing"); }
  else if (!data.dkim.pass) { raw += 30; parts.push(`DKIM failed (${data.dkim.result ?? "unknown"})`); }

  if (!data.dmarc.present) { raw += 20; parts.push("DMARC policy missing"); }
  else if (!data.dmarc.pass) { raw += 25; parts.push(`DMARC failed (policy: ${data.dmarc.policy ?? "unknown"})`); }

  raw += Math.min(data.suspiciousIndicators.length * 10, 30);
  if (data.suspiciousIndicators.length > 0) {
    parts.push(`${data.suspiciousIndicators.length} suspicious indicator(s)`);
  }

  const explanation =
    parts.length === 0
      ? "Email headers passed all authentication checks (SPF, DKIM, DMARC). No suspicious indicators found."
      : `Email authentication issues detected: ${parts.join("; ")}.`;

  const recs: RiskRecommendation[] = [];
  if (!data.spf.pass) {
    recs.push({ priority: data.spf.present ? "immediate" : "soon", text: data.spf.present ? "Investigate SPF failure — the sending IP may not be authorised." : "Add an SPF record to your DNS to reduce spoofing risk." });
  }
  if (!data.dkim.pass) {
    recs.push({ priority: data.dkim.present ? "immediate" : "soon", text: data.dkim.present ? "Investigate DKIM failure — the signature may have been tampered with." : "Configure DKIM signing on your mail server." });
  }
  if (!data.dmarc.pass) {
    recs.push({ priority: data.dmarc.present ? "soon" : "optional", text: data.dmarc.present ? "Check DMARC alignment — SPF/DKIM may not align with the From header." : "Publish a DMARC policy record (start with p=none to monitor)." });
  }
  if (data.suspiciousIndicators.length > 0) {
    recs.push({ priority: "immediate", text: `Review suspicious indicators: ${data.suspiciousIndicators.join("; ")}.` });
  }
  if (recs.length === 0) {
    recs.push({ priority: "optional", text: "Email authentication is fully configured. No action required." });
  }

  return buildScore(clamp(raw), 82, explanation, recs);
}

// ---------------------------------------------------------------------------
// Open Ports
// ---------------------------------------------------------------------------

// Ports that significantly increase exposure when open
const HIGH_RISK_PORTS = new Set([21, 23, 25, 111, 135, 139, 445, 1433, 1521, 3389, 5900, 6379, 27017]);
const MEDIUM_RISK_PORTS = new Set([22, 3306, 5432, 8080, 8443]);

export function scoreOpenPorts(data: OpenPortsResult): RiskScore {
  const openPorts = data.ports.filter((p) => p.state === "open");
  let raw = Math.min(openPorts.length * 5, 25);
  const highRisk = openPorts.filter((p) => HIGH_RISK_PORTS.has(p.port));
  const mediumRisk = openPorts.filter((p) => MEDIUM_RISK_PORTS.has(p.port));

  raw += highRisk.length * 20;
  raw += mediumRisk.length * 8;

  const parts: string[] = [];
  if (highRisk.length > 0) {
    parts.push(`high-risk port(s) open: ${highRisk.map((p) => `${p.port}/${p.service}`).join(", ")}`);
  }
  if (mediumRisk.length > 0) {
    parts.push(`elevated-risk port(s) open: ${mediumRisk.map((p) => `${p.port}/${p.service}`).join(", ")}`);
  }

  const explanation =
    openPorts.length === 0
      ? `No open ports detected on ${data.target}. Attack surface is minimal.`
      : parts.length > 0
        ? `${data.openCount} open port(s) on ${data.target}, including ${parts.join("; ")}.`
        : `${data.openCount} open port(s) detected on ${data.target}. No critically exposed services found.`;

  const recs: RiskRecommendation[] = [];
  if (highRisk.some((p) => p.port === 3389)) {
    recs.push({ priority: "immediate", text: "RDP (port 3389) is open to the internet — restrict access via firewall rules or VPN. This is a prime ransomware vector." });
  }
  if (highRisk.some((p) => p.port === 445)) {
    recs.push({ priority: "immediate", text: "SMB (port 445) is exposed — block this port at your perimeter firewall immediately to prevent lateral movement." });
  }
  if (highRisk.some((p) => p.port === 23)) {
    recs.push({ priority: "immediate", text: "Telnet (port 23) is open — disable Telnet and use SSH instead. Telnet transmits credentials in plaintext." });
  }
  if (highRisk.some((p) => p.port === 6379)) {
    recs.push({ priority: "immediate", text: "Redis (port 6379) appears publicly accessible — bind to localhost or add authentication to prevent data theft." });
  }
  if (mediumRisk.some((p) => p.port === 22)) {
    recs.push({ priority: "soon", text: "SSH (port 22) is open — disable password authentication and use key-based auth only. Consider changing the port." });
  }
  if (openPorts.length > 10) {
    recs.push({ priority: "soon", text: "A large number of ports are open — audit and close any services that are not required." });
  }
  if (recs.length === 0 && openPorts.length > 0) {
    recs.push({ priority: "optional", text: "No high-risk ports detected. Regularly audit open ports and restrict access using firewall rules." });
  }
  if (openPorts.length === 0) {
    recs.push({ priority: "optional", text: "No open ports found. Keep monitoring for service changes." });
  }

  return buildScore(clamp(raw), 87, explanation, recs);
}

// ---------------------------------------------------------------------------
// Redirect Trace
// ---------------------------------------------------------------------------

export function scoreRedirectTrace(data: RedirectTraceResult): RiskScore {
  let raw = 10;
  const parts: string[] = [];

  if (data.isSuspicious) {
    raw += 50;
    parts.push(...data.suspiciousReasons);
  }
  if (data.hopCount > 5) {
    raw += 15;
    parts.push(`${data.hopCount} redirect hops (unusually long chain)`);
  }
  const suspiciousHopCount = data.hops.filter((h) => h.isSuspicious).length;
  if (suspiciousHopCount > 0) {
    raw += suspiciousHopCount * 10;
    parts.push(`${suspiciousHopCount} suspicious hop(s) in chain`);
  }

  const explanation =
    parts.length === 0
      ? `Redirect chain for ${data.originalUrl} resolved to ${data.finalUrl} in ${data.hopCount} hop(s) with no suspicious indicators.`
      : `Redirect analysis flagged issues for ${data.originalUrl}: ${parts.join("; ")}.`;

  const recs: RiskRecommendation[] = [];
  if (data.isSuspicious) {
    recs.push({ priority: "immediate", text: "Do not proceed to the final URL — the redirect chain shows suspicious patterns." });
    recs.push({ priority: "soon", text: "Report this URL to your browser's safe-browsing protection or a threat intel service." });
  } else if (data.hopCount > 5) {
    recs.push({ priority: "soon", text: "Long redirect chains are often used to obscure the final destination — verify the final URL independently." });
  }
  if (recs.length === 0) {
    recs.push({ priority: "optional", text: "Redirect chain appears normal. Always verify the final destination before submitting credentials." });
  }

  return buildScore(clamp(raw), 90, explanation, recs);
}

// ---------------------------------------------------------------------------
// URL Analysis
// ---------------------------------------------------------------------------

export function scoreURLAnalysis(data: URLAnalysisResult): RiskScore {
  const total = data.malicious + data.suspicious + data.harmless + data.undetected;
  let raw = 10;
  let confidence = 60;

  if (total > 0) {
    const maliciousRatio = (data.malicious / total) * 100;
    const suspiciousRatio = (data.suspicious / total) * 50;
    raw = clamp(maliciousRatio * 0.85 + suspiciousRatio * 0.2 + (data.threatNames.length > 0 ? 10 : 0));
    confidence = Math.min(92, 55 + total * 0.5);
  }

  if (data.redirectChain.length > 3) {
    raw = clamp(raw + 10);
  }

  let explanation: string;
  if (raw < 20) {
    explanation = `${data.url} is rated clean by security vendors. ${total > 0 ? `${data.harmless} out of ${total} vendors marked it harmless.` : ""}`;
  } else if (data.malicious > 0) {
    explanation = `${data.url} is flagged as malicious by ${data.malicious} out of ${total} vendors. Threat names: ${data.threatNames.join(", ") || "unspecified"}.`;
  } else {
    explanation = `${data.url} is flagged suspicious by ${data.suspicious} out of ${total} vendors.`;
  }

  const recs: RiskRecommendation[] = [];
  if (data.malicious > 0) {
    recs.push({ priority: "immediate", text: "Do not visit this URL — it is flagged malicious by multiple security vendors." });
    recs.push({ priority: "immediate", text: "Block this URL and its domain in your firewall, proxy, or DNS filter." });
  } else if (data.suspicious > 0) {
    recs.push({ priority: "soon", text: "Treat this URL with caution — some vendors flagged it as suspicious." });
    recs.push({ priority: "optional", text: "Run a WHOIS and domain reputation check to investigate further." });
  } else {
    recs.push({ priority: "optional", text: "URL appears safe. Always verify the source before clicking links in emails." });
  }

  return buildScore(raw, clamp(confidence), explanation, recs);
}

// ---------------------------------------------------------------------------
// Phone Number
// ---------------------------------------------------------------------------

export function scorePhone(data: PhoneResult): RiskScore {
  let raw = 0;

  for (const flag of data.flags) {
    if (flag.severity === "high") raw += 40;
    else if (flag.severity === "warning") raw += 20;
    else raw += 5;
  }

  if (data.numberType === "premium-rate") raw += 30;
  if (data.numberType === "voip") raw += 10;

  const flagLabels = data.flags.map((f) => f.label);
  let explanation: string;
  if (raw < 20) {
    explanation = `${data.e164 ?? data.raw} is a ${data.numberType} number in ${data.country ?? "an unknown country"} with no significant risk flags.`;
  } else {
    explanation = `${data.e164 ?? data.raw} has risk flags: ${flagLabels.join("; ")}. Number type: ${data.numberType}.`;
  }

  const recs: RiskRecommendation[] = [];
  if (data.numberType === "premium-rate") {
    recs.push({ priority: "immediate", text: "Premium-rate numbers can incur unexpected charges — do not call back without verification." });
  }
  if (data.flags.some((f) => f.severity === "high")) {
    recs.push({ priority: "soon", text: "High-severity risk flags were found — treat communications from this number with extreme caution." });
  }
  if (data.numberType === "voip") {
    recs.push({ priority: "optional", text: "VoIP numbers can be easily spoofed — verify the caller's identity through an alternative channel." });
  }
  if (recs.length === 0) {
    recs.push({ priority: "optional", text: "No significant risk flags. Exercise standard caution with unknown callers." });
  }

  return buildScore(clamp(raw), 72, explanation, recs);
}

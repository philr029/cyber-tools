/**
 * Analysis Agent — reviews Recon data, detects anomalies, and produces
 * structured findings for the Risk Agent.
 *
 * Detects:
 *  - Suspicious / malicious domain indicators
 *  - Invalid or missing SPF / DKIM (from DNS TXT records)
 *  - Risky open ports
 *  - Blacklist hits
 *  - SSL certificate issues
 *  - Newly registered / recently expired domains
 */

import type { ReconData, AnalysisData, Anomaly } from "./agentTypes";

const RISKY_PORTS = [21, 23, 25, 110, 135, 139, 143, 389, 445, 1433, 1521, 3306, 3389, 5432, 5900];

function parseDomainAge(createdDate: string | undefined): number | null {
  if (!createdDate || createdDate === "Unknown" || createdDate === "N/A") return null;
  try {
    const d = new Date(createdDate);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86_400_000);
  } catch {
    return null;
  }
}

function detectSpfFromDns(recon: ReconData): "pass" | "fail" | "missing" | "unknown" {
  const txtRecords = recon.lookupResult.dns.records.filter((r) => r.type === "TXT");
  if (txtRecords.length === 0) return "unknown";
  const spfRecord = txtRecords.find((r) => r.value.toLowerCase().startsWith("v=spf1"));
  if (!spfRecord) return "missing";
  // Simple heuristic: -all = strict pass, ~all = softfail, +all = permissive (fail)
  if (spfRecord.value.includes("+all")) return "fail";
  if (spfRecord.value.includes("-all") || spfRecord.value.includes("~all")) return "pass";
  return "pass";
}

function detectDkimFromDns(recon: ReconData): "pass" | "fail" | "missing" | "unknown" {
  const txtRecords = recon.lookupResult.dns.records.filter((r) => r.type === "TXT");
  if (txtRecords.length === 0) return "unknown";
  const dkimRecord = txtRecords.find(
    (r) => r.value.toLowerCase().includes("v=dkim1") || r.value.toLowerCase().includes("p="),
  );
  return dkimRecord ? "pass" : "missing";
}

export function runAnalysisAgent(recon: ReconData): AnalysisData {
  const anomalies: Anomaly[] = [];
  const lr = recon.lookupResult;

  // --- IP reputation ---
  const abuseScore = lr.ipReputation.abuseConfidenceScore;
  if (abuseScore >= 50) {
    anomalies.push({
      type: "HIGH_ABUSE_SCORE",
      description: `IP abuse confidence score is ${abuseScore}% — flagged by multiple threat sources.`,
      severity: "critical",
    });
  } else if (abuseScore >= 10) {
    anomalies.push({
      type: "MODERATE_ABUSE_SCORE",
      description: `IP abuse confidence score is ${abuseScore}% — some suspicious activity reported.`,
      severity: "warning",
    });
  }

  // --- Domain reputation ---
  if (lr.domainReputation.malicious > 0) {
    anomalies.push({
      type: "MALICIOUS_DOMAIN",
      description: `Domain flagged as malicious by ${lr.domainReputation.malicious} security vendor(s).`,
      severity: "critical",
    });
  } else if (lr.domainReputation.suspicious > 0) {
    anomalies.push({
      type: "SUSPICIOUS_DOMAIN",
      description: `Domain flagged as suspicious by ${lr.domainReputation.suspicious} vendor(s).`,
      severity: "warning",
    });
  }

  // --- Blacklist ---
  const listed = lr.blacklist.listedCount;
  const blacklistStatus: "clean" | "listed" = listed > 0 ? "listed" : "clean";
  if (listed > 2) {
    anomalies.push({
      type: "MULTIPLE_BLACKLIST_HITS",
      description: `Listed on ${listed} of ${lr.blacklist.totalChecked} blacklists — high risk.`,
      severity: "critical",
    });
  } else if (listed > 0) {
    anomalies.push({
      type: "BLACKLIST_HIT",
      description: `Listed on ${listed} blacklist(s) — may affect email deliverability or domain reputation.`,
      severity: "warning",
    });
  }

  // --- SSL certificate ---
  let sslStatus: AnalysisData["sslStatus"] = "valid";
  const daysRemaining = lr.ssl.daysRemaining;
  if (daysRemaining < 0) {
    sslStatus = "expired";
    anomalies.push({
      type: "SSL_EXPIRED",
      description: `SSL certificate expired ${Math.abs(daysRemaining)} day(s) ago.`,
      severity: "critical",
    });
  } else if (daysRemaining < 14) {
    sslStatus = "expiring";
    anomalies.push({
      type: "SSL_EXPIRING_SOON",
      description: `SSL certificate expires in ${daysRemaining} day(s).`,
      severity: "critical",
    });
  } else if (daysRemaining < 30) {
    sslStatus = "expiring";
    anomalies.push({
      type: "SSL_EXPIRING",
      description: `SSL certificate expires in ${daysRemaining} day(s).`,
      severity: "warning",
    });
  } else if (lr.ssl.status === "unknown") {
    sslStatus = "missing";
  }

  // --- Security headers ---
  const headerScore = lr.securityHeaders.score;
  if (headerScore < 40) {
    anomalies.push({
      type: "CRITICAL_HEADERS_MISSING",
      description: `Security headers score ${headerScore}/100 (grade ${lr.securityHeaders.grade}) — critical protections missing.`,
      severity: "critical",
    });
  } else if (headerScore < 70) {
    anomalies.push({
      type: "HEADERS_INCOMPLETE",
      description: `Security headers score ${headerScore}/100 — some recommended headers absent.`,
      severity: "warning",
    });
  }

  // --- Risky open ports ---
  const openPorts = lr.openPorts.ports.filter((p) => p.state === "open").map((p) => p.port);
  const openRiskyPorts = openPorts.filter((p) => RISKY_PORTS.includes(p));
  if (openRiskyPorts.length > 0) {
    anomalies.push({
      type: "RISKY_PORTS_OPEN",
      description: `Risky ports open: ${openRiskyPorts.join(", ")} — may expose sensitive services.`,
      severity: "warning",
    });
  }

  // --- SPF / DKIM (domain queries only) ---
  const spfStatus = recon.queryType === "domain" ? detectSpfFromDns(recon) : "unknown";
  const dkimStatus = recon.queryType === "domain" ? detectDkimFromDns(recon) : "unknown";

  if (spfStatus === "missing") {
    anomalies.push({
      type: "SPF_MISSING",
      description: "No SPF record found in DNS — domain may be spoofable in email.",
      severity: "warning",
    });
  } else if (spfStatus === "fail") {
    anomalies.push({
      type: "SPF_PERMISSIVE",
      description: "SPF record uses '+all' (allow any sender) — extremely permissive configuration.",
      severity: "critical",
    });
  }

  if (dkimStatus === "missing" && recon.queryType === "domain") {
    anomalies.push({
      type: "DKIM_MISSING",
      description: "No DKIM record detected in DNS — email authentication not enforced.",
      severity: "info",
    });
  }

  // --- Domain age (newly registered domains are higher risk) ---
  const createdDate = recon.whois?.createdDate ?? lr.domainReputation.createdDate;
  const domainAge = parseDomainAge(createdDate);

  if (domainAge !== null && domainAge < 30) {
    anomalies.push({
      type: "NEWLY_REGISTERED_DOMAIN",
      description: `Domain registered only ${domainAge} day(s) ago — newly registered domains are a common phishing indicator.`,
      severity: "warning",
    });
  }

  // --- No issues found ---
  if (anomalies.length === 0) {
    anomalies.push({
      type: "CLEAN",
      description: "No significant anomalies or threat indicators detected.",
      severity: "info",
    });
  }

  return {
    anomalies,
    hasMaliciousIndicators:
      lr.domainReputation.malicious > 0 ||
      abuseScore >= 50 ||
      listed > 2,
    hasSuspiciousIndicators:
      lr.domainReputation.suspicious > 0 ||
      abuseScore >= 10 ||
      listed > 0,
    spfStatus,
    dkimStatus,
    sslStatus,
    blacklistStatus,
    openRiskyPorts,
    domainAge,
  };
}

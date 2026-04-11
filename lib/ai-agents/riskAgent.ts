/**
 * Risk Agent — computes a numeric risk score (0–100) and classifies the
 * target as Safe / Low / Medium / High / Critical.
 *
 * Each factor contributes a defined number of points; the total is capped at
 * 100. The explanation is built from the contributing factors so the user
 * always knows WHY a given score was assigned.
 */

import type { ReconData, AnalysisData, RiskData, RiskFactor, RiskLevel } from "./agentTypes";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function scoreToLevel(score: number): RiskLevel {
  if (score <= 10) return "Safe";
  if (score <= 30) return "Low";
  if (score <= 55) return "Medium";
  if (score <= 80) return "High";
  return "Critical";
}

function levelReasoning(level: RiskLevel): string {
  switch (level) {
    case "Safe":
      return "No significant threat indicators detected. This target appears clean across all checked categories.";
    case "Low":
      return "Minor issues detected but nothing immediately dangerous. Monitor periodically.";
    case "Medium":
      return "Several suspicious signals present. Investigate before trusting this target.";
    case "High":
      return "Multiple high-severity indicators detected. Treat this target with caution and investigate immediately.";
    case "Critical":
      return "Confirmed malicious indicators present. Block or isolate this target immediately.";
  }
}

export function runRiskAgent(recon: ReconData, analysis: AnalysisData): RiskData {
  const factors: RiskFactor[] = [];
  let total = 0;

  const lr = recon.lookupResult;

  // --- IP abuse score (max 35 pts) ---
  const abuse = lr.ipReputation.abuseConfidenceScore;
  if (abuse > 0) {
    const pts = clamp(Math.round((abuse / 100) * 35), 0, 35);
    factors.push({
      name: "IP Abuse Confidence",
      contribution: pts,
      detail: `AbuseIPDB confidence score: ${abuse}% → +${pts} pts`,
    });
    total += pts;
  }

  // --- Domain malicious vendors (max 40 pts) ---
  const malicious = lr.domainReputation.malicious;
  const suspicious = lr.domainReputation.suspicious;
  if (malicious > 0) {
    const pts = clamp(malicious * 10, 0, 40);
    factors.push({
      name: "Domain Malicious Flags",
      contribution: pts,
      detail: `${malicious} vendor(s) classified this domain as malicious → +${pts} pts`,
    });
    total += pts;
  }
  if (suspicious > 0) {
    const pts = clamp(suspicious * 5, 0, 20);
    factors.push({
      name: "Domain Suspicious Flags",
      contribution: pts,
      detail: `${suspicious} vendor(s) classified this domain as suspicious → +${pts} pts`,
    });
    total += pts;
  }

  // --- Blacklist hits (max 25 pts) ---
  const listed = lr.blacklist.listedCount;
  if (listed > 0) {
    const pts = clamp(listed * 8, 0, 25);
    factors.push({
      name: "Blacklist Listings",
      contribution: pts,
      detail: `Listed on ${listed} of ${lr.blacklist.totalChecked} blacklists → +${pts} pts`,
    });
    total += pts;
  }

  // --- SSL certificate (max 20 pts) ---
  if (analysis.sslStatus === "expired") {
    factors.push({
      name: "SSL Certificate Expired",
      contribution: 20,
      detail: "Expired SSL certificate — users see security warnings → +20 pts",
    });
    total += 20;
  } else if (analysis.sslStatus === "expiring") {
    const days = lr.ssl.daysRemaining;
    const pts = days < 7 ? 15 : 8;
    factors.push({
      name: "SSL Certificate Expiring",
      contribution: pts,
      detail: `Certificate expires in ${days} day(s) → +${pts} pts`,
    });
    total += pts;
  }

  // --- Security headers (max 15 pts) ---
  const headerScore = lr.securityHeaders.score;
  if (headerScore < 40) {
    factors.push({
      name: "Critical Headers Missing",
      contribution: 15,
      detail: `Security header score ${headerScore}/100 — critical protections absent → +15 pts`,
    });
    total += 15;
  } else if (headerScore < 70) {
    factors.push({
      name: "Incomplete Security Headers",
      contribution: 7,
      detail: `Security header score ${headerScore}/100 — some headers missing → +7 pts`,
    });
    total += 7;
  }

  // --- Risky open ports (max 15 pts) ---
  if (analysis.openRiskyPorts.length > 0) {
    const pts = clamp(analysis.openRiskyPorts.length * 5, 0, 15);
    factors.push({
      name: "Risky Open Ports",
      contribution: pts,
      detail: `Ports ${analysis.openRiskyPorts.join(", ")} open → +${pts} pts`,
    });
    total += pts;
  }

  // --- SPF issues (max 10 pts) ---
  if (analysis.spfStatus === "missing") {
    factors.push({
      name: "Missing SPF Record",
      contribution: 8,
      detail: "No SPF record — domain can be spoofed in email → +8 pts",
    });
    total += 8;
  } else if (analysis.spfStatus === "fail") {
    factors.push({
      name: "Permissive SPF Record",
      contribution: 10,
      detail: "SPF uses '+all' — any server can send as this domain → +10 pts",
    });
    total += 10;
  }

  // --- Newly registered domain (max 10 pts) ---
  if (analysis.domainAge !== null && analysis.domainAge < 30) {
    const pts = analysis.domainAge < 7 ? 10 : 5;
    factors.push({
      name: "Newly Registered Domain",
      contribution: pts,
      detail: `Domain is only ${analysis.domainAge} day(s) old → +${pts} pts`,
    });
    total += pts;
  }

  const score = clamp(total, 0, 100);
  const level = scoreToLevel(score);

  return {
    score,
    level,
    factors,
    reasoning: levelReasoning(level),
  };
}

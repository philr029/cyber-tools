/**
 * Explanation Agent — converts technical findings into plain English.
 *
 * Produces three output modes:
 *  1. `summary`          — single-sentence headline
 *  2. `technicalDetails` — bullet points for security analysts
 *  3. `plainEnglish`     — for non-technical users
 *  4. `forMarketing`     — for management / marketing teams
 */

import type { ReconData, AnalysisData, RiskData, ExplanationData } from "./agentTypes";

function riskEmoji(level: RiskData["level"]): string {
  switch (level) {
    case "Safe":     return "✅";
    case "Low":      return "🟢";
    case "Medium":   return "🟡";
    case "High":     return "🟠";
    case "Critical": return "🔴";
  }
}

export function runExplanationAgent(
  recon: ReconData,
  analysis: AnalysisData,
  risk: RiskData,
): ExplanationData {
  const { query } = recon;
  const { score, level, factors } = risk;
  const criticalCount = analysis.anomalies.filter((a) => a.severity === "critical").length;
  const warningCount  = analysis.anomalies.filter((a) => a.severity === "warning").length;
  const emoji = riskEmoji(level);

  // --- 1. One-sentence summary ---
  const summary =
    criticalCount > 0
      ? `${emoji} ${query} has ${criticalCount} critical security issue(s) — risk score ${score}/100 (${level}).`
      : warningCount > 0
        ? `${emoji} ${query} has ${warningCount} warning(s) — risk score ${score}/100 (${level}).`
        : `${emoji} ${query} appears clean — risk score ${score}/100 (${level}).`;

  // --- 2. Technical bullet points ---
  const technicalDetails: string[] = [];

  if (factors.length > 0) {
    technicalDetails.push("Risk score breakdown:");
    for (const f of factors) {
      technicalDetails.push(`  • ${f.name}: ${f.detail}`);
    }
  }

  const criticals = analysis.anomalies.filter((a) => a.severity === "critical");
  const warnings  = analysis.anomalies.filter((a) => a.severity === "warning");

  if (criticals.length > 0) {
    technicalDetails.push("Critical findings:");
    for (const a of criticals) technicalDetails.push(`  • [${a.type}] ${a.description}`);
  }

  if (warnings.length > 0) {
    technicalDetails.push("Warnings:");
    for (const a of warnings) technicalDetails.push(`  • [${a.type}] ${a.description}`);
  }

  if (recon.subdomains?.totalFound) {
    technicalDetails.push(
      `Subdomain enumeration found ${recon.subdomains.totalFound} subdomain(s).`,
    );
  }

  if (technicalDetails.length === 0) {
    technicalDetails.push("All checked categories came back clean.");
  }

  // --- 3. Plain English (for non-technical users) ---
  let plainEnglish: string;
  if (level === "Safe") {
    plainEnglish =
      `We checked "${query}" across multiple security databases and found no problems. ` +
      `It looks safe to use. Keep monitoring it periodically.`;
  } else if (level === "Low") {
    plainEnglish =
      `"${query}" has a few minor issues, but nothing that looks immediately dangerous. ` +
      `Think of it like a minor parking ticket — worth addressing, but not urgent.`;
  } else if (level === "Medium") {
    plainEnglish =
      `"${query}" has raised several warning flags. Imagine getting an amber traffic light — ` +
      `you can still proceed, but you should slow down and investigate before fully trusting it.`;
  } else if (level === "High") {
    plainEnglish =
      `"${query}" has serious security issues. Multiple threat databases have flagged it. ` +
      `You should avoid interacting with it until a thorough investigation is complete.`;
  } else {
    plainEnglish =
      `"${query}" is confirmed dangerous. It has been identified as malicious or highly abusive ` +
      `by security systems. Block it immediately and investigate any past interactions.`;
  }

  // --- 4. For marketing / management ---
  const issueCount = criticalCount + warningCount;
  let forMarketing: string;
  if (level === "Safe") {
    forMarketing =
      `Security scan for "${query}" completed with no significant findings. ` +
      `Risk rating: Safe (${score}/100). No action required at this time.`;
  } else {
    forMarketing =
      `Security scan for "${query}" identified ${issueCount} issue(s). ` +
      `Risk rating: ${level} (${score}/100). ` +
      (criticalCount > 0
        ? `${criticalCount} critical issue(s) require immediate attention. `
        : "") +
      `IT review recommended before any business interaction with this target.`;
  }

  return { summary, technicalDetails, plainEnglish, forMarketing };
}

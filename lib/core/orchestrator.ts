/**
 * Orchestrator — runs the 6 agents in sequence, passing data between them,
 * and emits granular progress updates so the UI can display live status.
 *
 * Flow: Input → Recon → Analysis → Risk → Explanation → Action → Log
 */

import { runReconAgent }        from "@/lib/ai-agents/reconAgent";
import { runAnalysisAgent }     from "@/lib/ai-agents/analysisAgent";
import { runRiskAgent }         from "@/lib/ai-agents/riskAgent";
import { runExplanationAgent }  from "@/lib/ai-agents/explanationAgent";
import { runActionAgent }       from "@/lib/ai-agents/actionAgent";
import { runLoggingAgent }      from "@/lib/ai-agents/loggingAgent";

import type {
  AgentProgress,
  AgentScanResult,
} from "@/lib/ai-agents/agentTypes";

export type ProgressCallback = (progress: AgentProgress[]) => void;

const AGENTS: Array<{ id: string; name: string; emoji: string }> = [
  { id: "recon",       name: "Recon Agent",       emoji: "🕵️" },
  { id: "analysis",    name: "Analysis Agent",    emoji: "🔍" },
  { id: "risk",        name: "Risk Agent",        emoji: "⚠️" },
  { id: "explanation", name: "Explanation Agent", emoji: "🧠" },
  { id: "action",      name: "Action Agent",      emoji: "🛠️" },
  { id: "logging",     name: "Logging Agent",     emoji: "📊" },
];

function initialProgress(): AgentProgress[] {
  return AGENTS.map((a) => ({
    agentId: a.id,
    agentName: a.name,
    emoji: a.emoji,
    status: "idle",
    message: "Waiting…",
    timestamp: Date.now(),
  }));
}

function updateAgent(
  progress: AgentProgress[],
  id: string,
  status: AgentProgress["status"],
  message: string,
): AgentProgress[] {
  return progress.map((p) =>
    p.agentId === id ? { ...p, status, message, timestamp: Date.now() } : p,
  );
}

/** Simulate human-like scanning delay */
function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runAgentPipeline(
  query: string,
  onProgress: ProgressCallback,
): Promise<AgentScanResult> {
  const startTime = Date.now();
  const terminalLog: string[] = [];

  const log = (line: string) => {
    terminalLog.push(`[${new Date().toISOString()}] ${line}`);
  };

  let progress = initialProgress();
  onProgress(progress);

  // ---------------------------------------------------------------------------
  // 1. RECON AGENT
  // ---------------------------------------------------------------------------
  progress = updateAgent(progress, "recon", "running", "Gathering intelligence data…");
  onProgress(progress);
  log(`[RECON] Starting intelligence gathering for: ${query}`);
  await pause(400);

  const recon = await runReconAgent(query);

  log(`[RECON] Query type detected: ${recon.queryType}`);
  log(`[RECON] Lookup complete — ${Object.keys(recon.lookupResult).length} data points collected`);
  if (recon.whois) log(`[RECON] WHOIS data retrieved`);
  if (recon.subdomains) log(`[RECON] Subdomains found: ${recon.subdomains.totalFound}`);

  progress = updateAgent(progress, "recon", "complete", "Intelligence gathered ✓");
  onProgress(progress);
  await pause(300);

  // ---------------------------------------------------------------------------
  // 2. ANALYSIS AGENT
  // ---------------------------------------------------------------------------
  progress = updateAgent(progress, "analysis", "running", "Detecting anomalies…");
  onProgress(progress);
  log(`[ANALYSIS] Analysing gathered data for anomalies…`);
  await pause(350);

  const analysis = runAnalysisAgent(recon);

  const criticalCount = analysis.anomalies.filter((a) => a.severity === "critical").length;
  const warningCount  = analysis.anomalies.filter((a) => a.severity === "warning").length;

  log(`[ANALYSIS] SPF: ${analysis.spfStatus} | DKIM: ${analysis.dkimStatus} | SSL: ${analysis.sslStatus}`);
  log(`[ANALYSIS] Found ${criticalCount} critical and ${warningCount} warning anomalies`);
  log(`[ANALYSIS] Blacklist status: ${analysis.blacklistStatus}`);

  progress = updateAgent(
    progress,
    "analysis",
    "complete",
    `${analysis.anomalies.length} finding(s) detected ✓`,
  );
  onProgress(progress);
  await pause(300);

  // ---------------------------------------------------------------------------
  // 3. RISK AGENT
  // ---------------------------------------------------------------------------
  progress = updateAgent(progress, "risk", "running", "Computing risk score…");
  onProgress(progress);
  log(`[RISK] Calculating composite risk score…`);
  await pause(300);

  const risk = runRiskAgent(recon, analysis);

  log(`[RISK] Score: ${risk.score}/100 — Level: ${risk.level}`);
  log(`[RISK] ${risk.factors.length} scoring factor(s) applied`);
  log(`[RISK] ${risk.reasoning}`);

  progress = updateAgent(
    progress,
    "risk",
    "complete",
    `Score: ${risk.score}/100 — ${risk.level} ✓`,
  );
  onProgress(progress);
  await pause(300);

  // ---------------------------------------------------------------------------
  // 4. EXPLANATION AGENT
  // ---------------------------------------------------------------------------
  progress = updateAgent(progress, "explanation", "running", "Generating plain-English summary…");
  onProgress(progress);
  log(`[EXPLANATION] Translating technical findings into plain language…`);
  await pause(350);

  const explanation = runExplanationAgent(recon, analysis, risk);

  log(`[EXPLANATION] Summary: ${explanation.summary}`);

  progress = updateAgent(progress, "explanation", "complete", "Summary generated ✓");
  onProgress(progress);
  await pause(250);

  // ---------------------------------------------------------------------------
  // 5. ACTION AGENT
  // ---------------------------------------------------------------------------
  progress = updateAgent(progress, "action", "running", "Generating recommendations…");
  onProgress(progress);
  log(`[ACTION] Determining recommended actions…`);
  await pause(350);

  const actions = runActionAgent(recon, analysis, risk);

  log(`[ACTION] Verdict: ${actions.verdict.toUpperCase()}`);
  log(`[ACTION] ${actions.actions.length} action item(s) generated`);
  log(`[ACTION] ${actions.securityImprovements.length} security improvement(s) suggested`);

  progress = updateAgent(
    progress,
    "action",
    "complete",
    `Verdict: ${actions.verdict.toUpperCase()} — ${actions.actions.length} action(s) ✓`,
  );
  onProgress(progress);
  await pause(250);

  // ---------------------------------------------------------------------------
  // 6. LOGGING AGENT
  // ---------------------------------------------------------------------------
  progress = updateAgent(progress, "logging", "running", "Saving to intelligence log…");
  onProgress(progress);
  log(`[LOGGING] Persisting scan result to local intelligence store…`);
  await pause(200);

  const duration = Date.now() - startTime;
  const logEntry = runLoggingAgent(recon, analysis, risk, explanation, actions, duration);

  log(`[LOGGING] Saved with ID: ${logEntry.id}`);
  log(`[LOGGING] Total scan duration: ${duration}ms`);

  progress = updateAgent(progress, "logging", "complete", "Intelligence log updated ✓");
  onProgress(progress);

  log(`[ORCHESTRATOR] Pipeline complete — all 6 agents finished successfully`);

  return {
    query,
    recon,
    analysis,
    risk,
    explanation,
    actions,
    logEntry,
    duration,
    terminalLog,
  };
}

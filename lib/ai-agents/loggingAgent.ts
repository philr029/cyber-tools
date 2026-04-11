/**
 * Logging Agent — persists agent scan results to localStorage and builds
 * a historical intelligence record for trend tracking.
 */

import type { ReconData, AnalysisData, RiskData, ActionData, ExplanationData, AgentLogEntry } from "./agentTypes";

const AGENT_LOG_KEY = "securescope_agent_log";
const MAX_LOG_ENTRIES = 50;

export function runLoggingAgent(
  recon: ReconData,
  analysis: AnalysisData,
  risk: RiskData,
  explanation: ExplanationData,
  actions: ActionData,
  duration: number,
): AgentLogEntry {
  const entry: AgentLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    query: recon.query,
    queryType: recon.queryType,
    timestamp: recon.timestamp,
    riskScore: risk.score,
    riskLevel: risk.level,
    anomaliesCount: analysis.anomalies.filter((a) => a.type !== "CLEAN").length,
    criticalAnomalies: analysis.anomalies.filter((a) => a.severity === "critical").length,
    verdict: actions.verdict,
    summary: explanation.summary,
    duration,
  };

  persistEntry(entry);
  return entry;
}

function persistEntry(entry: AgentLogEntry): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadAgentLog();
    const updated = [entry, ...existing.filter((e) => e.query !== entry.query)].slice(
      0,
      MAX_LOG_ENTRIES,
    );
    localStorage.setItem(AGENT_LOG_KEY, JSON.stringify(updated));
  } catch {
    // Silently ignore localStorage failures (e.g., private browsing quotas)
  }
}

export function loadAgentLog(): AgentLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AGENT_LOG_KEY);
    return raw ? (JSON.parse(raw) as AgentLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearAgentLog(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AGENT_LOG_KEY);
}

/** Returns aggregate intelligence statistics from the log */
export interface AgentLogStats {
  totalScans: number;
  safeCount: number;
  lowCount: number;
  mediumCount: number;
  highCount: number;
  criticalCount: number;
  mostCommonThreats: Array<{ type: string; count: number }>;
  averageRiskScore: number;
}

export function getAgentLogStats(): AgentLogStats {
  const log = loadAgentLog();
  if (log.length === 0) {
    return {
      totalScans: 0,
      safeCount: 0,
      lowCount: 0,
      mediumCount: 0,
      highCount: 0,
      criticalCount: 0,
      mostCommonThreats: [],
      averageRiskScore: 0,
    };
  }

  const safeCount     = log.filter((e) => e.riskLevel === "Safe").length;
  const lowCount      = log.filter((e) => e.riskLevel === "Low").length;
  const mediumCount   = log.filter((e) => e.riskLevel === "Medium").length;
  const highCount     = log.filter((e) => e.riskLevel === "High").length;
  const criticalCount = log.filter((e) => e.riskLevel === "Critical").length;
  const averageRiskScore = Math.round(
    log.reduce((sum, e) => sum + e.riskScore, 0) / log.length,
  );

  return {
    totalScans: log.length,
    safeCount,
    lowCount,
    mediumCount,
    highCount,
    criticalCount,
    mostCommonThreats: [],
    averageRiskScore,
  };
}

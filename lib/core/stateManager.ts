/**
 * State Manager — provides a simple shared store for the last completed agent
 * scan. This allows the chat widget to reference the most recent scan results
 * without prop-drilling or a global state library.
 *
 * Uses localStorage for persistence across page navigations.
 */

import type { AgentScanResult } from "@/lib/ai-agents/agentTypes";

const LAST_SCAN_KEY = "securescope_last_agent_scan";

/** Persist the most recent scan result for cross-component access */
export function saveLastScan(result: AgentScanResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_SCAN_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage errors
  }
}

/** Load the most recent scan result */
export function loadLastScan(): AgentScanResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_SCAN_KEY);
    return raw ? (JSON.parse(raw) as AgentScanResult) : null;
  } catch {
    return null;
  }
}

/** Build a compact context string for the AI chat from the last scan */
export function buildScanContext(result: AgentScanResult | null): string {
  if (!result) return "";

  const { query, risk, explanation, actions, analysis } = result;

  return [
    `LAST SCAN: "${query}" | Risk: ${risk.level} (${risk.score}/100) | Verdict: ${actions.verdict.toUpperCase()}`,
    `Summary: ${explanation.summary}`,
    `Critical anomalies: ${analysis.anomalies.filter((a) => a.severity === "critical").length}`,
    `Top action: ${actions.actions[0]?.action ?? "none"}`,
  ].join("\n");
}

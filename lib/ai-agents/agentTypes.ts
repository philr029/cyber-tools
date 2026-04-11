/**
 * Shared types for the multi-agent cyber intelligence pipeline.
 *
 * Flow: Input → Recon → Analysis → Risk → Explanation → Action → Log
 */

import type { LookupResult, WHOISResult, SubdomainResult } from "@/lib/types";

// ---------------------------------------------------------------------------
// Query classification
// ---------------------------------------------------------------------------

export type QueryType = "ip" | "domain" | "url" | "email" | "unknown";

// ---------------------------------------------------------------------------
// Agent status
// ---------------------------------------------------------------------------

export type AgentStatus = "idle" | "running" | "complete" | "error";

export interface AgentProgress {
  agentId: string;
  agentName: string;
  emoji: string;
  status: AgentStatus;
  message: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Risk classification
// ---------------------------------------------------------------------------

export type RiskLevel = "Safe" | "Low" | "Medium" | "High" | "Critical";

// ---------------------------------------------------------------------------
// 1. Recon Agent output
// ---------------------------------------------------------------------------

export interface ReconData {
  query: string;
  queryType: QueryType;
  lookupResult: LookupResult;
  whois?: WHOISResult;
  subdomains?: SubdomainResult;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// 2. Analysis Agent output
// ---------------------------------------------------------------------------

export interface Anomaly {
  type: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

export interface AnalysisData {
  anomalies: Anomaly[];
  hasMaliciousIndicators: boolean;
  hasSuspiciousIndicators: boolean;
  spfStatus: "pass" | "fail" | "missing" | "unknown";
  dkimStatus: "pass" | "fail" | "missing" | "unknown";
  sslStatus: "valid" | "expiring" | "expired" | "missing";
  blacklistStatus: "clean" | "listed";
  openRiskyPorts: number[];
  domainAge: number | null; // days, null if unknown
}

// ---------------------------------------------------------------------------
// 3. Risk Agent output
// ---------------------------------------------------------------------------

export interface RiskFactor {
  name: string;
  contribution: number; // 0-100 points this factor adds
  detail: string;
}

export interface RiskData {
  score: number; // 0-100
  level: RiskLevel;
  factors: RiskFactor[];
  reasoning: string;
}

// ---------------------------------------------------------------------------
// 4. Explanation Agent output
// ---------------------------------------------------------------------------

export interface ExplanationData {
  summary: string;              // 1-sentence headline
  technicalDetails: string[];   // bullet points for analysts
  plainEnglish: string;         // for non-technical users
  forMarketing: string;         // for marketing/management
}

// ---------------------------------------------------------------------------
// 5. Action Agent output
// ---------------------------------------------------------------------------

export type ActionVerdict = "block" | "investigate" | "monitor" | "ignore";
export type ActionPriority = "immediate" | "high" | "medium" | "low";
export type ActionCategory = "block" | "investigate" | "improve" | "monitor" | "ignore";

export interface ActionItem {
  priority: ActionPriority;
  action: string;
  detail: string;
  category: ActionCategory;
}

export interface ActionData {
  verdict: ActionVerdict;
  verdictReason: string;
  actions: ActionItem[];
  securityImprovements: string[];
}

// ---------------------------------------------------------------------------
// 6. Logging Agent output
// ---------------------------------------------------------------------------

export interface AgentLogEntry {
  id: string;
  query: string;
  queryType: QueryType;
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
  anomaliesCount: number;
  criticalAnomalies: number;
  verdict: ActionVerdict;
  summary: string;
  duration: number; // ms
}

// ---------------------------------------------------------------------------
// Full pipeline result
// ---------------------------------------------------------------------------

export interface AgentScanResult {
  query: string;
  recon: ReconData;
  analysis: AnalysisData;
  risk: RiskData;
  explanation: ExplanationData;
  actions: ActionData;
  logEntry: AgentLogEntry;
  duration: number; // ms
  terminalLog: string[];
}

// ---------------------------------------------------------------------------
// Batch scan
// ---------------------------------------------------------------------------

export interface BatchScanItem {
  query: string;
  status: "pending" | "running" | "complete" | "error";
  result?: AgentScanResult;
  error?: string;
}

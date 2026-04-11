"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { runAgentPipeline } from "@/lib/core/orchestrator";
import { saveLastScan } from "@/lib/core/stateManager";
import { loadAgentLog, clearAgentLog } from "@/lib/ai-agents/loggingAgent";
import type {
  AgentProgress,
  AgentScanResult,
  BatchScanItem,
  RiskLevel,
  ActionVerdict,
} from "@/lib/ai-agents/agentTypes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RISK_COLORS: Record<RiskLevel, string> = {
  Safe:     "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Low:      "text-green-400   bg-green-500/10   border-green-500/20",
  Medium:   "text-amber-400   bg-amber-500/10   border-amber-500/20",
  High:     "text-orange-400  bg-orange-500/10  border-orange-500/20",
  Critical: "text-red-400     bg-red-500/10     border-red-500/20",
};

const RISK_BAR_COLOR: Record<RiskLevel, string> = {
  Safe:     "bg-emerald-500",
  Low:      "bg-green-500",
  Medium:   "bg-amber-500",
  High:     "bg-orange-500",
  Critical: "bg-red-500",
};

const VERDICT_COLORS: Record<ActionVerdict, string> = {
  ignore:      "text-emerald-400 bg-emerald-500/10",
  monitor:     "text-cyan-400    bg-cyan-500/10",
  investigate: "text-amber-400   bg-amber-500/10",
  block:       "text-red-400     bg-red-500/10",
};

const STATUS_ICONS: Record<AgentProgress["status"], string> = {
  idle:     "⬜",
  running:  "🔄",
  complete: "✅",
  error:    "❌",
};

function sanitizeInput(value: string): string {
  return value.replace(/[<>'";&]/g, "").trim().substring(0, 512);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ---------------------------------------------------------------------------
// Agent Activity Panel
// ---------------------------------------------------------------------------

function AgentPanel({ progress }: { progress: AgentProgress[] }) {
  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Agent Activity
      </h3>
      <div className="space-y-2">
        {progress.map((p) => (
          <div
            key={p.agentId}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
              p.status === "running"
                ? "bg-cyan-500/10 border border-cyan-500/20"
                : p.status === "complete"
                  ? "bg-emerald-500/5 border border-emerald-500/10"
                  : "bg-[#131929] border border-transparent"
            }`}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {p.status === "running" ? (
                <span className="inline-block animate-spin">⚙️</span>
              ) : (
                STATUS_ICONS[p.status]
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-300">{p.emoji} {p.agentName}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{p.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Score Gauge
// ---------------------------------------------------------------------------

function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${RISK_COLORS[level]}`}>
        {level}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-500">0</span>
        <div className="flex-1 h-2 rounded-full bg-[#1e2d4a] overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${RISK_BAR_COLOR[level]}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">100</span>
      </div>
      <p className="text-2xl font-bold text-slate-100 mt-2">{score}<span className="text-sm text-slate-400">/100</span></p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Terminal Output
// ---------------------------------------------------------------------------

function TerminalOutput({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  return (
    <div
      ref={ref}
      className="font-mono text-xs text-emerald-400 bg-[#050a12] rounded-xl border border-[#1e2d4a] p-4 h-48 overflow-y-auto"
    >
      {lines.length === 0 ? (
        <span className="text-slate-600">Awaiting scan…</span>
      ) : (
        lines.map((line, i) => (
          <div key={i} className="leading-relaxed">
            {line}
          </div>
        ))
      )}
      <span className="inline-block w-2 h-3 bg-emerald-400 animate-pulse ml-0.5" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single Scan Results Panel
// ---------------------------------------------------------------------------

function ResultsPanel({ result }: { result: AgentScanResult }) {
  const [tab, setTab] = useState<"summary" | "analysis" | "risk" | "actions" | "terminal">("summary");

  const criticals = result.analysis.anomalies.filter((a) => a.severity === "critical");
  const warnings  = result.analysis.anomalies.filter((a) => a.severity === "warning");
  const infos     = result.analysis.anomalies.filter((a) => a.severity === "info" && a.type !== "CLEAN");

  function exportReport() {
    const lines = [
      `SECURESCOPE AGENT SCAN REPORT`,
      `================================`,
      `Target:    ${result.query}`,
      `Timestamp: ${result.recon.timestamp}`,
      `Duration:  ${formatDuration(result.duration)}`,
      ``,
      `RISK ASSESSMENT`,
      `---------------`,
      `Score: ${result.risk.score}/100`,
      `Level: ${result.risk.level}`,
      `Verdict: ${result.actions.verdict.toUpperCase()}`,
      `Reason: ${result.actions.verdictReason}`,
      ``,
      `SUMMARY`,
      `-------`,
      result.explanation.summary,
      ``,
      `PLAIN ENGLISH`,
      `-------------`,
      result.explanation.plainEnglish,
      ``,
      `ANOMALIES (${result.analysis.anomalies.length})`,
      `-`.repeat(40),
      ...result.analysis.anomalies.map((a) => `[${a.severity.toUpperCase()}] ${a.description}`),
      ``,
      `RECOMMENDED ACTIONS`,
      `-------------------`,
      ...result.actions.actions.map(
        (a) => `[${a.priority.toUpperCase()}] ${a.action}: ${a.detail}`,
      ),
      ``,
      `SECURITY IMPROVEMENTS`,
      `---------------------`,
      ...result.actions.securityImprovements,
      ``,
      `TECHNICAL DETAILS`,
      `-----------------`,
      ...result.explanation.technicalDetails,
      ``,
      `TERMINAL LOG`,
      `------------`,
      ...result.terminalLog,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `securescope-${result.query.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d4a]">
        <div>
          <p className="text-sm font-semibold text-slate-100 font-mono">{result.query}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Scanned {new Date(result.recon.timestamp).toLocaleString()} · {formatDuration(result.duration)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${RISK_COLORS[result.risk.level]}`}>
            {result.risk.level}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${VERDICT_COLORS[result.actions.verdict]}`}>
            {result.actions.verdict.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={exportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2d4a] hover:bg-[#263855] text-slate-300 text-xs transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e2d4a] px-5 gap-1 overflow-x-auto">
        {(["summary", "analysis", "risk", "actions", "terminal"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`py-3 px-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t
                ? "text-cyan-400 border-cyan-400"
                : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {tab === "summary" && (
          <div className="space-y-4">
            <RiskGauge score={result.risk.score} level={result.risk.level} />
            <div className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-4">
              <p className="text-sm text-slate-200 leading-relaxed">{result.explanation.summary}</p>
            </div>
            <div className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-4">
              <p className="text-xs font-medium text-slate-400 mb-2">Plain English</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.explanation.plainEnglish}</p>
            </div>
            <div className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-4">
              <p className="text-xs font-medium text-slate-400 mb-2">For Management</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.explanation.forMarketing}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
                <p className="text-xl font-bold text-red-400">{criticals.length}</p>
                <p className="text-xs text-slate-500">Critical</p>
              </div>
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3">
                <p className="text-xl font-bold text-amber-400">{warnings.length}</p>
                <p className="text-xs text-slate-500">Warnings</p>
              </div>
              <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/10 p-3">
                <p className="text-xl font-bold text-cyan-400">{result.actions.actions.length}</p>
                <p className="text-xs text-slate-500">Actions</p>
              </div>
            </div>
          </div>
        )}

        {tab === "analysis" && (
          <div className="space-y-2">
            {/* Auth checks for domains */}
            {result.recon.queryType === "domain" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {[
                  { label: "SPF",    val: result.analysis.spfStatus },
                  { label: "DKIM",   val: result.analysis.dkimStatus },
                  { label: "SSL",    val: result.analysis.sslStatus },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-3 text-center">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`text-sm font-semibold mt-0.5 ${
                      val === "pass" || val === "valid" ? "text-emerald-400" :
                      val === "missing" || val === "unknown" ? "text-slate-400" :
                      "text-red-400"
                    }`}>{val}</p>
                  </div>
                ))}
              </div>
            )}

            {result.analysis.anomalies.map((a, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 flex items-start gap-3 ${
                  a.severity === "critical"
                    ? "border-red-500/30 bg-red-500/5"
                    : a.severity === "warning"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-[#1e2d4a] bg-[#131929]"
                }`}
              >
                <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                  a.severity === "critical"
                    ? "bg-red-500/20 text-red-400"
                    : a.severity === "warning"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-cyan-500/10 text-cyan-400"
                }`}>
                  {a.severity}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{a.description}</p>
              </div>
            ))}

            {infos.length > 0 && (
              <p className="text-xs text-slate-600 mt-2">{infos.length} informational finding(s) not shown</p>
            )}
          </div>
        )}

        {tab === "risk" && (
          <div className="space-y-4">
            <RiskGauge score={result.risk.score} level={result.risk.level} />
            <div className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-4">
              <p className="text-sm text-slate-300 leading-relaxed">{result.risk.reasoning}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Score Breakdown</p>
              {result.risk.factors.map((f, i) => (
                <div key={i} className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-slate-300">{f.name}</p>
                    <span className="text-xs font-bold text-slate-200">+{f.contribution}</span>
                  </div>
                  <div className="h-1 rounded-full bg-[#1e2d4a] overflow-hidden">
                    <div
                      className={`h-1 rounded-full ${RISK_BAR_COLOR[result.risk.level]}`}
                      style={{ width: `${Math.min(100, (f.contribution / 35) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{f.detail}</p>
                </div>
              ))}
              {result.risk.factors.length === 0 && (
                <p className="text-sm text-slate-500">No risk factors identified — target appears clean.</p>
              )}
            </div>
          </div>
        )}

        {tab === "actions" && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${VERDICT_COLORS[result.actions.verdict]} border-current/20`}>
              <p className="text-sm font-semibold">{result.actions.verdict.toUpperCase()}</p>
              <p className="text-xs opacity-80 mt-0.5">{result.actions.verdictReason}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Action Items</p>
              {result.actions.actions.map((a, i) => (
                <div key={i} className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      a.priority === "immediate" ? "bg-red-500/20 text-red-400" :
                      a.priority === "high"      ? "bg-orange-500/20 text-orange-400" :
                      a.priority === "medium"    ? "bg-amber-500/20 text-amber-400" :
                                                   "bg-slate-700 text-slate-400"
                    }`}>{a.priority}</span>
                    <p className="text-sm font-medium text-slate-200">{a.action}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{a.detail}</p>
                </div>
              ))}
            </div>

            {result.actions.securityImprovements.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Security Hardening
                </p>
                <div className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-3 space-y-2">
                  {result.actions.securityImprovements.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-slate-400 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "terminal" && (
          <TerminalOutput lines={result.terminalLog} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Batch Results
// ---------------------------------------------------------------------------

function BatchResultRow({ item }: { item: BatchScanItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-[#131929] border border-[#1e2d4a] overflow-hidden">
      <button
        type="button"
        onClick={() => item.status === "complete" && setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${
          item.status === "pending"  ? "bg-slate-600" :
          item.status === "running"  ? "bg-cyan-400 animate-pulse" :
          item.status === "error"    ? "bg-red-400" :
          item.result?.risk.level === "Safe"     ? "bg-emerald-400" :
          item.result?.risk.level === "Low"      ? "bg-green-400" :
          item.result?.risk.level === "Medium"   ? "bg-amber-400" :
          item.result?.risk.level === "High"     ? "bg-orange-400" :
                                                   "bg-red-400"
        }`} />
        <span className="flex-1 text-sm font-mono text-slate-300 truncate">{item.query}</span>
        {item.status === "running" && (
          <span className="text-xs text-cyan-400">Scanning…</span>
        )}
        {item.status === "complete" && item.result && (
          <>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${RISK_COLORS[item.result.risk.level]}`}>
              {item.result.risk.level}
            </span>
            <span className="text-xs text-slate-500">{item.result.risk.score}/100</span>
            <svg
              className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </>
        )}
        {item.status === "error" && (
          <span className="text-xs text-red-400">Failed</span>
        )}
        {item.status === "pending" && (
          <span className="text-xs text-slate-600">Queued</span>
        )}
      </button>
      {expanded && item.result && (
        <div className="border-t border-[#1e2d4a] p-4">
          <ResultsPanel result={item.result} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Intelligence Log Panel
// ---------------------------------------------------------------------------

function IntelLogPanel() {
  const [log, setLog] = useState(() => loadAgentLog());

  function handleClear() {
    clearAgentLog();
    setLog([]);
  }

  if (log.length === 0) {
    return (
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 text-center">
        <p className="text-sm text-slate-500">No intelligence log entries yet.</p>
        <p className="text-xs text-slate-600 mt-1">Run your first agent scan to start building history.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">📊 Intelligence Log</h3>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          Clear log
        </button>
      </div>
      <div className="space-y-2">
        {log.slice(0, 15).map((e) => (
          <div key={e.id} className="flex items-center gap-3 py-2 border-b border-[#1e2d4a] last:border-0">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${RISK_COLORS[e.riskLevel]}`}>
              {e.riskLevel}
            </span>
            <span className="flex-1 text-xs font-mono text-slate-300 truncate">{e.query}</span>
            <span className="text-xs text-slate-500 shrink-0">{e.riskScore}/100</span>
            <span className="text-xs text-slate-600 shrink-0">{new Date(e.timestamp).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentScanPage() {
  const [mode, setMode]               = useState<"single" | "batch">("single");
  const [singleInput, setSingleInput] = useState("");
  const [batchInput, setBatchInput]   = useState("");
  const [isScanning, setIsScanning]   = useState(false);
  const [progress, setProgress]       = useState<AgentProgress[]>([]);
  const [result, setResult]           = useState<AgentScanResult | null>(null);
  const [batchItems, setBatchItems]   = useState<BatchScanItem[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [showTerminal, setShowTerminal]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const abortRef                      = useRef(false);
  const [logKey, setLogKey]           = useState(0);

  const handleSingleScan = useCallback(async () => {
    const query = sanitizeInput(singleInput);
    if (!query || isScanning) return;

    setIsScanning(true);
    setError(null);
    setResult(null);
    setTerminalLines([]);
    abortRef.current = false;

    try {
      let latestLog: string[] = [];
      const scanResult = await runAgentPipeline(query, (p) => {
        setProgress([...p]);
      });

      latestLog = scanResult.terminalLog;
      setResult(scanResult);
      setTerminalLines(latestLog);
      saveLastScan(scanResult);
      setLogKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }, [singleInput, isScanning]);

  const handleBatchScan = useCallback(async () => {
    const queries = batchInput
      .split("\n")
      .map((q) => sanitizeInput(q))
      .filter((q) => q.length > 0)
      .slice(0, 20);

    if (queries.length === 0 || isScanning) return;

    setIsScanning(true);
    setError(null);
    abortRef.current = false;

    const items: BatchScanItem[] = queries.map((q) => ({ query: q, status: "pending" }));
    setBatchItems([...items]);

    for (let i = 0; i < items.length; i++) {
      if (abortRef.current) break;

      items[i] = { ...items[i], status: "running" };
      setBatchItems([...items]);

      try {
        const scanResult = await runAgentPipeline(items[i].query, (p) => {
          setProgress([...p]);
        });
        items[i] = { ...items[i], status: "complete", result: scanResult };
        saveLastScan(scanResult);
      } catch (e) {
        items[i] = {
          ...items[i],
          status: "error",
          error: e instanceof Error ? e.message : "Scan failed",
        };
      }

      setBatchItems([...items]);
    }

    setLogKey((k) => k + 1);
    setIsScanning(false);
  }, [batchInput, isScanning]);

  const completedBatch = batchItems.filter((b) => b.status === "complete").length;
  const batchProgress  = batchItems.length > 0
    ? Math.round((completedBatch / batchItems.length) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span aria-hidden="true">🤖</span> Agent Scan
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Multi-agent cyber intelligence pipeline — Think. Analyse. Act.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            mode === "single"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "bg-[#0d1321] text-slate-400 border border-[#1e2d4a] hover:border-slate-600"
          }`}
        >
          Single Scan
        </button>
        <button
          type="button"
          onClick={() => setMode("batch")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            mode === "batch"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "bg-[#0d1321] text-slate-400 border border-[#1e2d4a] hover:border-slate-600"
          }`}
        >
          Auto Scan (Batch)
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left column: Input + Agent panel */}
        <div className="space-y-4">
          {/* Input */}
          <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
            {mode === "single" ? (
              <>
                <label htmlFor="single-input" className="block text-xs font-medium text-slate-400 mb-2">
                  Target (domain, IP, or URL)
                </label>
                <input
                  id="single-input"
                  type="text"
                  value={singleInput}
                  onChange={(e) => setSingleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSingleScan()}
                  placeholder="example.com or 8.8.8.8"
                  disabled={isScanning}
                  className="w-full bg-[#131929] border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleSingleScan}
                    disabled={!singleInput.trim() || isScanning}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                  >
                    {isScanning ? "Scanning…" : "Run Agent Scan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTerminal((v) => !v)}
                    className={`px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                      showTerminal
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-[#1e2d4a] text-slate-500 hover:text-slate-300"
                    }`}
                    title="Toggle terminal output"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Quick-fill suggestions */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["8.8.8.8", "example.com", "github.com"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSingleInput(s)}
                      disabled={isScanning}
                      className="px-2 py-1 rounded-lg bg-[#1e2d4a] text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label htmlFor="batch-input" className="block text-xs font-medium text-slate-400 mb-2">
                  Targets — one per line (max 20)
                </label>
                <textarea
                  id="batch-input"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder={"example.com\n8.8.8.8\ngithub.com"}
                  rows={6}
                  disabled={isScanning}
                  className="w-full bg-[#131929] border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors font-mono resize-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleBatchScan}
                  disabled={!batchInput.trim() || isScanning}
                  className="w-full mt-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {isScanning ? "Scanning batch…" : "Start Auto Scan"}
                </button>

                {/* Batch progress bar */}
                {batchItems.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>{completedBatch} / {batchItems.length} complete</span>
                      <span>{batchProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1e2d4a] overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-cyan-500 transition-all duration-500"
                        style={{ width: `${batchProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Agent panel */}
          {(isScanning || progress.length > 0) && (
            <AgentPanel progress={progress} />
          )}

          {/* Terminal */}
          {showTerminal && mode === "single" && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Terminal Output</p>
              <TerminalOutput lines={terminalLines} />
            </div>
          )}
        </div>

        {/* Right column: Results */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Single scan result */}
          {mode === "single" && result && <ResultsPanel result={result} />}

          {/* Single scan placeholder */}
          {mode === "single" && !result && !isScanning && !error && (
            <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-12 text-center">
              <div className="text-4xl mb-4" aria-hidden="true">🤖</div>
              <p className="text-sm font-medium text-slate-300">Awaiting Target</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Enter a domain, IP address, or URL to start the multi-agent intelligence pipeline.
              </p>
            </div>
          )}

          {/* Single scan loading */}
          {mode === "single" && isScanning && !result && (
            <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-12 text-center">
              <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-300">Running Agent Pipeline…</p>
              <p className="text-xs text-slate-500 mt-1">
                {progress.find((p) => p.status === "running")?.message ?? "Initialising agents…"}
              </p>
            </div>
          )}

          {/* Batch results */}
          {mode === "batch" && batchItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Batch Results</p>
              {batchItems.map((item) => (
                <BatchResultRow key={item.query} item={item} />
              ))}
            </div>
          )}

          {/* Batch placeholder */}
          {mode === "batch" && batchItems.length === 0 && (
            <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-12 text-center">
              <div className="text-4xl mb-4" aria-hidden="true">📋</div>
              <p className="text-sm font-medium text-slate-300">Auto Scan Mode</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Enter multiple targets above (one per line) to run them all through the agent pipeline automatically.
              </p>
            </div>
          )}

          {/* Intelligence log */}
          <IntelLogPanel key={logKey} />
        </div>
      </div>
    </div>
  );
}

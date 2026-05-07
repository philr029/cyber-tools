"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { loadHistory, loadSavedScans } from "@/lib/mockData";
import type { HistoryEntry, SavedScan } from "@/lib/types";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

type ToolKind = "deepfake" | "shadow-governance";

type ToolResult = {
  tool: ToolKind;
  score: number;
  confidence: number;
  summary: string;
  recommendations: string[];
};

type ThreatEvent = {
  id: string;
  source: [number, number];
  target: [number, number];
  severity: "medium" | "high";
  label: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const GEO_POINTS: Array<{ label: string; coord: [number, number] }> = [
  { label: "NYC", coord: [60, 50] },
  { label: "LON", coord: [122, 42] },
  { label: "BER", coord: [134, 38] },
  { label: "SAO", coord: [88, 89] },
  { label: "SIN", coord: [205, 78] },
  { label: "TOK", coord: [230, 52] },
  { label: "SYD", coord: [230, 110] },
  { label: "SFO", coord: [36, 54] },
];

function scoreTone(score: number) {
  if (score >= 75) return { label: "Critical", color: "text-orange-400" };
  if (score >= 50) return { label: "Elevated", color: "text-amber-400" };
  if (score >= 25) return { label: "Guarded", color: "text-cyan-300" };
  return { label: "Low", color: "text-emerald-400" };
}

function ThreatMap({ events }: { events: ThreatEvent[] }) {
  return (
    <div className="rounded-2xl bg-[#060b14] border border-cyan-500/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-cyan-300">Global Threat Map</p>
        <span className="text-[10px] text-slate-500">Simulated live telemetry</span>
      </div>
      <svg viewBox="0 0 260 130" className="w-full h-auto rounded-lg bg-[#03060c] border border-[#132038]">
        <path d="M20 53l10-10 10-2 13 4 10-8 20 4 10-8 24 7 15-7 17 9 14-6 13 4 15 15-4 11-12 6-18-4-9 5-11-3-11 6-15-4-12 10-13-6-11 7-15-2-8-7-8 2-7-8 2-9z" fill="#0d1728" stroke="#1f3554" strokeWidth="1.2" />
        {events.map((event) => (
          <g key={event.id}>
            <line
              x1={event.source[0]}
              y1={event.source[1]}
              x2={event.target[0]}
              y2={event.target[1]}
              stroke={event.severity === "high" ? "#ff8b2c" : "#22d3ee"}
              strokeOpacity="0.8"
              strokeWidth="1.3"
            />
            <circle cx={event.target[0]} cy={event.target[1]} r="2.6" fill={event.severity === "high" ? "#ff8b2c" : "#22d3ee"} />
          </g>
        ))}
      </svg>
      <div className="mt-3 space-y-1.5">
        {events.slice(0, 3).map((event) => (
          <p key={`feed-${event.id}`} className="text-[11px] text-slate-400">
            <span className={event.severity === "high" ? "text-orange-400" : "text-cyan-300"}>
              {event.severity.toUpperCase()}
            </span>{" "}
            — {event.label}
          </p>
        ))}
      </div>
    </div>
  );
}

function buildConsultantReply(question: string, risk: number, toolResults: ToolResult[]) {
  const latest = toolResults[0];
  if (!latest) {
    return "Run Deepfake Content Analyzer or Shadow AI Governance first, then ask me for a remediation playbook.";
  }

  const urgency = risk >= 75 ? "Priority 1" : risk >= 50 ? "Priority 2" : "Priority 3";
  if (question.toLowerCase().includes("policy")) {
    return `${urgency}: tighten model access policy, require human approval for high-impact AI outputs, and audit privileged prompts weekly.`;
  }
  if (question.toLowerCase().includes("deepfake")) {
    return `${urgency}: quarantine flagged media, require multi-signal verification, and enforce signed media provenance before external distribution.`;
  }
  return `${urgency}: based on ${latest.tool === "deepfake" ? "Deepfake Content Analyzer" : "Shadow AI Governance"} (score ${latest.score}), start with: ${latest.recommendations[0].toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Threat mini bar
// ---------------------------------------------------------------------------

function ThreatBar({
  safe,
  warning,
  risk,
}: {
  safe: number;
  warning: number;
  risk: number;
}) {
  const total = safe + warning + risk || 1;
  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
      <p className="text-sm font-medium text-slate-300 mb-4">Threat Summary</p>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-emerald-400">Safe</span>
            <span className="text-slate-400">{safe}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1e2d4a]">
            <div
              className="h-1.5 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(safe / total) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-amber-400">Warning</span>
            <span className="text-slate-400">{warning}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1e2d4a]">
            <div
              className="h-1.5 rounded-full bg-amber-500 transition-all"
              style={{ width: `${(warning / total) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-400">High Risk</span>
            <span className="text-slate-400">{risk}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1e2d4a]">
            <div
              className="h-1.5 rounded-full bg-red-500 transition-all"
              style={{ width: `${(risk / total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_DOT: Record<string, string> = {
  safe: "bg-emerald-500",
  warning: "bg-amber-500",
  risk: "bg-red-500",
  unknown: "bg-slate-500",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { user } = useAuth();
  const [history] = useState<HistoryEntry[]>(() => loadHistory());
  const [saved] = useState<SavedScan[]>(() => loadSavedScans());
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [toolLoading, setToolLoading] = useState<ToolKind | null>(null);
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-init",
      role: "assistant",
      text: "AI Security Consultant online. I only use in-browser context and keep your No-Data-Stored posture intact.",
    },
  ]);
  const workerRef = useRef<Worker | null>(null);

  const safe = history.filter((h) => h.overallStatus === "safe").length;
  const warning = history.filter((h) => h.overallStatus === "warning").length;
  const risk = history.filter((h) => h.overallStatus === "risk").length;
  const recent = history.slice(0, 5);
  const latestByTool = useMemo(
    () =>
      toolResults.reduce<Record<ToolKind, ToolResult | undefined>>(
        (acc, result) => {
          if (!acc[result.tool]) acc[result.tool] = result;
          return acc;
        },
        { deepfake: undefined, "shadow-governance": undefined },
      ),
    [toolResults],
  );
  const riskScore = useMemo(() => {
    const baseTotal = safe + warning + risk || 1;
    const base = Math.min(100, Math.round(((warning * 45 + risk * 85) / baseTotal) * 0.7));
    const toolAvg =
      toolResults.length > 0
        ? Math.round(toolResults.reduce((sum, item) => sum + item.score, 0) / toolResults.length)
        : 0;
    const mapImpact = Math.min(18, threatEvents.length * 2);
    return Math.min(100, Math.round(base + toolAvg * 0.2 + mapImpact));
  }, [safe, warning, risk, toolResults, threatEvents.length]);
  const riskMood = scoreTone(riskScore);

  useEffect(() => {
    const worker = new Worker("/workers/advanced-tools-worker.js");
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<ToolResult>) => {
      const payload = event.data;
      setToolResults((current) => [payload, ...current.filter((entry) => entry.tool !== payload.tool)]);
      setToolLoading(null);
      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-${payload.tool}-${Date.now()}`,
          role: "assistant",
          text: `${payload.tool === "deepfake" ? "Deepfake Content Analyzer" : "Shadow AI Governance"} complete. Score ${payload.score}/100. ${payload.summary}`,
        },
      ]);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const source = GEO_POINTS[Math.floor(Math.random() * GEO_POINTS.length)];
      const possibleTargets = GEO_POINTS.filter((point) => point.label !== source.label);
      const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      const severity: ThreatEvent["severity"] = Math.random() > 0.62 ? "high" : "medium";
      const next: ThreatEvent = {
        id: `evt-${crypto.randomUUID()}`,
        source: source.coord,
        target: target.coord,
        severity,
        label: `${source.label} → ${target.label}`,
      };
      setThreatEvents((current) => [next, ...current].slice(0, 8));
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  function runAdvancedTool(tool: ToolKind) {
    if (!workerRef.current) return;
    setToolLoading(tool);
    workerRef.current.postMessage({
      tool,
      payload: {
        historySignals: {
          safe,
          warning,
          risk,
        },
      },
    });
  }

  function handleConsultantAsk() {
    const text = chatInput.trim();
    if (!text) return;
    const messageId = `user-${Date.now()}`;
    setChatMessages((current) => [...current, { id: messageId, role: "user", text }]);
    setChatInput("");
    const reply = buildConsultantReply(text, riskScore, toolResults);
    setChatMessages((current) => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: reply,
      },
    ]);
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Here&apos;s your security intelligence overview.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75V9h5.25a.75.75 0 010 1.5H10.75v5.25a.75.75 0 01-1.5 0V10.5H4a.75.75 0 010-1.5h5.25V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
          </svg>
          New Scan
        </Link>
      </div>

      <div className="mb-6 rounded-2xl bg-[#05090f] border border-cyan-500/30 p-5 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-400">Risk Scorecard</p>
            <p className="text-3xl font-extrabold text-slate-100 mt-1">{riskScore}</p>
            <p className={`text-sm mt-0.5 ${riskMood.color}`}>{riskMood.label} posture</p>
          </div>
          <div className="text-xs text-slate-400 max-w-xs">
            Dynamic score blends baseline scan history, advanced AI tool findings, and global threat-map activity.
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[#0f1b2c] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-orange-400 transition-all duration-500"
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Scans"
          value={history.length}
          color="bg-cyan-500/10"
          icon={
            <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Saved Scans"
          value={saved.length}
          color="bg-purple-500/10"
          icon={
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          }
        />
        <StatCard
          label="Safe"
          value={safe}
          color="bg-emerald-500/10"
          icon={
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Threats"
          value={warning + risk}
          color="bg-red-500/10"
          icon={
            <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Threat bar */}
        <ThreatBar safe={safe} warning={warning} risk={risk} />

        {/* Recent scans */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Recent Lookups</p>
            <Link href="/dashboard/history" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">No scans yet.</p>
              <Link href="/" className="mt-2 inline-block text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                Run your first scan →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1e2d4a]">
              {recent.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 py-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[entry.overallStatus]}`} />
                  <span className="flex-1 text-sm text-slate-300 truncate font-mono">
                    {entry.query}
                  </span>
                  <span className="text-xs text-slate-600 shrink-0">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-2xl bg-[#05090f] border border-[#16314d] p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-100">Advanced AI &amp; Forensics</h2>
              <p className="text-xs text-slate-400 mt-1">
                High-contrast Cyber-Noir tools running fully client-side via Web Workers.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#07111d] border border-cyan-500/20 p-4">
                <p className="text-sm font-semibold text-cyan-300">Deepfake Content Analyzer</p>
                <p className="text-xs text-slate-400 mt-1">
                  Simulates frame-level anomaly checks for forged media indicators.
                </p>
                <button
                  type="button"
                  onClick={() => runAdvancedTool("deepfake")}
                  disabled={toolLoading !== null}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-50 text-cyan-300 text-xs font-medium border border-cyan-400/30 transition-colors"
                >
                  {toolLoading === "deepfake" ? "Analyzing…" : "Run analysis"}
                </button>
                {latestByTool.deepfake && (
                  <div className="mt-3 text-xs text-slate-300 space-y-1">
                    <p>
                      Score: <span className="text-orange-300">{latestByTool.deepfake.score}</span> · Confidence{" "}
                      <span className="text-cyan-300">{latestByTool.deepfake.confidence}%</span>
                    </p>
                    <p className="text-slate-400">{latestByTool.deepfake.summary}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-[#07111d] border border-orange-400/25 p-4">
                <p className="text-sm font-semibold text-orange-300">Shadow AI Governance</p>
                <p className="text-xs text-slate-400 mt-1">
                  Flags unsanctioned model usage, prompt leaks, and policy-drift risk.
                </p>
                <button
                  type="button"
                  onClick={() => runAdvancedTool("shadow-governance")}
                  disabled={toolLoading !== null}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 disabled:opacity-50 text-orange-300 text-xs font-medium border border-orange-400/30 transition-colors"
                >
                  {toolLoading === "shadow-governance" ? "Scanning…" : "Run governance scan"}
                </button>
                {latestByTool["shadow-governance"] && (
                  <div className="mt-3 text-xs text-slate-300 space-y-1">
                    <p>
                      Score:{" "}
                      <span className="text-orange-300">{latestByTool["shadow-governance"].score}</span> · Confidence{" "}
                      <span className="text-cyan-300">{latestByTool["shadow-governance"].confidence}%</span>
                    </p>
                    <p className="text-slate-400">{latestByTool["shadow-governance"].summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ThreatMap events={threatEvents} />
        </div>

        <aside className="rounded-2xl bg-[#05090f] border border-[#16314d] p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-cyan-300">AI Security Consultant</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Ask for remediation guidance based on your latest advanced tool results.
            </p>
          </div>
          <div className="rounded-xl bg-[#03060c] border border-[#102033] p-3 h-64 overflow-auto space-y-2">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`text-xs px-2.5 py-2 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-cyan-500/10 border border-cyan-500/20 text-slate-200"
                    : "bg-orange-500/10 border border-orange-500/20 text-slate-200"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleConsultantAsk();
                }
              }}
              placeholder="e.g. What should I remediate first?"
              className="flex-1 px-3 py-2 rounded-lg bg-[#03060c] border border-[#102033] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            <button
              type="button"
              onClick={handleConsultantAsk}
              className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
            >
              Ask
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">No data is stored. Session context stays in your browser.</p>
        </aside>
      </div>

      {/* Plan notice */}
      {user?.plan === "free" && (
        <div className="mt-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-center gap-4">
          <svg className="w-5 h-5 text-amber-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">Upgrade to Pro</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Unlock unlimited scans, monitoring alerts, and priority support.</p>
          </div>
          <Link href="/pricing" className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors">
            View plans
          </Link>
        </div>
      )}
    </div>
  );
}

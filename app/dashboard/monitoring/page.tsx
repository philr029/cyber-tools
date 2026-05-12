"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { loadHistory, loadMonitors } from "@/lib/mockData";
import { loadCases, loadActivity, loadPlaybooks } from "@/lib/enterprise-mock";
import { useWorkspace } from "@/lib/workspace-context";
import type { HistoryEntry } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mini bar chart component
// ---------------------------------------------------------------------------

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t transition-all duration-500 ${d.color}`}
            style={{ height: `${(d.value / max) * 68}px`, minHeight: d.value > 0 ? "4px" : "0" }}
          />
          <span className="text-[9px] text-slate-600 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini pie / donut-style ring
// ---------------------------------------------------------------------------

function RiskRing({ safe, warning, risk }: { safe: number; warning: number; risk: number }) {
  const total = safe + warning + risk || 1;
  const safeP = (safe / total) * 100;
  const warnP = (warning / total) * 100;
  const riskP = (risk / total) * 100;

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const safeLen = (safeP / 100) * circumference;
  const warnLen = (warnP / 100) * circumference;
  const riskLen = (riskP / 100) * circumference;
  const safeOffset = 0;
  const warnOffset = -safeLen;
  const riskOffset = -(safeLen + warnLen);

  return (
    <div className="flex items-center gap-6">
      <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e2d4a" strokeWidth="10" />
        {safe > 0 && (
          <circle
            cx="40" cy="40" r={radius}
            fill="none" stroke="#10b981" strokeWidth="10"
            strokeDasharray={`${safeLen} ${circumference - safeLen}`}
            strokeDashoffset={safeOffset}
            transform="rotate(-90 40 40)"
          />
        )}
        {warning > 0 && (
          <circle
            cx="40" cy="40" r={radius}
            fill="none" stroke="#f59e0b" strokeWidth="10"
            strokeDasharray={`${warnLen} ${circumference - warnLen}`}
            strokeDashoffset={warnOffset}
            transform="rotate(-90 40 40)"
          />
        )}
        {risk > 0 && (
          <circle
            cx="40" cy="40" r={radius}
            fill="none" stroke="#ef4444" strokeWidth="10"
            strokeDasharray={`${riskLen} ${circumference - riskLen}`}
            strokeDashoffset={riskOffset}
            transform="rotate(-90 40 40)"
          />
        )}
        <text x="40" y="44" textAnchor="middle" className="fill-slate-200 text-xs font-bold" style={{ fontSize: 13 }}>
          {total}
        </text>
      </svg>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-400">Safe</span>
          <span className="text-slate-200 font-medium ml-auto">{safe}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span className="text-slate-400">Warning</span>
          <span className="text-slate-200 font-medium ml-auto">{warning}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-slate-400">Risk</span>
          <span className="text-slate-200 font-medium ml-auto">{risk}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pulse dot for "live" feel
// ---------------------------------------------------------------------------

function LivePulse() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  );
}

function fallbackBarValue(label: string, max: number, min = 0) {
  const seed = label.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (seed % max) + min;
}

function timeAgo(iso: string, now: number) {
  if (!now) return "just now";
  const diff = Math.floor((now - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MonitoringPage() {
  const { activeWorkspace } = useWorkspace();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [tick, setTick] = useState(0);

  // Simulate "live" refreshes every 8 seconds
  useEffect(() => {
    const initialRefreshId = window.setTimeout(() => {
      setHistory(loadHistory());
    }, 0);
    const id = setInterval(() => {
      setNow(Date.now());
      setTick((v) => v + 1);
      setHistory(loadHistory());
    }, 8000);
    return () => {
      window.clearTimeout(initialRefreshId);
      clearInterval(id);
    };
  }, []);

  const monitors = loadMonitors();
  const cases = loadCases().filter((c) => c.workspaceId === activeWorkspace?.id);
  const activity = loadActivity().filter((a) => a.workspaceId === activeWorkspace?.id);
  const playbooks = loadPlaybooks().filter((p) => p.workspaceId === activeWorkspace?.id);

  const safe = history.filter((h) => h.overallStatus === "safe").length;
  const warning = history.filter((h) => h.overallStatus === "warning").length;
  const risk = history.filter((h) => h.overallStatus === "risk").length;
  const openCases = cases.filter((c) => c.status !== "resolved").length;
  const activeMonitors = monitors.length;
  const totalAlerts = monitors.flatMap((m) => m.alerts).length;
  const activePbs = playbooks.filter((p) => p.enabled).length;

  // Build a simple "last 7 days" scan bar chart from history timestamps
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  const scansByDay = days.map((day) => ({
    label: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    value: history.filter((h) => new Date(h.timestamp).toDateString() === day).length,
    color: "bg-cyan-500",
  }));

  const riskByDay = days.map((day, i) => ({
    label: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    value: history.filter((h) => new Date(h.timestamp).toDateString() === day && h.overallStatus === "risk").length,
    color: i === 6 ? "bg-red-500" : "bg-red-500/60",
  }));

  const scansChartData = scansByDay.map((d) => ({
    ...d,
    value: d.value || fallbackBarValue(d.label, 8, 1),
  }));
  const riskChartData = riskByDay.map((d) => ({
    ...d,
    value: d.value || fallbackBarValue(d.label, 4),
  }));
  const recentActivity = activity.slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Live Monitoring
            <LivePulse />
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time security posture for <span className="text-cyan-400">{activeWorkspace?.name}</span>
            <span className="text-slate-600 ml-2">· Refreshes every 8s</span>
          </p>
        </div>
        <span className="text-xs text-slate-600">Tick #{tick}</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Monitored Assets", value: activeMonitors, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Open Cases", value: openCases, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Alerts Triggered", value: totalAlerts, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Active Playbooks", value: activePbs, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Risk distribution donut */}
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
          <p className="text-sm font-medium text-slate-300 mb-4">Risk Distribution</p>
          <RiskRing safe={safe || 5} warning={warning || 3} risk={risk || 2} />
        </div>

        {/* Scans per day bar */}
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
          <p className="text-sm font-medium text-slate-300 mb-4">Scans — Last 7 Days</p>
          <BarChart data={scansChartData} />
        </div>

        {/* Threats per day bar */}
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
          <p className="text-sm font-medium text-slate-300 mb-4">Threats — Last 7 Days</p>
          <BarChart data={riskChartData} />
        </div>
      </div>

      {/* Recent activity feed + monitored assets */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Activity timeline */}
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
          <p className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            Activity Feed
            <LivePulse />
          </p>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No recent activity.</p>
          ) : (
            <div className="space-y-0">
              {recentActivity.map((entry, i) => {
                const when = timeAgo(entry.timestamp, now);
                return (
                  <div key={entry.id} className={`flex items-start gap-3 py-2.5 ${i < recentActivity.length - 1 ? "border-b border-[#1e2d4a]" : ""}`}>
                    <span className="text-base shrink-0 mt-0.5">{
                      entry.action === "scan_run" ? "🔍" :
                      entry.action === "case_created" ? "📁" :
                      entry.action === "alert_triggered" ? "🚨" :
                      entry.action === "playbook_fired" ? "⚡" :
                      entry.action === "case_resolved" ? "✅" :
                      entry.action === "case_updated" ? "✏️" :
                      entry.action === "member_invited" ? "👤" : "🏢"
                    }</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-snug">
                        <strong className="text-slate-200">{entry.actor}</strong>{" "}
                        {entry.detail}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{when}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monitored assets */}
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
          <p className="text-sm font-medium text-slate-300 mb-4">Monitored Assets</p>
          {monitors.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500">No monitored assets.</p>
              <Link href="/dashboard/alerts" className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block transition-colors">
                Add monitors →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {monitors.map((m) => {
                const alertCount = m.alerts.length;
                const hasRisk = m.alerts.some((a) => a.severity === "critical");
                const hasWarn = m.alerts.some((a) => a.severity === "warning");
                return (
                  <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a]">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      hasRisk ? "bg-red-500" : hasWarn ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                    <span className="text-xs text-slate-400 font-medium uppercase shrink-0">{m.type}</span>
                    <span className="flex-1 text-xs font-mono text-slate-200 truncate">{m.target}</span>
                    {alertCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 shrink-0">
                        {alertCount} alert{alertCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

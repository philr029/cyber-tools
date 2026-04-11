"use client";

import { useState } from "react";
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

  const safe = history.filter((h) => h.overallStatus === "safe").length;
  const warning = history.filter((h) => h.overallStatus === "warning").length;
  const risk = history.filter((h) => h.overallStatus === "risk").length;
  const recent = history.slice(0, 5);

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

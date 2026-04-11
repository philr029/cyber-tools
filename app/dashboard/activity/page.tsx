"use client";

import { useState } from "react";
import { loadActivity, ACTIVITY_ICONS } from "@/lib/enterprise-mock";
import { useWorkspace } from "@/lib/workspace-context";
import type { ActivityLogEntry, ActivityAction } from "@/lib/types";

const ACTION_LABELS: Record<ActivityAction, string> = {
  scan_run: "Scan run",
  case_created: "Case created",
  case_updated: "Case updated",
  case_resolved: "Case resolved",
  playbook_fired: "Playbook fired",
  alert_triggered: "Alert triggered",
  member_invited: "Member invited",
  workspace_created: "Workspace created",
};

const ACTION_COLORS: Record<ActivityAction, string> = {
  scan_run: "text-cyan-400 bg-cyan-500/10",
  case_created: "text-blue-400 bg-blue-500/10",
  case_updated: "text-slate-400 bg-slate-500/10",
  case_resolved: "text-emerald-400 bg-emerald-500/10",
  playbook_fired: "text-purple-400 bg-purple-500/10",
  alert_triggered: "text-red-400 bg-red-500/10",
  member_invited: "text-amber-400 bg-amber-500/10",
  workspace_created: "text-teal-400 bg-teal-500/10",
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const ALL_ACTIONS: ActivityAction[] = [
  "scan_run",
  "case_created",
  "case_updated",
  "case_resolved",
  "playbook_fired",
  "alert_triggered",
  "member_invited",
  "workspace_created",
];

export default function ActivityPage() {
  const { activeWorkspace } = useWorkspace();
  const [filter, setFilter] = useState<ActivityAction | "all">("all");
  const [actorFilter, setActorFilter] = useState("");

  const all = loadActivity().filter((a) => a.workspaceId === activeWorkspace?.id);
  const actors = Array.from(new Set(all.map((a) => a.actor)));

  const filtered = all.filter((a) => {
    if (filter !== "all" && a.action !== filter) return false;
    if (actorFilter && a.actor !== actorFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">Activity Log</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          User actions and system events in <span className="text-cyan-400">{activeWorkspace?.name}</span>
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ActivityAction | "all")}
          className="px-3 py-1.5 rounded-xl bg-[#0d1321] border border-[#1e2d4a] text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        >
          <option value="all">All Actions</option>
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#0d1321] border border-[#1e2d4a] text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        >
          <option value="">All Users</option>
          {actors.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {(filter !== "all" || actorFilter) && (
          <button
            type="button"
            onClick={() => { setFilter("all"); setActorFilter(""); }}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-slate-600">{filtered.length} events</span>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No activity matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e2d4a]">
            {filtered.map((entry: ActivityLogEntry, i) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Timeline connector */}
                <div className="flex flex-col items-center shrink-0 mt-1">
                  <span className="text-base">{ACTIVITY_ICONS[entry.action]}</span>
                  {i < filtered.length - 1 && (
                    <div className="w-px flex-1 bg-[#1e2d4a] mt-1 min-h-[16px]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ACTION_COLORS[entry.action]}`}>
                      {ACTION_LABELS[entry.action]}
                    </span>
                    <span className="text-xs font-medium text-slate-300">{entry.actor}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{entry.detail}</p>
                  {entry.target && (
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">{entry.target}</p>
                  )}
                </div>

                <span className="text-[10px] text-slate-600 shrink-0 mt-1 whitespace-nowrap">
                  {timeAgo(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

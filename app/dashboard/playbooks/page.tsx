"use client";

import { useState, type FormEvent } from "react";
import {
  loadPlaybooks,
  createPlaybook,
  togglePlaybook,
  deletePlaybook,
  TRIGGER_LABELS,
  ACTION_LABELS,
} from "@/lib/enterprise-mock";
import { useWorkspace } from "@/lib/workspace-context";
import { useToast } from "@/lib/toast-context";
import type { Playbook, PlaybookTrigger, PlaybookAction } from "@/lib/types";

const TRIGGER_OPTIONS: PlaybookTrigger[] = [
  "scan_high_risk",
  "scan_warning",
  "blacklist_hit",
  "ssl_expiry_7d",
  "new_alert",
];

const ACTION_OPTIONS: PlaybookAction[] = [
  "create_case",
  "send_notification",
  "webhook_slack",
  "webhook_teams",
  "email_alert",
];

const ACTION_ICONS: Record<PlaybookAction, string> = {
  create_case: "📁",
  send_notification: "🔔",
  webhook_slack: "💬",
  webhook_teams: "👥",
  email_alert: "✉️",
};

const TRIGGER_ICONS: Record<PlaybookTrigger, string> = {
  scan_high_risk: "🔴",
  scan_warning: "🟡",
  blacklist_hit: "🚫",
  ssl_expiry_7d: "🔒",
  new_alert: "🚨",
};

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PlaybooksPage() {
  const { activeWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [playbooks, setPlaybooks] = useState<Playbook[]>(() => loadPlaybooks());
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTrigger, setNewTrigger] = useState<PlaybookTrigger>("scan_high_risk");
  const [newAction, setNewAction] = useState<PlaybookAction>("create_case");

  const wsPlaybooks = playbooks.filter((p) => p.workspaceId === activeWorkspace?.id);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createPlaybook(newName.trim(), newDesc.trim(), newTrigger, newAction, activeWorkspace?.id ?? "ws-default");
    setPlaybooks(loadPlaybooks());
    setNewName("");
    setNewDesc("");
    setCreating(false);
    toast("Playbook created", "success");
  }

  function handleToggle(id: string) {
    togglePlaybook(id);
    setPlaybooks(loadPlaybooks());
    const pb = loadPlaybooks().find((p) => p.id === id);
    toast(`Playbook ${pb?.enabled ? "enabled" : "disabled"}`, "info");
  }

  function handleDelete(id: string) {
    deletePlaybook(id);
    setPlaybooks(loadPlaybooks());
    toast("Playbook deleted", "info");
  }

  const totalRuns = wsPlaybooks.reduce((sum, p) => sum + p.runCount, 0);
  const activeCount = wsPlaybooks.filter((p) => p.enabled).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Playbooks</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Automation rules for <span className="text-cyan-400">{activeWorkspace?.name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75V9h5.25a.75.75 0 010 1.5H10.75v5.25a.75.75 0 01-1.5 0V10.5H4a.75.75 0 010-1.5h5.25V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
          </svg>
          New Playbook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-slate-100">{wsPlaybooks.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Rules</p>
        </div>
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active</p>
        </div>
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{totalRuns}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Runs</p>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 p-4">
        <p className="text-xs font-semibold text-cyan-400 mb-2">⚡ How Playbooks Work</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Playbooks are <strong className="text-slate-300">trigger → action</strong> automation rules. When the trigger condition
          is met (e.g., a scan returns high risk), the configured action fires automatically (e.g., create a case, send a Slack
          notification). This demo runs all logic client-side — in production these would execute as server-side webhooks.
        </p>
      </div>

      {/* Create form */}
      {creating && (
        <div className="mb-6 rounded-2xl bg-[#0d1321] border border-cyan-500/30 p-5">
          <p className="text-sm font-semibold text-slate-200 mb-4">New Playbook Rule</p>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Rule name"
              required
              className="w-full px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)…"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
            />

            {/* Rule builder */}
            <div className="rounded-xl bg-[#131929] border border-[#1e2d4a] p-4">
              <p className="text-xs font-medium text-slate-400 mb-3">Rule Builder</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-slate-500 font-medium shrink-0">WHEN</span>
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value as PlaybookTrigger)}
                  className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-[#0d1321] border border-[#1e2d4a] text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {TRIGGER_OPTIONS.map((t) => (
                    <option key={t} value={t}>{TRIGGER_LABELS[t]}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 font-medium shrink-0">THEN</span>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value as PlaybookAction)}
                  className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-[#0d1321] border border-[#1e2d4a] text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {ACTION_OPTIONS.map((a) => (
                    <option key={a} value={a}>{ACTION_LABELS[a]}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-[#0b0f1a] border border-[#1e2d4a] text-xs text-slate-400">
                <span className="text-emerald-400 font-medium">Preview: </span>
                When <strong className="text-slate-200">{TRIGGER_LABELS[newTrigger].toLowerCase()}</strong>, automatically <strong className="text-slate-200">{ACTION_LABELS[newAction].toLowerCase()}</strong>.
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
                Create Playbook
              </button>
              <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 rounded-xl bg-[#131929] text-slate-400 text-sm hover:text-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Playbook list */}
      <div className="space-y-3">
        {wsPlaybooks.length === 0 ? (
          <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-8 text-center">
            <p className="text-sm text-slate-500">No playbooks yet. Create your first automation rule.</p>
          </div>
        ) : (
          wsPlaybooks.map((pb) => (
            <div key={pb.id} className={`rounded-2xl bg-[#0d1321] border transition-colors ${pb.enabled ? "border-[#1e2d4a]" : "border-[#1e2d4a] opacity-60"}`}>
              <div className="p-4 flex items-start gap-4">
                <div className="text-2xl shrink-0 mt-0.5">{ACTION_ICONS[pb.action]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-medium text-slate-200">{pb.name}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${pb.enabled ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 bg-slate-500/10"}`}>
                      {pb.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  {pb.description && (
                    <p className="text-xs text-slate-500 mb-2">{pb.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#131929] border border-[#1e2d4a] text-[10px] text-slate-400">
                      <span>{TRIGGER_ICONS[pb.trigger]}</span>
                      {TRIGGER_LABELS[pb.trigger]}
                    </span>
                    <svg className="w-3 h-3 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#131929] border border-[#1e2d4a] text-[10px] text-slate-400">
                      <span>{ACTION_ICONS[pb.action]}</span>
                      {ACTION_LABELS[pb.action]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-600">
                    <span>{pb.runCount} run{pb.runCount !== 1 ? "s" : ""}</span>
                    <span>Last run: {timeAgo(pb.lastRunAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(pb.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pb.enabled ? "bg-cyan-600" : "bg-slate-700"}`}
                    aria-label={pb.enabled ? "Disable playbook" : "Enable playbook"}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${pb.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pb.id)}
                    aria-label="Delete playbook"
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

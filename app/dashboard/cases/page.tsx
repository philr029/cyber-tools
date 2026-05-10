"use client";

import { useState, type FormEvent } from "react";
import {
  loadCases,
  createCase,
  updateCaseStatus,
  addCaseNote,
  SEVERITY_COLORS,
  STATUS_COLORS,
} from "@/lib/enterprise-mock";
import { useWorkspace } from "@/lib/workspace-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { Case, CaseStatus, CaseSeverity } from "@/lib/types";

const STATUS_COLS: { key: CaseStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "investigating", label: "Investigating" },
  { key: "resolved", label: "Resolved" },
];

const SEVERITY_ORDER: Record<CaseSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ---------------------------------------------------------------------------
// Case Detail Modal
// ---------------------------------------------------------------------------

function CaseModal({
  c,
  onClose,
  onStatusChange,
  onAddNote,
}: {
  c: Case;
  onClose: () => void;
  onStatusChange: (id: string, status: CaseStatus) => void;
  onAddNote: (id: string, content: string) => void;
}) {
  const { user } = useAuth();
  const [noteText, setNoteText] = useState("");

  function submitNote(e: FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(c.id, noteText.trim());
    setNoteText("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[#0d1321] border border-[#1e2d4a] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#1e2d4a]">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[c.severity]}`}>
                {c.severity.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                {c.status}
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-100 leading-snug">{c.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">{c.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#131929] border border-[#1e2d4a]">
              <p className="text-slate-500 mb-0.5">Assignee</p>
              <p className="text-slate-200">{c.assignee ?? "Unassigned"}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#131929] border border-[#1e2d4a]">
              <p className="text-slate-500 mb-0.5">Created</p>
              <p className="text-slate-200">{timeAgo(c.createdAt)}</p>
            </div>
          </div>

          {/* Status change */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Change Status</p>
            <div className="flex gap-2 flex-wrap">
              {STATUS_COLS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onStatusChange(c.id, key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    c.status === key
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-[#1e2d4a] text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {c.attachments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2">Attachments</p>
              <div className="space-y-1.5">
                {c.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a]">
                    <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-slate-300 truncate">{att.label}</span>
                    {att.query && <span className="text-xs font-mono text-slate-500 truncate">{att.query}</span>}
                    {att.overallStatus && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ml-auto shrink-0 ${
                        att.overallStatus === "risk" ? "text-red-400 bg-red-500/10" :
                        att.overallStatus === "warning" ? "text-amber-400 bg-amber-500/10" :
                        "text-emerald-400 bg-emerald-500/10"
                      }`}>{att.overallStatus}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Notes ({c.notes.length})</p>
            <div className="space-y-2 mb-3">
              {c.notes.map((note) => (
                <div key={note.id} className="p-3 rounded-xl bg-[#131929] border border-[#1e2d4a]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-slate-300">{note.author}</p>
                    <p className="text-[10px] text-slate-600">{timeAgo(note.createdAt)}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{note.content}</p>
                </div>
              ))}
              {c.notes.length === 0 && <p className="text-xs text-slate-600">No notes yet.</p>}
            </div>

            <form onSubmit={submitNote} className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={`Add a note as ${user?.name ?? "you"}…`}
                className="flex-1 px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban card
// ---------------------------------------------------------------------------

function CaseCard({ c, onClick }: { c: Case; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3.5 rounded-xl bg-[#0d1321] border border-[#1e2d4a] hover:border-cyan-500/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SEVERITY_COLORS[c.severity]}`}>
          {c.severity.toUpperCase()}
        </span>
        {c.attachments.length > 0 && (
          <span className="text-[10px] text-slate-500">{c.attachments.length} attachment{c.attachments.length !== 1 ? "s" : ""}</span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-200 leading-snug line-clamp-2 mb-2">{c.title}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500">{c.assignee ?? "Unassigned"}</span>
        <span className="text-[10px] text-slate-600">{timeAgo(c.updatedAt)}</span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CasesPage() {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>(() => loadCases());
  const [selected, setSelected] = useState<Case | null>(null);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  // New case form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSeverity, setNewSeverity] = useState<CaseSeverity>("medium");

  const workspaceCases = cases.filter((c) => c.workspaceId === activeWorkspace?.id);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createCase(newTitle.trim(), newDesc.trim(), newSeverity, activeWorkspace?.id ?? "ws-default");
    setCases(loadCases());
    setNewTitle("");
    setNewDesc("");
    setNewSeverity("medium");
    setCreating(false);
    toast("Case created", "success");
  }

  function handleStatusChange(id: string, status: CaseStatus) {
    updateCaseStatus(id, status);
    setCases(loadCases());
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    toast(`Case marked as ${status}`, "info");
  }

  function handleAddNote(id: string, content: string) {
    addCaseNote(id, user?.name ?? "You", content);
    setCases(loadCases());
    setSelected((prev) => {
      if (prev?.id !== id) return prev;
      const updated = loadCases().find((c) => c.id === id);
      return updated ?? prev;
    });
  }

  const totalOpen = workspaceCases.filter((c) => c.status === "open").length;
  const totalInv = workspaceCases.filter((c) => c.status === "investigating").length;
  const totalRes = workspaceCases.filter((c) => c.status === "resolved").length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Cases</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage security incidents and investigations in <span className="text-cyan-400">{activeWorkspace?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#1e2d4a] overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 transition-colors ${view === "kanban" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:text-slate-200"}`}
            >
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-1.5 transition-colors ${view === "list" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:text-slate-200"}`}
            >
              List
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75V9h5.25a.75.75 0 010 1.5H10.75v5.25a.75.75 0 01-1.5 0V10.5H4a.75.75 0 010-1.5h5.25V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
            </svg>
            New Case
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-slate-100">{totalOpen}</p>
          <p className="text-xs text-slate-500 mt-0.5">Open</p>
        </div>
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{totalInv}</p>
          <p className="text-xs text-slate-500 mt-0.5">Investigating</p>
        </div>
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalRes}</p>
          <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
        </div>
      </div>

      {/* New case form */}
      {creating && (
        <div className="mb-6 rounded-2xl bg-[#0d1321] border border-cyan-500/30 p-5">
          <p className="text-sm font-semibold text-slate-200 mb-4">Create New Case</p>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Case title"
              required
              className="w-full px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description…"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as CaseSeverity)}
                className="px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
                Create
              </button>
              <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 rounded-xl bg-[#131929] text-slate-400 text-sm hover:text-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {view === "kanban" ? (
        /* Kanban board */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_COLS.map(({ key, label }) => {
            const colCases = workspaceCases
              .filter((c) => c.status === key)
              .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
            return (
              <div key={key} className="rounded-2xl bg-[#0b0f1a] border border-[#1e2d4a] p-3">
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[key]}`}>{label}</span>
                  </div>
                  <span className="text-xs text-slate-600">{colCases.length}</span>
                </div>
                <div className="space-y-2">
                  {colCases.map((c) => (
                    <CaseCard key={c.id} c={c} onClick={() => setSelected(c)} />
                  ))}
                  {colCases.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-6">No cases</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-4 py-2 border-b border-[#1e2d4a]">
            <span>Case</span>
            <span className="px-2">Severity</span>
            <span className="px-2">Status</span>
            <span className="px-2">Assignee</span>
            <span className="px-2">Updated</span>
          </div>
          {workspaceCases.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No cases in this workspace.</p>
          ) : (
            <div className="divide-y divide-[#1e2d4a]">
              {workspaceCases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-sm text-slate-200 truncate pr-3">{c.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium mx-2 ${SEVERITY_COLORS[c.severity]}`}>
                    {c.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium mx-2 ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                  <span className="text-xs text-slate-500 mx-2 truncate max-w-[100px]">{c.assignee ?? "—"}</span>
                  <span className="text-xs text-slate-600 mx-2 whitespace-nowrap">{timeAgo(c.updatedAt)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Case detail modal */}
      {selected && (
        <CaseModal
          c={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
}

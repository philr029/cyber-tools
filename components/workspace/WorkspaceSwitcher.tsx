"use client";

import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { useToast } from "@/lib/toast-context";
import type { Workspace } from "@/lib/types";

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(ws: Workspace) {
    setActiveWorkspace(ws);
    setOpen(false);
    toast(`Switched to ${ws.name}`, "info");
  }

  function handleCreate() {
    if (!newName.trim()) return;
    createWorkspace(newName.trim(), newDesc.trim());
    toast(`Workspace "${newName.trim()}" created`, "success");
    setNewName("");
    setNewDesc("");
    setCreating(false);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#131929] border border-[#1e2d4a] hover:border-cyan-500/30 text-slate-300 text-xs font-medium transition-colors max-w-[160px]"
        aria-expanded={open}
      >
        <span className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 010-1.5h12.5a.75.75 0 010 1.5H16v13h.25a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75v-2.5a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v2.5a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5H4zm3-11a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 017 5.5zm.75 2.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM7 10.5a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zm5.25-4.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zm-.75 4.25a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM10 7.75a.75.75 0 000 1.5h.5a.75.75 0 000-1.5H10zM9.25 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5H10a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </span>
        <span className="truncate">{activeWorkspace?.name ?? "Workspace"}</span>
        <svg className={`w-3 h-3 ml-auto shrink-0 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-[#1e2d4a] bg-[#0d1321] shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Workspaces</p>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => handleSelect(ws)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                  ws.id === activeWorkspace?.id
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <span className="w-6 h-6 rounded-md bg-[#1e2d4a] flex items-center justify-center shrink-0 text-xs font-bold text-slate-400">
                  {ws.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{ws.name}</p>
                  <p className="text-[10px] text-slate-500">{ws.members.length} member{ws.members.length !== 1 ? "s" : ""}</p>
                </div>
                {ws.id === activeWorkspace?.id && (
                  <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-[#1e2d4a] p-2">
            {creating ? (
              <div className="space-y-2 p-1">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Workspace name"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="px-2 py-1.5 rounded-lg bg-[#131929] text-slate-400 text-xs hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75V9h5.25a.75.75 0 010 1.5H10.75v5.25a.75.75 0 01-1.5 0V10.5H4a.75.75 0 010-1.5h5.25V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                </svg>
                New workspace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

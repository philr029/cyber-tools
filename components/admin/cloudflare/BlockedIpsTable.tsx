"use client";

import { useState } from "react";

export interface BlockedRule {
  id: string;
  mode: "block" | "challenge" | "js_challenge" | "whitelist";
  configuration: {
    target: string;
    value: string;
  };
  notes: string;
  created_on: string;
  modified_on: string;
}

export default function BlockedIpsTable({
  rules,
  loading,
  error,
  onBlock,
  onUnblock,
}: {
  rules: BlockedRule[];
  loading: boolean;
  error: string | null;
  onBlock: (ip: string, notes: string) => Promise<void>;
  onUnblock: (id: string) => Promise<void>;
}) {
  const [ip, setIp] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  async function handleBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!ip.trim()) {
      setFormError("IP address is required.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await onBlock(ip.trim(), notes.trim());
      setIp("");
      setNotes("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to block IP.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnblock(id: string) {
    setUnblockingId(id);
    try {
      await onUnblock(id);
    } finally {
      setUnblockingId(null);
    }
  }

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Blocked IPs</p>
        <span className="text-xs text-slate-500 bg-[#131929] border border-[#1e2d4a] px-2 py-0.5 rounded-lg">
          {rules.length} rule{rules.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Block IP form */}
      <form
        onSubmit={handleBlock}
        className="bg-[#131929] rounded-xl p-3 border border-[#1e2d4a] space-y-2"
      >
        {formError && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-1.5">
            {formError}
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="IP address (e.g. 1.2.3.4)"
            className="flex-1 px-3 py-2 rounded-lg bg-[#0d1321] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-red-500/40"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-medium transition-colors shrink-0"
          >
            {submitting ? (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            )}
            Block
          </button>
        </div>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full px-3 py-1.5 rounded-lg bg-[#0d1321] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
        />
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-600/40 border-t-slate-400 rounded-full animate-spin" />
          Loading blocked IPs…
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-amber-400 bg-amber-500/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && rules.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">No blocked IPs.</p>
      )}

      {rules.length > 0 && (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 bg-[#131929] rounded-xl px-3 py-2.5 group"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-slate-200 truncate">
                  {rule.configuration.value}
                </p>
                {rule.notes && (
                  <p className="text-xs text-slate-500 truncate">{rule.notes}</p>
                )}
              </div>
              <span className="text-xs text-slate-600 shrink-0 hidden sm:block">
                {new Date(rule.created_on).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => handleUnblock(rule.id)}
                disabled={unblockingId === rule.id}
                className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40 transition-colors shrink-0"
                aria-label={`Unblock ${rule.configuration.value}`}
              >
                {unblockingId === rule.id ? (
                  <span className="w-3 h-3 border border-slate-400/30 border-t-slate-400 rounded-full animate-spin inline-block" />
                ) : (
                  "Unblock"
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

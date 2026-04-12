"use client";

import { useState } from "react";

export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
  modified_on: string;
}

const TYPE_COLORS: Record<string, string> = {
  A: "text-cyan-400 bg-cyan-500/10",
  AAAA: "text-blue-400 bg-blue-500/10",
  CNAME: "text-purple-400 bg-purple-500/10",
  MX: "text-amber-400 bg-amber-500/10",
  TXT: "text-slate-400 bg-slate-700/40",
  NS: "text-emerald-400 bg-emerald-500/10",
  SRV: "text-pink-400 bg-pink-500/10",
  CAA: "text-orange-400 bg-orange-500/10",
};

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"] as const;

interface AddFormState {
  type: string;
  name: string;
  content: string;
  proxied: boolean;
}

export default function DnsTable({
  records,
  loading,
  error,
  onAdd,
  onDelete,
}: {
  records: DnsRecord[];
  loading: boolean;
  error: string | null;
  onAdd: (form: AddFormState) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddFormState>({
    type: "A",
    name: "",
    content: "",
    proxied: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      setFormError("Name and content are required.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await onAdd(form);
      setForm({ type: "A", name: "", content: "", proxied: false });
      setShowAdd(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add record.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">DNS Records</p>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75V9h5.25a.75.75 0 010 1.5H10.75v5.25a.75.75 0 01-1.5 0V10.5H4a.75.75 0 010-1.5h5.25V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
          </svg>
          Add Record
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="bg-[#131929] rounded-xl p-4 border border-[#1e2d4a] space-y-3"
        >
          {formError && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-1.5">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0d1321] border border-[#1e2d4a] text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none pb-2">
                <input
                  type="checkbox"
                  checked={form.proxied}
                  onChange={(e) => setForm((f) => ({ ...f, proxied: e.target.checked }))}
                  className="accent-cyan-500 w-3.5 h-3.5"
                />
                Proxied (🟠)
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="@ or subdomain"
              className="w-full px-3 py-2 rounded-lg bg-[#0d1321] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Content</label>
            <input
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="IP address or target"
              className="w-full px-3 py-2 rounded-lg bg-[#0d1321] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowAdd(false); setFormError(null); }}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
            >
              {submitting ? (
                <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Save
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-600/40 border-t-slate-400 rounded-full animate-spin" />
          Loading DNS records…
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-amber-400 bg-amber-500/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && records.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">No DNS records found.</p>
      )}

      {records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-[#1e2d4a]">
                <th className="pb-2 font-medium pr-4">Type</th>
                <th className="pb-2 font-medium pr-4">Name</th>
                <th className="pb-2 font-medium pr-4">Content</th>
                <th className="pb-2 font-medium pr-4 text-center">Proxied</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4a]">
              {records.map((rec) => (
                <tr key={rec.id} className="group">
                  <td className="py-2.5 pr-4">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-medium ${TYPE_COLORS[rec.type] ?? "text-slate-400 bg-slate-700/40"}`}
                    >
                      {rec.type}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-slate-300 max-w-[120px] truncate">
                    {rec.name}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-slate-400 max-w-[180px] truncate">
                    {rec.content}
                  </td>
                  <td className="py-2.5 pr-4 text-center">
                    {rec.proxied ? (
                      <span title="Proxied (orange cloud)">🟠</span>
                    ) : (
                      <span title="DNS only (grey cloud)" className="text-slate-600">⬜</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(rec.id)}
                      disabled={deletingId === rec.id}
                      className="px-2 py-1 rounded-lg text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
                      aria-label={`Delete ${rec.type} record for ${rec.name}`}
                    >
                      {deletingId === rec.id ? (
                        <span className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin inline-block" />
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

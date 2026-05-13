"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { loadHistory, clearHistory, hydrateHistory } from "@/lib/mockData";
import type { HistoryEntry } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  safe: "text-emerald-400 bg-emerald-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  risk: "text-red-400 bg-red-500/10",
  unknown: "text-slate-400 bg-slate-500/10",
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() =>
    typeof window === "undefined" ? [] : loadHistory(),
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "safe" | "warning" | "risk">("all");

  useEffect(() => {
    void hydrateHistory().then(setEntries);
    const onVault = () => void hydrateHistory().then(setEntries);
    window.addEventListener("ss-vault-changed", onVault);
    return () => window.removeEventListener("ss-vault-changed", onVault);
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch =
        search === "" || e.query.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || e.overallStatus === filter;
      return matchSearch && matchFilter;
    });
  }, [entries, search, filter]);

  function handleClear() {
    if (!confirm("Clear all scan history?")) return;
    clearHistory();
    setEntries([]);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Scan History</h1>
          <p className="text-sm text-slate-400 mt-0.5">{entries.length} total lookups</p>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
          >
            Clear history
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by IP, domain, or URL…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0d1321] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "safe", "warning", "risk"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "bg-[#0d1321] border border-[#1e2d4a] text-slate-400 hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-12 text-center">
          <p className="text-sm text-slate-500">
            {entries.length === 0
              ? "No scan history yet. Run a scan to get started."
              : "No results match your filter."}
          </p>
          {entries.length === 0 && (
            <Link
              href="/"
              className="mt-3 inline-block text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Go to scanner →
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2d4a]">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4a]">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-slate-200">{entry.query}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[entry.overallStatus]}`}>
                      {entry.overallStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-2">
                      {(["ipStatus", "domainStatus", "blacklistStatus", "sslStatus"] as const).map(
                        (key) => (
                          <span
                            key={key}
                            title={key.replace("Status", "")}
                            className={`w-2 h-2 rounded-full ${
                              entry.resultSnapshot[key] === "safe"
                                ? "bg-emerald-500"
                                : entry.resultSnapshot[key] === "warning"
                                ? "bg-amber-500"
                                : entry.resultSnapshot[key] === "risk"
                                ? "bg-red-500"
                                : "bg-slate-600"
                            }`}
                          />
                        ),
                      )}
                    </div>
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

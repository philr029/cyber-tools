"use client";

import { useState } from "react";
import { loadSavedScans, deleteSavedScan } from "@/lib/mockData";
import type { SavedScan } from "@/lib/types";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  safe: "text-emerald-400 bg-emerald-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  risk: "text-red-400 bg-red-500/10",
  unknown: "text-slate-400 bg-slate-500/10",
};

export default function SavedScansPage() {
  const [scans, setScans] = useState<SavedScan[]>(() => loadSavedScans());

  function handleDelete(id: string) {
    deleteSavedScan(id);
    setScans((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">Saved Scans</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {scans.length} saved result{scans.length !== 1 ? "s" : ""}
        </p>
      </div>

      {scans.length === 0 ? (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-12 text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          <p className="text-sm text-slate-500 mb-1">No saved scans yet.</p>
          <p className="text-xs text-slate-600">
            Run a scan and click &ldquo;Save&rdquo; to bookmark results here.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Go to scanner →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{scan.label}</p>
                <p className="text-xs font-mono text-slate-500 truncate mt-0.5">{scan.query}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {new Date(scan.timestamp).toLocaleString()}
                </p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[scan.overallStatus]}`}>
                {scan.overallStatus}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(scan.id)}
                aria-label={`Delete saved scan for ${scan.label}`}
                className="shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

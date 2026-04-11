"use client";

import type { LookupResult } from "@/lib/types";

export default function ExportButton({ result }: { result: LookupResult }) {
  function handleExport() {
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = `securescope-${result.query.replace(/[^a-z0-9.-]/gi, "_")}-${new Date(result.timestamp).toISOString().slice(0, 10)}.json`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e2d4a] bg-white/5 hover:bg-white/10 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all shrink-0"
      aria-label="Export scan results as JSON"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
      </svg>
      Export
    </button>
  );
}

"use client";

import { useState, useRef, useCallback, useId } from "react";
import type { BlacklistResult, StatusLevel } from "@/lib/types";
import { isValidIPOrDomain } from "@/lib/validators";
import Card from "@/app/components/ui/Card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RowStatus = "pending" | "checking" | "done" | "error";

interface BulkRow {
  target: string;
  status: RowStatus;
  data: BlacklistResult | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCSV(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(",")[0].trim().replace(/^["']|["']$/g, ""))
    .filter((v) => v && isValidIPOrDomain(v));
}

function statusLabel(row: BulkRow): string {
  if (row.status === "pending") return "Queued";
  if (row.status === "checking") return "Checking…";
  if (row.status === "error") return "Error";
  if (!row.data) return "—";
  return row.data.listedCount === 0 ? "Clean" : "Listed";
}

function rowStatusClasses(row: BulkRow): string {
  if (row.status === "pending") return "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20";
  if (row.status === "checking") return "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20";
  if (row.status === "error") return "bg-red-500/10 text-red-400 ring-1 ring-red-500/20";
  if (!row.data) return "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20";
  return row.data.listedCount === 0
    ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
    : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20";
}

function overallStatusFor(data: BlacklistResult): StatusLevel {
  if (data.listedCount === 0) return "safe";
  if (data.listedCount >= 3) return "risk";
  return "warning";
}

function buildResultCSV(rows: BulkRow[]): string {
  const SOURCES = ["Spamhaus ZEN", "SURBL", "Barracuda", "SpamCop", "UCEPROTECT"];
  const header = ["Target", "Status", "Listed Count", ...SOURCES];
  const lines = rows
    .filter((r) => r.status === "done" && r.data)
    .map((r) => {
      const d = r.data!;
      const perSource = SOURCES.map((s) => {
        const entry = d.entries.find((e) => e.source === s);
        return entry?.listed ? "Listed" : "Clean";
      });
      return [
        r.target,
        d.listedCount === 0 ? "Clean" : "Listed",
        String(d.listedCount),
        ...perSource,
      ]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(",");
    });
  return [header.join(","), ...lines].join("\r\n");
}

// ---------------------------------------------------------------------------
// Upload icon
// ---------------------------------------------------------------------------

const DownloadIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
      clipRule="evenodd"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BulkBlacklistUploader() {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Abort flag so we can cancel a running batch
  const abortRef = useRef(false);

  // -------------------------------------------------------------------------
  // File handling
  // -------------------------------------------------------------------------

  const processFile = useCallback((file: File) => {
    setParseError(null);
    setRows([]);
    setIsComplete(false);

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setParseError("Please upload a .csv file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const targets = parseCSV(text);
      if (targets.length === 0) {
        setParseError(
          "No valid IP addresses or domains found in the first column of the CSV."
        );
        return;
      }
      if (targets.length > 500) {
        setParseError("Maximum 500 targets per batch. Please split your CSV.");
        return;
      }
      setRows(
        targets.map((t) => ({ target: t, status: "pending", data: null, error: null }))
      );
    };
    reader.onerror = () => setParseError("Could not read the file. Please try again.");
    reader.readAsText(file);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  // -------------------------------------------------------------------------
  // Bulk check
  // -------------------------------------------------------------------------

  async function runBulkCheck() {
    if (rows.length === 0 || isRunning) return;
    abortRef.current = false;
    setIsRunning(true);
    setIsComplete(false);

    // Mark all as checking immediately so the table shows activity
    setRows((prev) => prev.map((r) => ({ ...r, status: "checking" as RowStatus })));

    // Fire all lookups concurrently; update each row as its promise resolves
    await Promise.all(
      rows.map(async (row, idx) => {
        try {
          const { lookupBlacklist } = await import("@/lib/lookup-client");
          const { data } = await lookupBlacklist(row.target);
          if (abortRef.current) return;
          setRows((prev) =>
            prev.map((r, i) =>
              i === idx
                ? {
                    ...r,
                    status: "done" as RowStatus,
                    data: { ...data, status: overallStatusFor(data) },
                    error: null,
                  }
                : r
            )
          );
        } catch (err) {
          if (abortRef.current) return;
          setRows((prev) =>
            prev.map((r, i) =>
              i === idx
                ? {
                    ...r,
                    status: "error" as RowStatus,
                    error: err instanceof Error ? err.message : "Lookup failed",
                  }
                : r
            )
          );
        }
      })
    );

    setIsRunning(false);
    setIsComplete(true);
  }

  function handleReset() {
    abortRef.current = true;
    setIsRunning(false);
    setIsComplete(false);
    setRows([]);
    setParseError(null);
  }

  // -------------------------------------------------------------------------
  // CSV export
  // -------------------------------------------------------------------------

  function handleDownload() {
    const csv = buildResultCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `securescope-bulk-blacklist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // -------------------------------------------------------------------------
  // Derived stats
  // -------------------------------------------------------------------------

  const doneCount = rows.filter((r) => r.status === "done").length;
  const listedCount = rows.filter((r) => r.data && r.data.listedCount > 0).length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const progressPct = rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Drop zone — shown until rows are loaded */}
      {rows.length === 0 && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag and drop a CSV file here, or click to browse"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-14 px-6 cursor-pointer transition-all select-none ${
            isDragging
              ? "border-cyan-500/70 bg-cyan-500/5"
              : "border-[#1e2d4a] bg-[#0f1629] hover:border-cyan-500/40 hover:bg-cyan-500/[0.03]"
          }`}
        >
          <span
            className={`flex items-center justify-center w-12 h-12 rounded-xl ${
              isDragging ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-700/50 text-slate-400"
            }`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </span>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-200">
              {isDragging ? "Drop to upload" : "Drag & drop a CSV file"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              or{" "}
              <span className="text-cyan-400 hover:text-cyan-300 transition-colors">
                browse files
              </span>{" "}
              — first column should contain IP addresses or domains
            </p>
          </div>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload CSV file"
          />
        </div>
      )}

      {/* Parse error */}
      {parseError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {parseError}
        </div>
      )}

      {/* File loaded — show action bar */}
      {rows.length > 0 && (
        <div className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] shadow-[0_4px_24px_rgba(0,0,0,0.3)] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {rows.length} target{rows.length !== 1 ? "s" : ""} loaded
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRunning
                ? `Checking… ${doneCount} / ${rows.length} complete`
                : isComplete
                ? `Done — ${listedCount} listed, ${errorCount} error${errorCount !== 1 ? "s" : ""}`
                : "Ready to check"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning && !isComplete && (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl border border-[#1e2d4a] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={runBulkCheck}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  Check All Blacklists
                </button>
              </>
            )}
            {isRunning && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium transition-all"
              >
                Cancel
              </button>
            )}
            {isComplete && (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl border border-[#1e2d4a] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
                >
                  New Upload
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  aria-label="Download results as CSV"
                >
                  {DownloadIcon}
                  Download Results
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {isRunning && rows.length > 0 && (
        <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressPct}% complete`}
          />
        </div>
      )}

      {/* Results table */}
      {rows.length > 0 && (
        <Card title="Bulk Check Results">
          <div className="overflow-x-auto -mx-5 -my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#162038]">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">
                    Target
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                    Listed
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    Lists Hit
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden lg:table-cell">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]">
                {rows.map((row, i) => (
                  <tr key={`${row.target}-${i}`} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-300 max-w-[180px] truncate">
                      {row.target}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${rowStatusClasses(row)}`}
                      >
                        {row.status === "checking" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
                        )}
                        {statusLabel(row)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-slate-400">
                      {row.data ? `${row.data.listedCount} / ${row.data.totalChecked}` : "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {row.data && row.data.listedCount > 0 ? (
                        <span className="text-xs text-red-400">
                          {row.data.entries
                            .filter((e) => e.listed)
                            .map((e) => e.source)
                            .join(", ")}
                        </span>
                      ) : row.data ? (
                        <span className="text-xs text-slate-600">None</span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-right">
                      {row.error && (
                        <span className="text-xs text-red-400 truncate max-w-[140px] inline-block" title={row.error}>
                          {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

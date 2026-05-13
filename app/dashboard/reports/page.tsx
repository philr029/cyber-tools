"use client";

import { useState, useEffect } from "react";
import { loadHistory, loadSavedScans, hydrateHistory } from "@/lib/mockData";
import { loadCases } from "@/lib/enterprise-mock";
import { useWorkspace } from "@/lib/workspace-context";
import type { HistoryEntry, SavedScan } from "@/lib/types";

// ---------------------------------------------------------------------------
// JSON export helper (client-side download)
// ---------------------------------------------------------------------------

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// CSV export helper (client-side download)
// ---------------------------------------------------------------------------

function downloadCSV(rows: string[][], filename: string) {
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// "PDF" export — generates a printable HTML page in a new tab
// ---------------------------------------------------------------------------

function openPDFReport(title: string, content: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: monospace; background:#fff; color:#111; padding:2rem; max-width:800px; margin:0 auto; }
    h1 { font-size:1.4rem; border-bottom:2px solid #ddd; padding-bottom:.5rem; }
    h2 { font-size:1rem; margin-top:1.5rem; color:#444; }
    table { width:100%; border-collapse:collapse; margin-top:.5rem; font-size:.8rem; }
    th,td { border:1px solid #ddd; padding:.4rem .6rem; text-align:left; }
    th { background:#f5f5f5; }
    .safe { color:#16a34a; font-weight:bold; }
    .warning { color:#d97706; font-weight:bold; }
    .risk { color:#dc2626; font-weight:bold; }
    .meta { font-size:.75rem; color:#888; margin-bottom:1rem; }
    @media print { button { display:none; } }
  </style>
</head>
<body>
  <h1>🛡️ ${title}</h1>
  <p class="meta">Generated: ${new Date().toLocaleString()} — SecureScope Enterprise</p>
  ${content}
  <br/>
  <button onclick="window.print()">🖨️ Print / Save as PDF</button>
</body>
</html>`;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

// ---------------------------------------------------------------------------
// Report card
// ---------------------------------------------------------------------------

function ReportCard({
  title,
  description,
  icon,
  onJSON,
  onCSV,
  onPDF,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onJSON: () => void;
  onCSV: () => void;
  onPDF: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPDF}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-xs text-slate-300 hover:text-slate-100 hover:border-cyan-500/30 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0-6a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
          </svg>
          PDF
        </button>
        <button
          type="button"
          onClick={onCSV}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-xs text-slate-300 hover:text-slate-100 hover:border-cyan-500/30 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          CSV
        </button>
        <button
          type="button"
          onClick={onJSON}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-xs text-slate-300 hover:text-slate-100 hover:border-cyan-500/30 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm4 6.5a.75.75 0 01.75-.75h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75zm-3.5-6a.75.75 0 100 1.5.75.75 0 000-1.5zm0 3a.75.75 0 100 1.5.75.75 0 000-1.5zm0 3a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" />
          </svg>
          JSON
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const { activeWorkspace } = useWorkspace();
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    typeof window === "undefined" ? [] : loadHistory(),
  );
  const [saved] = useState<SavedScan[]>(() => loadSavedScans());

  useEffect(() => {
    void hydrateHistory().then(setHistory);
    const onVault = () => void hydrateHistory().then(setHistory);
    window.addEventListener("ss-vault-changed", onVault);
    return () => window.removeEventListener("ss-vault-changed", onVault);
  }, []);

  const cases = loadCases().filter((c) => c.workspaceId === activeWorkspace?.id);

  // --- Scan history report ---
  function exportScanHistoryJSON() {
    downloadJSON({ workspace: activeWorkspace?.name, generated: new Date().toISOString(), scans: history }, `securescope-scan-history-${Date.now()}.json`);
  }

  function exportScanHistoryCSV() {
    const rows: string[][] = [
      ["Timestamp", "Query", "Overall Status", "IP Status", "Domain Status", "Blacklist Status", "SSL Status"],
      ...history.map((h) => [
        new Date(h.timestamp).toISOString(),
        h.query,
        h.overallStatus,
        h.resultSnapshot.ipStatus,
        h.resultSnapshot.domainStatus,
        h.resultSnapshot.blacklistStatus,
        h.resultSnapshot.sslStatus,
      ]),
    ];
    downloadCSV(rows, `securescope-scan-history-${Date.now()}.csv`);
  }

  function exportScanHistoryPDF() {
    const rows = history
      .map((h) => `<tr>
        <td>${new Date(h.timestamp).toLocaleString()}</td>
        <td>${h.query}</td>
        <td class="${h.overallStatus}">${h.overallStatus.toUpperCase()}</td>
      </tr>`)
      .join("");
    const content = `
      <h2>Scan History (${history.length} records)</h2>
      <table>
        <thead><tr><th>Timestamp</th><th>Query</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3">No scan history.</td></tr>'}</tbody>
      </table>`;
    openPDFReport("Scan History Report", content);
  }

  // --- Case management report ---
  function exportCasesJSON() {
    downloadJSON({ workspace: activeWorkspace?.name, generated: new Date().toISOString(), cases }, `securescope-cases-${Date.now()}.json`);
  }

  function exportCasesCSV() {
    const rows: string[][] = [
      ["Title", "Severity", "Status", "Assignee", "Created", "Updated"],
      ...cases.map((c) => [
        c.title,
        c.severity,
        c.status,
        c.assignee ?? "",
        new Date(c.createdAt).toISOString(),
        new Date(c.updatedAt).toISOString(),
      ]),
    ];
    downloadCSV(rows, `securescope-cases-${Date.now()}.csv`);
  }

  function exportCasesPDF() {
    const rows = cases
      .map((c) => `<tr>
        <td>${c.title}</td>
        <td class="${c.severity === "critical" || c.severity === "high" ? "risk" : c.severity === "medium" ? "warning" : "safe"}">${c.severity.toUpperCase()}</td>
        <td>${c.status}</td>
        <td>${c.assignee ?? "—"}</td>
        <td>${new Date(c.updatedAt).toLocaleDateString()}</td>
      </tr>`)
      .join("");
    const openCount = cases.filter((c) => c.status === "open").length;
    const invCount = cases.filter((c) => c.status === "investigating").length;
    const resCount = cases.filter((c) => c.status === "resolved").length;
    const content = `
      <h2>Case Summary</h2>
      <table>
        <thead><tr><th>Metric</th><th>Count</th></tr></thead>
        <tbody>
          <tr><td>Total Cases</td><td>${cases.length}</td></tr>
          <tr><td>Open</td><td>${openCount}</td></tr>
          <tr><td>Investigating</td><td>${invCount}</td></tr>
          <tr><td>Resolved</td><td>${resCount}</td></tr>
        </tbody>
      </table>
      <h2>Case Details</h2>
      <table>
        <thead><tr><th>Title</th><th>Severity</th><th>Status</th><th>Assignee</th><th>Updated</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5">No cases.</td></tr>'}</tbody>
      </table>`;
    openPDFReport("Case Management Report", content);
  }

  // --- Security posture report ---
  function exportPostureJSON() {
    const safe = history.filter((h) => h.overallStatus === "safe").length;
    const warning = history.filter((h) => h.overallStatus === "warning").length;
    const risk = history.filter((h) => h.overallStatus === "risk").length;
    downloadJSON({
      workspace: activeWorkspace?.name,
      generated: new Date().toISOString(),
      summary: { totalScans: history.length, safe, warning, risk, threatRate: history.length ? `${((risk / history.length) * 100).toFixed(1)}%` : "0%" },
      cases: { total: cases.length, open: cases.filter((c) => c.status === "open").length, resolved: cases.filter((c) => c.status === "resolved").length },
    }, `securescope-posture-${Date.now()}.json`);
  }

  function exportPostureCSV() {
    const safe = history.filter((h) => h.overallStatus === "safe").length;
    const warning = history.filter((h) => h.overallStatus === "warning").length;
    const risk = history.filter((h) => h.overallStatus === "risk").length;
    const rows: string[][] = [
      ["Metric", "Value"],
      ["Workspace", activeWorkspace?.name ?? ""],
      ["Generated", new Date().toISOString()],
      ["Total Scans", String(history.length)],
      ["Safe", String(safe)],
      ["Warnings", String(warning)],
      ["High Risk", String(risk)],
      ["Threat Rate", history.length ? `${((risk / history.length) * 100).toFixed(1)}%` : "0%"],
      ["Total Cases", String(cases.length)],
      ["Open Cases", String(cases.filter((c) => c.status === "open").length)],
      ["Resolved Cases", String(cases.filter((c) => c.status === "resolved").length)],
    ];
    downloadCSV(rows, `securescope-posture-${Date.now()}.csv`);
  }

  function exportPosturePDF() {
    const safe = history.filter((h) => h.overallStatus === "safe").length;
    const warning = history.filter((h) => h.overallStatus === "warning").length;
    const risk = history.filter((h) => h.overallStatus === "risk").length;
    const totalScans = history.length || 1;
    const content = `
      <h2>Security Posture Summary — ${activeWorkspace?.name}</h2>
      <table>
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Total Scans</td><td>${history.length}</td></tr>
          <tr><td>Safe</td><td class="safe">${safe} (${((safe / totalScans) * 100).toFixed(0)}%)</td></tr>
          <tr><td>Warning</td><td class="warning">${warning} (${((warning / totalScans) * 100).toFixed(0)}%)</td></tr>
          <tr><td>High Risk</td><td class="risk">${risk} (${((risk / totalScans) * 100).toFixed(0)}%)</td></tr>
          <tr><td>Saved Scans</td><td>${saved.length}</td></tr>
          <tr><td>Active Cases</td><td>${cases.filter((c) => c.status !== "resolved").length}</td></tr>
          <tr><td>Resolved Cases</td><td>${cases.filter((c) => c.status === "resolved").length}</td></tr>
        </tbody>
      </table>
      <h2>Findings</h2>
      <p>Of ${history.length} scans performed, ${risk} returned high-risk results requiring immediate attention, 
      ${warning} returned warnings, and ${safe} were clean. 
      ${cases.length} security cases have been created across this workspace.</p>`;
    openPDFReport("Security Posture Report", content);
  }

  const safe = history.filter((h) => h.overallStatus === "safe").length;
  const warning = history.filter((h) => h.overallStatus === "warning").length;
  const risk = history.filter((h) => h.overallStatus === "risk").length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">Reports &amp; Export</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Generate security reports for <span className="text-cyan-400">{activeWorkspace?.name}</span>
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-slate-100">{history.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Scans</p>
        </div>
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{risk}</p>
          <p className="text-xs text-slate-500 mt-0.5">High Risk</p>
        </div>
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{warning}</p>
          <p className="text-xs text-slate-500 mt-0.5">Warnings</p>
        </div>
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{safe}</p>
          <p className="text-xs text-slate-500 mt-0.5">Safe</p>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ReportCard
          title="Security Posture"
          description="Executive summary of your overall security posture, risk trends, and findings."
          onJSON={exportPostureJSON}
          onCSV={exportPostureCSV}
          onPDF={exportPosturePDF}
          icon={
            <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
            </svg>
          }
        />
        <ReportCard
          title="Scan History"
          description="Full list of all scans run with timestamps, targets, and status results."
          onJSON={exportScanHistoryJSON}
          onCSV={exportScanHistoryCSV}
          onPDF={exportScanHistoryPDF}
          icon={
            <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          }
        />
        <ReportCard
          title="Case Management"
          description="Security incidents and investigations — status, severity, and resolution details."
          onJSON={exportCasesJSON}
          onCSV={exportCasesCSV}
          onPDF={exportCasesPDF}
          icon={
            <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M2 4.75C2 3.784 2.784 3 3.75 3h4.836c.464 0 .909.184 1.237.513l1.414 1.414c.329.328.773.512 1.237.512H16.25c.966 0 1.75.784 1.75 1.75v8.75A1.75 1.75 0 0116.25 17H3.75A1.75 1.75 0 012 15.25V4.75z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* API / Webhook info */}
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
        <p className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 00-1.06 1.06l2.22 2.22H3a.75.75 0 000 1.5h4.44l-2.22 2.22a.75.75 0 101.06 1.06l3.5-3.5a.75.75 0 000-1.06l-3.5-3.5zm8.44 1.5a.75.75 0 010 1.06l-2.22 2.22H17a.75.75 0 010 1.5h-4.44l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          API &amp; Webhook Integration
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Trigger scans externally or push report data to your SIEM / ticketing system via these endpoints.
        </p>
        <div className="space-y-2">
          {[
            { method: "POST", path: "/api/lookup/ip", desc: "Run an IP reputation scan" },
            { method: "POST", path: "/api/lookup/domain", desc: "Run a domain reputation scan" },
            { method: "GET", path: "/api/admin/users", desc: "Admin-only directory (Supabase profiles + RLS)" },
            { method: "POST", path: "/api/tools/threat-score", desc: "Get full domain threat score" },
          ].map(({ method, path, desc }) => (
            <div key={path} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a]">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${method === "POST" ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>
                {method}
              </span>
              <code className="text-xs text-cyan-400 font-mono">{path}</code>
              <span className="text-xs text-slate-500 ml-auto">{desc}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 mt-3">
          Webhook support: configure Slack / Teams webhooks via Playbooks → webhook_slack / webhook_teams actions.
        </p>
      </div>
    </div>
  );
}

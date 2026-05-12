"use client";

import { useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import {
  sanitizeMultilineInput,
  sanitizeSingleLineInput,
} from "@/lib/input-sanitization";
import { withBasePath } from "@/lib/base-path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportFinding {
  id: string;
  title: string;
  severity: "Info" | "Low" | "Medium" | "High" | "Critical";
  description: string;
  impact: string;
}

interface ReportRecommendation {
  priority: "Immediate" | "Short-term" | "Long-term";
  action: string;
}

interface AIReportResult {
  title: string;
  executive_summary: string;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  risk_score: number;
  findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  conclusion: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RISK_COLORS: Record<string, string> = {
  Low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium:   "text-amber-400   bg-amber-500/10   border-amber-500/20",
  High:     "text-orange-400  bg-orange-500/10  border-orange-500/20",
  Critical: "text-red-400     bg-red-500/10     border-red-500/20",
};

const RISK_BAR_COLORS: Record<string, string> = {
  Low:      "bg-emerald-500",
  Medium:   "bg-amber-500",
  High:     "bg-orange-500",
  Critical: "bg-red-500",
};

const SEVERITY_COLORS: Record<string, string> = {
  Info:     "text-blue-400    bg-blue-500/10    border-blue-500/20",
  Low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium:   "text-amber-400   bg-amber-500/10   border-amber-500/20",
  High:     "text-orange-400  bg-orange-500/10  border-orange-500/20",
  Critical: "text-red-400     bg-red-500/10     border-red-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  Immediate:   "text-red-400    bg-red-500/10    border-red-500/20",
  "Short-term": "text-amber-400  bg-amber-500/10  border-amber-500/20",
  "Long-term":  "text-blue-400   bg-blue-500/10   border-blue-500/20",
};

const EXAMPLE_CONTEXTS = [
  {
    label: "Domain scan (high risk)",
    context: `Domain: malicious-example.com
SSL: Expired certificate (expired 45 days ago)
SPF: Not configured
DKIM: Not configured
DMARC: Not configured
Blacklist: Listed on 3 blacklists (Spamhaus, SORBS, Barracuda)
Open ports: 21 (FTP), 22 (SSH), 80 (HTTP), 3389 (RDP)
WHOIS: Registered 2 months ago, registrant privacy enabled
VirusTotal: 8/90 vendors flagged as malicious`,
  },
  {
    label: "Email investigation",
    context: `Email header analysis for suspicious email:
SPF: FAIL (spoofed sender domain)
DKIM: Not present
DMARC: Not configured
From: CEO <ceo@comp4ny.com> (note: 4 instead of a)
Reply-To: attacker@gmail.com (different domain)
Sender IP: 185.220.101.5 (known Tor exit node)
Subject: URGENT: Wire transfer request
Suspicious indicators: mismatched reply-to domain, encoded subject, 7 received hops`,
  },
  {
    label: "IP threat assessment",
    context: `IP: 192.0.2.100
AbuseIPDB: Confidence score 87%, 142 reports in last 30 days
VirusTotal: 12/90 vendors malicious
Geolocation: Unknown/anonymous proxy
Open ports: 22 (SSH brute-force detected), 25 (SMTP), 80, 443
Last seen: Scanning for vulnerabilities
ISP: DataCenter hosting provider`,
  },
];

const Icon = (
  <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Report viewer
// ---------------------------------------------------------------------------

function ReportViewer({ report }: { report: AIReportResult }) {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);

  function copyReport() {
    const text = [
      `# ${report.title}`,
      ``,
      `## Executive Summary`,
      report.executive_summary,
      ``,
      `**Risk Level:** ${report.risk_level} (${report.risk_score}/100)`,
      ``,
      `## Findings`,
      ...report.findings.map(
        (f) => `### ${f.id}: ${f.title} [${f.severity}]\n${f.description}\n\n**Impact:** ${f.impact}`,
      ),
      ``,
      `## Recommendations`,
      ...report.recommendations.map((r) => `- **[${r.priority}]** ${r.action}`),
      ``,
      `## Conclusion`,
      report.conclusion,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `securescope-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Report header */}
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2d4a] bg-[#0b0f1a] flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">{report.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Generated by SecureScope AI · {new Date().toLocaleDateString("en-GB", { dateStyle: "medium" })}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={copyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-cyan-400 bg-[#131929] border border-[#1e2d4a] hover:border-cyan-500/30 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={exportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-emerald-400 bg-[#131929] border border-[#1e2d4a] hover:border-emerald-500/30 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v7.44l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L6.22 10.28a.75.75 0 111.06-1.06l1.97 1.97V3.75A.75.75 0 0110 3zm-4.28 9.22a.75.75 0 01.75.75V15h7v-2.03a.75.75 0 011.5 0V15.5a.75.75 0 01-.75.75H5.75a.75.75 0 01-.75-.75v-2.53a.75.75 0 01.75-.75h-.04z" clipRule="evenodd" />
              </svg>
              {exported ? "Saved!" : "Export JSON"}
            </button>
          </div>
        </div>

        {/* Risk score */}
        <div className="px-5 py-4 border-b border-[#1e2d4a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Overall Risk</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${RISK_COLORS[report.risk_level]}`}>
              {report.risk_level} — {report.risk_score}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#1e2d4a] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${RISK_BAR_COLORS[report.risk_level]}`}
              style={{ width: `${report.risk_score}%` }}
            />
          </div>
        </div>

        {/* Executive summary */}
        <div className="px-5 py-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{report.executive_summary}</p>
        </div>
      </div>

      {/* Findings */}
      {report.findings.length > 0 && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a]">
            <span className="text-sm font-medium text-slate-300">
              Findings{" "}
              <span className="text-xs text-slate-500 font-normal">({report.findings.length})</span>
            </span>
          </div>
          <div className="divide-y divide-[#1e2d4a]">
            {report.findings.map((f) => (
              <div key={f.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600">{f.id}</span>
                    <h4 className="text-sm font-semibold text-slate-200">{f.title}</h4>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${SEVERITY_COLORS[f.severity]}`}>
                    {f.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{f.description}</p>
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Impact:</span>
                  <span className="text-xs text-slate-500 leading-relaxed">{f.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a]">
            <span className="text-sm font-medium text-slate-300">
              Recommendations{" "}
              <span className="text-xs text-slate-500 font-normal">({report.recommendations.length})</span>
            </span>
          </div>
          <div className="p-5 space-y-2.5">
            {report.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 mt-0.5 ${PRIORITY_COLORS[r.priority]}`}>
                  {r.priority}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{r.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusion */}
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] px-5 py-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conclusion</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{report.conclusion}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AIReportPage() {
  const [context, setContext] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedContext = sanitizeMultilineInput(context, { maxLength: 8000 });
    const safeTitle = sanitizeSingleLineInput(title, { maxLength: 160 });
    if (!trimmedContext) {
      setError("Please provide scan findings or context to generate a report.");
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch(withBasePath("/api/tools/ai-report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: trimmedContext, title: safeTitle }),
      });
      const json = await res.json() as { data?: AIReportResult; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Report generation failed.");
      } else if (json.data) {
        setReport(json.data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageLayout
      title="AI Report Generator"
      description="Paste scan findings or context and let AI generate a professional security report with executive summary, findings, risk level, and actionable recommendations."
    >
      {/* Example contexts */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLE_CONTEXTS.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => { setContext(ex.context); setReport(null); setError(null); }}
            className="text-xs bg-[#0d1321] border border-[#1e2d4a] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 space-y-4">
          {/* Optional title */}
          <div>
            <label htmlFor="report-title" className="block text-xs font-medium text-slate-400 mb-1.5">
              Report Title <span className="text-slate-600 font-normal">(optional)</span>
            </label>
            <input
              id="report-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Threat Assessment: example.com"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-[#1e2d4a] bg-[#0b0f1a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
            />
          </div>

          {/* Findings / context */}
          <div>
            <label htmlFor="report-context" className="block text-xs font-medium text-slate-400 mb-1.5">
              Scan Findings or Context
            </label>
            <textarea
              id="report-context"
              value={context}
              onChange={(e) => { setContext(e.target.value); setReport(null); setError(null); }}
              placeholder="Paste your scan results, tool outputs, or describe the security findings you want to report on…"
              rows={10}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-[#1e2d4a] bg-[#0b0f1a] text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-y disabled:opacity-50 font-mono leading-relaxed"
            />
            <p className="text-xs text-slate-600 mt-1">
              Supports raw text, JSON results, or plain descriptions. Max 8 000 characters.{" "}
              {context.length > 0 && <span className={context.length > 7500 ? "text-amber-400" : ""}>{context.length}/8000</span>}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !context.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating report…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
      </form>

      {loading && (
        <LoadingSpinner
          label="Generating security report…"
          sublabel="AI is analysing findings and structuring the report — this usually takes 5–15 seconds."
        />
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mt-4">
          {error}
        </div>
      )}

      {!loading && report && (
        <div className="mt-6">
          <ReportViewer report={report} />
        </div>
      )}

      {!loading && !report && !error && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-10 text-center mt-4">
          {Icon}
          <p className="text-sm text-slate-400 mt-3">Paste scan findings above to generate a professional security report.</p>
          <p className="text-xs text-slate-600 mt-1">
            AI generates an executive summary, structured findings, risk level, and prioritised recommendations.
          </p>
        </div>
      )}
    </ToolPageLayout>
  );
}

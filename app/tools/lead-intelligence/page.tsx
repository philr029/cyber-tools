"use client";

import { useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeadFinding {
  label: string;
  detail: string;
  severity: "info" | "warning" | "risk" | "pass";
}

interface LeadIntelligenceResult {
  target: string;
  targetType: "email" | "domain" | "phone" | "ip" | "unknown";
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High" | "Critical";
  isDisposable: boolean;
  isValidFormat: boolean;
  domainExists: boolean;
  hasMXRecords: boolean;
  findings: LeadFinding[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEVERITY_STYLES: Record<LeadFinding["severity"], { bg: string; text: string; icon: string }> = {
  pass:    { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", icon: "✓" },
  warning: { bg: "bg-amber-500/10 border-amber-500/20",    text: "text-amber-400",   icon: "⚠" },
  risk:    { bg: "bg-red-500/10 border-red-500/20",         text: "text-red-400",     icon: "✕" },
  info:    { bg: "bg-blue-500/10 border-blue-500/20",       text: "text-blue-400",    icon: "ℹ" },
};

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

const TYPE_LABELS: Record<string, string> = {
  email:   "Email Address",
  domain:  "Domain",
  phone:   "Phone Number",
  ip:      "IP Address",
  unknown: "Unknown",
};

const EXAMPLES = [
  { label: "Disposable email", value: "test@mailinator.com" },
  { label: "Business email", value: "admin@example.com" },
  { label: "Domain", value: "google.com" },
  { label: "Phone", value: "+1 202 555 0199" },
];

const Icon = (
  <svg className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Result card
// ---------------------------------------------------------------------------

function ResultCard({ data }: { data: LeadIntelligenceResult }) {
  const [copied, setCopied] = useState(false);

  function copyResult() {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Overview card */}
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-200 truncate max-w-xs">{data.target}</span>
            <span className="text-xs bg-[#131929] border border-[#1e2d4a] text-slate-400 px-2 py-0.5 rounded-full">
              {TYPE_LABELS[data.targetType] ?? data.targetType}
            </span>
          </div>
          <button
            type="button"
            onClick={copyResult}
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
            </svg>
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        </div>

        {/* Risk score row */}
        <div className="px-5 py-4 border-b border-[#1e2d4a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Risk Score</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${RISK_COLORS[data.riskLabel]}`}>
              {data.riskLabel} — {data.riskScore}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#1e2d4a] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${RISK_BAR_COLORS[data.riskLabel]}`}
              style={{ width: `${data.riskScore}%` }}
            />
          </div>
        </div>

        {/* Meta row */}
        <div className="px-5 py-3 border-b border-[#1e2d4a] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: "Format", value: data.isValidFormat ? "Valid" : "Invalid", ok: data.isValidFormat },
            { label: "Disposable", value: data.isDisposable ? "Yes" : "No", ok: !data.isDisposable },
            { label: "Domain resolves", value: data.domainExists ? "Yes" : "No / N/A", ok: data.domainExists },
            { label: "MX Records", value: data.hasMXRecords ? "Present" : "None / N/A", ok: data.hasMXRecords },
          ].map(({ label, value, ok }) => (
            <div key={label} className="space-y-0.5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
              <p className={`text-xs font-semibold ${ok ? "text-emerald-400" : "text-slate-400"}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="px-5 py-3">
          <p className="text-xs text-slate-400 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Findings */}
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a]">
          <span className="text-sm font-medium text-slate-300">
            Findings{" "}
            <span className="text-xs text-slate-500 font-normal">({data.findings.length})</span>
          </span>
        </div>
        <div className="p-5 space-y-2">
          {data.findings.map((f, i) => {
            const style = SEVERITY_STYLES[f.severity];
            return (
              <div key={i} className={`rounded-xl border px-4 py-3 ${style.bg}`}>
                <div className="flex items-start gap-2.5">
                  <span className={`text-sm font-bold leading-5 shrink-0 ${style.text}`}>{style.icon}</span>
                  <div>
                    <p className={`text-xs font-semibold ${style.text}`}>{f.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LeadIntelligencePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadIntelligenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = sanitizeSingleLineInput(input);
    if (!trimmed) {
      setError("Please enter an email address, domain, or phone number.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/lead-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: trimmed }),
      });
      const json = await res.json() as { data?: LeadIntelligenceResult; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Request failed.");
      } else if (json.data) {
        setResult(json.data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageLayout
      title="Lead Intelligence Checker"
      description="Validate email addresses, domains, and phone numbers. Detect disposable emails, assess risk scores, and surface actionable intelligence."
    >
      {/* Examples */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => { setInput(ex.value); setResult(null); setError(null); }}
            className="text-xs bg-[#0d1321] border border-[#1e2d4a] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="lead-input" className="block text-xs font-medium text-slate-400 mb-1.5">
            Email, Domain, or Phone
          </label>
          <div className="flex gap-3">
            <input
              id="lead-input"
              type="text"
              value={input}
              onChange={(e) => { setInput(sanitizeSingleLineInput(e.target.value, { trim: false })); setResult(null); setError(null); }}
              placeholder="user@example.com · example.com · +1 202 555 0199"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-[#1e2d4a] bg-[#0b0f1a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-[0_0_12px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] min-w-[90px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking…
                </span>
              ) : "Check"}
            </button>
          </div>
        </div>
      </form>

      {loading && (
        <LoadingSpinner
          label="Running intelligence checks…"
          sublabel="Validating format, checking DNS records, and scoring risk…"
        />
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mt-4">
          {error}
        </div>
      )}

      {!loading && result && (
        <div className="mt-4">
          <ResultCard data={result} />
        </div>
      )}

      {!loading && !result && !error && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-10 text-center mt-4">
          {Icon}
          <p className="text-sm text-slate-400 mt-3">Enter an email, domain, or phone number to run intelligence checks.</p>
          <p className="text-xs text-slate-600 mt-1">
            Detects disposable emails, verifies DNS records, validates formats, and scores risk.
          </p>
        </div>
      )}
    </ToolPageLayout>
  );
}

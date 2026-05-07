"use client";

import { useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DomainVariant {
  variant: string;
  technique: string;
  registered: boolean;
  resolvesTo: string | null;
}

interface DomainProtectionResult {
  baseDomain: string;
  baseName: string;
  baseTLD: string;
  registeredVariants: DomainVariant[];
  unregisteredVariants: DomainVariant[];
  totalChecked: number;
  threatCount: number;
  riskLabel: "Low" | "Medium" | "High" | "Critical";
  summary: string;
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

const TECHNIQUE_COLORS: Record<string, string> = {
  "Character omission":            "text-amber-400 bg-amber-400/10",
  "Keyboard substitution":         "text-orange-400 bg-orange-400/10",
  "Character repetition":          "text-yellow-400 bg-yellow-400/10",
  "Character transposition":       "text-amber-400 bg-amber-400/10",
  "Homoglyph substitution":        "text-red-400 bg-red-400/10",
  "Prefix addition":               "text-pink-400 bg-pink-400/10",
  "Suffix addition":               "text-pink-400 bg-pink-400/10",
  "Prefix concat":                 "text-pink-400 bg-pink-400/10",
  "Suffix concat":                 "text-pink-400 bg-pink-400/10",
  "TLD permutation":               "text-violet-400 bg-violet-400/10",
  "Hyphen removal":                "text-cyan-400 bg-cyan-400/10",
  "Hyphen insertion":              "text-cyan-400 bg-cyan-400/10",
  "Missing dot (subdomain squatting)": "text-blue-400 bg-blue-400/10",
};

function techniqueClass(technique: string): string {
  return TECHNIQUE_COLORS[technique] ?? "text-slate-400 bg-slate-400/10";
}

const EXAMPLES = ["example.com", "google.com", "microsoft.com", "amazon.co.uk"];

const Icon = (
  <svg className="w-10 h-10 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Variant table
// ---------------------------------------------------------------------------

function VariantTable({
  variants,
  registered,
}: {
  variants: DomainVariant[];
  registered: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const display = expanded ? variants : variants.slice(0, 10);

  if (variants.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
      <div className={`px-5 py-3 border-b border-[#1e2d4a] flex items-center justify-between ${registered ? "bg-red-500/5" : "bg-[#0b0f1a]"}`}>
        <div className="flex items-center gap-2">
          {registered ? (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
          )}
          <span className={`text-sm font-medium ${registered ? "text-red-300" : "text-slate-300"}`}>
            {registered ? `${variants.length} Registered Lookalike${variants.length !== 1 ? "s" : ""}` : `${variants.length} Unregistered Variant${variants.length !== 1 ? "s" : ""}`}
          </span>
        </div>
        <span className="text-xs text-slate-600">
          {registered ? "⚠ Potential threats" : "✓ Not yet registered"}
        </span>
      </div>

      <div className="divide-y divide-[#1e2d4a]">
        {display.map((v) => (
          <div key={v.variant} className={`flex items-center justify-between px-5 py-2.5 ${registered ? "hover:bg-red-500/5" : "hover:bg-[#131929]"} transition-colors`}>
            <div className="flex items-center gap-3 min-w-0">
              <code className={`text-sm font-mono font-semibold truncate ${registered ? "text-red-300" : "text-slate-400"}`}>
                {v.variant}
              </code>
              {v.resolvesTo && (
                <span className="text-[10px] font-mono text-slate-600 shrink-0">{v.resolvesTo}</span>
              )}
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-3 ${techniqueClass(v.technique)}`}>
              {v.technique}
            </span>
          </div>
        ))}
      </div>

      {variants.length > 10 && (
        <div className="px-5 py-2.5 border-t border-[#1e2d4a] bg-[#0b0f1a]">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {expanded ? "Show less" : `Show ${variants.length - 10} more…`}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result card
// ---------------------------------------------------------------------------

function ResultCard({ data }: { data: DomainProtectionResult }) {
  const [copied, setCopied] = useState(false);

  function copyResult() {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const riskPercent = Math.min(100, (data.threatCount / Math.max(1, data.totalChecked)) * 100 * 3);

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono font-semibold text-slate-200">{data.baseDomain}</code>
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

        {/* Risk */}
        <div className="px-5 py-4 border-b border-[#1e2d4a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Brand Threat Level</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${RISK_COLORS[data.riskLabel]}`}>
              {data.riskLabel}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#1e2d4a] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${RISK_BAR_COLORS[data.riskLabel]}`}
              style={{ width: `${Math.min(100, riskPercent)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-3 border-b border-[#1e2d4a] grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Variants Checked", value: data.totalChecked },
            { label: "Registered Threats", value: data.threatCount, highlight: data.threatCount > 0 },
            { label: "Unregistered", value: data.unregisteredVariants.length },
          ].map(({ label, value, highlight }) => (
            <div key={label}>
              <p className={`text-lg font-bold ${highlight ? "text-red-400" : "text-slate-200"}`}>{value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="px-5 py-3">
          <p className="text-xs text-slate-400 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Registered threats */}
      {data.registeredVariants.length > 0 && (
        <VariantTable variants={data.registeredVariants} registered={true} />
      )}

      {/* Unregistered variants */}
      <VariantTable variants={data.unregisteredVariants} registered={false} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DomainProtectionPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainProtectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = sanitizeSingleLineInput(input);
    if (!trimmed) {
      setError("Please enter a domain name.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/domain-protection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed }),
      });
      const json = await res.json() as { data?: DomainProtectionResult; error?: string };
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
      title="Domain Protection Tool"
      description="Detect lookalike and typosquat domains that could be used for brand impersonation or phishing attacks."
    >
      {/* Examples */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => { setInput(ex); setResult(null); setError(null); }}
            className="text-xs bg-[#0d1321] border border-[#1e2d4a] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="domain-input" className="block text-xs font-medium text-slate-400 mb-1.5">
            Your Domain
          </label>
          <div className="flex gap-3">
            <input
              id="domain-input"
              type="text"
              value={input}
              onChange={(e) => { setInput(sanitizeSingleLineInput(e.target.value, { trim: false })); setResult(null); setError(null); }}
              placeholder="example.com"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-[#1e2d4a] bg-[#0b0f1a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-[0_0_12px_rgba(244,63,94,0.2)] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] min-w-[90px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning…
                </span>
              ) : "Scan"}
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Checks up to 60 domain variants via DNS to identify registered lookalike domains.
          </p>
        </div>
      </form>

      {loading && (
        <LoadingSpinner
          label="Scanning for lookalike domains…"
          sublabel="Generating typosquat variants and checking DNS records — this may take 15–30 seconds."
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
          <p className="text-sm text-slate-400 mt-3">Enter your domain to scan for lookalike threats.</p>
          <p className="text-xs text-slate-600 mt-1">
            Detects character substitution, homoglyphs, TLD permutations, prefix/suffix variants, and more.
          </p>
        </div>
      )}
    </ToolPageLayout>
  );
}

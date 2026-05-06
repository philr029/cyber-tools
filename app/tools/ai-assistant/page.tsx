"use client";

/**
 * /tools/ai-assistant
 *
 * Simple frontend that calls POST /api/ai and renders the structured
 * cybersecurity report returned by the route.
 */

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

// ---------------------------------------------------------------------------
// Types — mirror the shape returned by /api/ai
// ---------------------------------------------------------------------------

interface AIAssistantResult {
  summary: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  keyFindings: string[];
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const RISK_BADGE: Record<string, string> = {
  Low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium:   "text-amber-400   bg-amber-500/10   border-amber-500/20",
  High:     "text-orange-400  bg-orange-500/10  border-orange-500/20",
  Critical: "text-red-400     bg-red-500/10     border-red-500/20",
};

const RISK_BAR: Record<string, string> = {
  Low:      "bg-emerald-500",
  Medium:   "bg-amber-500",
  High:     "bg-orange-500",
  Critical: "bg-red-500",
};

const RISK_SCORE: Record<string, number> = {
  Low: 20, Medium: 50, High: 75, Critical: 95,
};

// ---------------------------------------------------------------------------
// Example prompts
// ---------------------------------------------------------------------------

const EXAMPLES = [
  { label: "Analyze 192.0.2.100",    message: "Analyze the IP address 192.0.2.100 for potential security threats." },
  { label: "Check example.com",      message: "Perform a security assessment of the domain example.com." },
  { label: "Explain SQL injection",  message: "Explain SQL injection and how to defend against it." },
  { label: "Phishing indicators",    message: "What are the key indicators of a phishing email?" },
  { label: "Clean Sweep analysis",   message: "I have just completed a Multi-RBL check. All checks passed with zero listings found.\n\nBased on these 'clean' results, does this guarantee my emails will land in the Primary Inbox, or are there other factors like provider-specific filters (Google/Outlook) I should still be worried about?\n\nIf my IP is clean across all RBL checks but my open rates are still low, how can I check if my domain reputation is the culprit despite passing these RBLs?\n\nProvide a 'Maintenance Schedule' to ensure these numbers stay at 100% as I scale my sending volume.\n\nExplain the difference between these Public RBLs and Private Internal Filters used by Gmail and Microsoft." },
];

// ---------------------------------------------------------------------------
// Result card
// ---------------------------------------------------------------------------

function ResultCard({ result }: { result: AIAssistantResult }) {
  const score = RISK_SCORE[result.riskLevel] ?? 50;

  return (
    <div className="space-y-4 mt-6">
      {/* Summary + risk level */}
      <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2d4a] bg-[#0b0f1a] flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-slate-300">AI Cybersecurity Assessment</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${RISK_BADGE[result.riskLevel]}`}>
            {result.riskLevel} Risk
          </span>
        </div>

        {/* Risk score bar */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">Risk Score</span>
            <span className="text-xs font-mono text-slate-400">{score}/100</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#1e2d4a] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${RISK_BAR[result.riskLevel]}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="px-5 pb-5 pt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Summary</p>
          <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Key findings */}
      {result.keyFindings.length > 0 && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a]">
            <span className="text-sm font-medium text-slate-300">
              Key Findings{" "}
              <span className="text-xs text-slate-500 font-normal">({result.keyFindings.length})</span>
            </span>
          </div>
          <ul className="divide-y divide-[#1e2d4a]">
            {result.keyFindings.map((finding, i) => (
              <li key={i} className="px-5 py-3 flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{finding}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a]">
            <span className="text-sm font-medium text-slate-300">
              Recommendations{" "}
              <span className="text-xs text-slate-500 font-normal">({result.recommendations.length})</span>
            </span>
          </div>
          <ul className="divide-y divide-[#1e2d4a]">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="px-5 py-3 flex items-start gap-3">
                <svg className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page (inner — uses useSearchParams, must be wrapped in Suspense)
// ---------------------------------------------------------------------------

function AIAssistantContent() {
  const params = useSearchParams();
  const [message, setMessage]   = useState(() => {
    const raw = params.get("prompt") ?? "";
    return raw.slice(0, 4000);
  });
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState<AIAssistantResult | null>(null);
  const [error,   setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // POST /api/ai — the API key never leaves the server
      const res  = await fetch("/api/ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: trimmed }),
      });

      const json = await res.json() as AIAssistantResult & { error?: string };

      if (!res.ok || json.error) {
        setError(json.error ?? "The assistant returned an error. Please try again.");
      } else {
        setResult(json);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageLayout
      title="AI Assistant"
      description="Ask a cybersecurity question or describe a target. The assistant returns a structured summary, risk level, key findings, and recommendations."
    >
      {/* Example prompts */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => { setMessage(ex.message); setResult(null); setError(null); }}
            className="text-xs bg-[#0d1321] border border-[#1e2d4a] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 space-y-4">
          <div>
            <label htmlFor="ai-message" className="block text-xs font-medium text-slate-400 mb-1.5">
              Your question or target
            </label>
            <textarea
              id="ai-message"
              value={message}
              onChange={(e) => { setMessage(e.target.value); setResult(null); setError(null); }}
              placeholder="e.g. Analyze 192.168.1.1 for threats, or ask a cybersecurity question…"
              rows={4}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-[#1e2d4a] bg-[#0b0f1a] text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-y disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Analyze
              </>
            )}
          </button>
        </div>
      </form>

      {loading && (
        <LoadingSpinner
          label="Consulting AI assistant…"
          sublabel="Generating your cybersecurity assessment — usually takes a few seconds."
        />
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mt-4">
          {error}
        </div>
      )}

      {!loading && result && <ResultCard result={result} />}

      {!loading && !result && !error && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-10 text-center mt-4">
          <svg className="w-10 h-10 text-cyan-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <p className="text-sm text-slate-400 mt-3">Enter a question or target above to get a security assessment.</p>
          <p className="text-xs text-slate-600 mt-1">
            Powered by Gemini · API key stays server-side
          </p>
        </div>
      )}
    </ToolPageLayout>
  );
}

// ---------------------------------------------------------------------------
// Default export — wraps inner component in Suspense (required for
// useSearchParams in Next.js App Router)
// ---------------------------------------------------------------------------

export default function AIAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="h-40" role="status" aria-live="polite">
          <span className="sr-only">Loading…</span>
        </div>
      }
    >
      <AIAssistantContent />
    </Suspense>
  );
}

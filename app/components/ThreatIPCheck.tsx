"use client";

import { useState } from "react";
import type { ThreatIPResult, ThreatVerdict } from "@/lib/types";
import Card from "@/app/components/ui/Card";

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

export function getThreatVerdict(score: number): ThreatVerdict {
  if (score <= 19) return "Safe";
  if (score <= 59) return "Suspicious";
  return "Malicious";
}

export function getThreatColor(verdict: ThreatVerdict): {
  badge: string;
  dot: string;
  bar: string;
} {
  switch (verdict) {
    case "Safe":
      return {
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        dot: "bg-emerald-500",
        bar: "bg-emerald-500",
      };
    case "Suspicious":
      return {
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        dot: "bg-amber-500",
        bar: "bg-amber-400",
      };
    case "Malicious":
      return {
        badge: "bg-red-50 text-red-700 ring-1 ring-red-200",
        dot: "bg-red-500",
        bar: "bg-red-500",
      };
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ThreatScoreRing({ score, verdict }: { score: number; verdict: ThreatVerdict }) {
  const colors = getThreatColor(verdict);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="7"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            className={`${colors.bar} transition-all duration-700`}
            stroke="currentColor"
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - filled}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900"
          aria-label={`Threat score: ${score}`}
        >
          {score}
        </span>
      </div>
      <span className="text-xs text-gray-400 font-medium">Threat Score</span>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: ThreatVerdict }) {
  const colors = getThreatColor(verdict);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${colors.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
      {verdict}
    </span>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

function SourcePill({
  name,
  available,
}: {
  name: string;
  available: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        available
          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
          : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${available ? "bg-blue-500" : "bg-gray-300"}`}
      />
      {name}
    </span>
  );
}

const ShieldIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
      clipRule="evenodd"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ThreatIPCheck() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ThreatIPResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/threat/ip?ip=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!res.ok) {
        setError((json as { error?: string }).error ?? "Request failed.");
      } else {
        setResult(json as ThreatIPResult);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const abuse = result?.sources.abuseipdb ?? null;
  const vt = result?.sources.virustotal ?? null;
  const country = abuse?.countryCode || vt?.country || "—";
  const ispOrOwner = abuse?.isp || vt?.as_owner || "—";

  return (
    <div className="space-y-4">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 8.8.8.8"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
          disabled={loading}
          aria-label="IP address to analyze"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing…
            </span>
          ) : (
            "Analyze IP"
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <svg
            className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Partial-failure warning banner */}
      {result && result.warnings.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <svg
            className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Partial results only</p>
            <ul className="mt-0.5 space-y-0.5">
              {result.warnings.map((w) => (
                <li key={w} className="text-xs text-amber-700">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Result card */}
      {result && (
        <Card
          title={`Threat Analysis: ${result.ip}`}
          icon={ShieldIcon}
          headerRight={<VerdictBadge verdict={result.verdict} />}
        >
          <div className="space-y-5">
            {/* Score + top stats */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-gray-50">
              <ThreatScoreRing score={result.threatScore} verdict={result.verdict} />
              <div className="flex-1 w-full">
                <StatRow label="IP Address" value={result.ip} />
                <StatRow label="Country" value={country} />
                <StatRow label="ISP / AS Owner" value={ispOrOwner} />
              </div>
            </div>

            {/* Detail stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  AbuseIPDB
                </p>
                <StatRow
                  label="Abuse Score"
                  value={
                    abuse !== null ? (
                      <span
                        className={
                          abuse.abuseConfidenceScore === 0
                            ? "text-emerald-600"
                            : abuse.abuseConfidenceScore < 50
                              ? "text-amber-600"
                              : "text-red-600"
                        }
                      >
                        {abuse.abuseConfidenceScore}%
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <StatRow
                  label="Total Reports"
                  value={abuse !== null ? abuse.totalReports : "—"}
                />
                <StatRow
                  label="Last Reported"
                  value={abuse !== null ? formatDate(abuse.lastReportedAt) : "—"}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  VirusTotal
                </p>
                <StatRow
                  label="Malicious"
                  value={
                    vt !== null ? (
                      <span
                        className={
                          vt.malicious === 0
                            ? "text-emerald-600"
                            : vt.malicious <= 3
                              ? "text-amber-600"
                              : "text-red-600"
                        }
                      >
                        {vt.malicious}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <StatRow
                  label="Suspicious"
                  value={
                    vt !== null ? (
                      <span
                        className={vt.suspicious === 0 ? "text-emerald-600" : "text-amber-600"}
                      >
                        {vt.suspicious}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <StatRow
                  label="Reputation"
                  value={vt !== null ? vt.reputation : "—"}
                />
              </div>
            </div>

            {/* Sources used */}
            <div className="pt-3 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Sources Used
              </p>
              <div className="flex gap-2 flex-wrap">
                <SourcePill name="AbuseIPDB" available={abuse !== null} />
                <SourcePill name="VirusTotal" available={vt !== null} />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { VTDomainResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const GlobeIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
      clipRule="evenodd"
    />
  </svg>
);

function maliciousColor(count: number) {
  if (count === 0) return "text-emerald-600";
  if (count <= 3) return "text-orange-500";
  return "text-red-600";
}

function AnalysisBar({ malicious, suspicious, harmless, undetected }: {
  malicious: number; suspicious: number; harmless: number; undetected: number;
}) {
  const total = malicious + suspicious + harmless + undetected || 1;
  const segments = [
    { label: "Malicious", count: malicious, color: "bg-red-500", text: "text-red-600" },
    { label: "Suspicious", count: suspicious, color: "bg-amber-400", text: "text-amber-600" },
    { label: "Harmless", count: harmless, color: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Undetected", count: undetected, color: "bg-gray-200", text: "text-gray-500" },
  ];

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Last Analysis ({total} engines)</p>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-gray-100">
        {segments.map((s) =>
          s.count > 0 ? (
            <div
              key={s.label}
              className={s.color}
              style={{ width: `${(s.count / total) * 100}%` }}
              title={`${s.label}: ${s.count}`}
            />
          ) : null,
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {segments.map((s) => (
          <span key={s.label} className={`text-xs font-medium ${s.text}`}>
            {s.count} {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatItem({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold ${valueClass ?? "text-gray-800"}`}>{value}</span>
    </div>
  );
}

export default function VirusTotalDomainCheck() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VTDomainResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/virustotal/domain?domain=${encodeURIComponent(input.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Request failed.");
      } else {
        setResult(json as VTDomainResult);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. example.com"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
          disabled={loading}
          aria-label="Domain to check"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Checking…
            </span>
          ) : (
            "Check Domain"
          )}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <Card
          title="Domain Reputation"
          icon={GlobeIcon}
          headerRight={<StatusBadge status={result.status} />}
        >
          <div className="space-y-4">
            <AnalysisBar
              malicious={result.malicious}
              suspicious={result.suspicious}
              harmless={result.harmless}
              undetected={result.undetected}
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <StatItem label="Domain" value={result.domain} />
              <StatItem
                label="Malicious"
                value={result.malicious}
                valueClass={maliciousColor(result.malicious)}
              />
              <StatItem label="Harmless" value={result.harmless} valueClass="text-emerald-600" />
              <StatItem label="Suspicious" value={result.suspicious} />
              <StatItem label="Reputation" value={result.reputation} />
              <StatItem label="Registrar" value={result.registrar || "—"} />
              {result.createdDate && result.createdDate !== "Unknown" && (
                <StatItem label="Created" value={result.createdDate} />
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

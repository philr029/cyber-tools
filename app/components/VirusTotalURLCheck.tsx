"use client";

import { useState } from "react";
import type { VTURLResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const URLIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
    <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
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
      <p className="text-xs text-gray-500 mb-2">Vendor Analysis ({total} engines)</p>
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

export default function VirusTotalURLCheck() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VTURLResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/virustotal/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Request failed.");
      } else {
        setResult(json as VTURLResult);
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
          placeholder="e.g. https://example.com"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
          disabled={loading}
          aria-label="URL to check"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning…
            </span>
          ) : (
            "Check URL"
          )}
        </button>
      </form>

      {loading && (
        <p className="text-xs text-gray-400 text-center">
          Submitting URL to VirusTotal and retrieving analysis — this may take a few seconds…
        </p>
      )}

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
          title="URL Analysis"
          icon={URLIcon}
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
              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">URL Checked</span>
                <span className="text-sm font-mono text-gray-800 break-all">{result.url}</span>
              </div>
              <StatItem
                label="Malicious"
                value={result.malicious}
                valueClass={maliciousColor(result.malicious)}
              />
              <StatItem label="Harmless" value={result.harmless} valueClass="text-emerald-600" />
              <StatItem label="Suspicious" value={result.suspicious} />
              <StatItem label="Undetected" value={result.undetected} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

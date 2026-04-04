"use client";

import { useState } from "react";
import type { VTURLResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { maliciousColor, AnalysisBar, StatItem, VTErrorMessage } from "@/app/components/ui/VTShared";

const URLIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
    <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
  </svg>
);

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

      {error && <VTErrorMessage message={error} />}

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

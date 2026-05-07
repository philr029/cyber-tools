"use client";

import { useState } from "react";
import type { VTIPResult } from "@/lib/types";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { maliciousColor, AnalysisBar, StatItem, VTErrorMessage } from "@/app/components/ui/VTShared";

const ShieldIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
      clipRule="evenodd"
    />
  </svg>
);

export default function VirusTotalIPCheck() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VTIPResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const safeIP = sanitizeSingleLineInput(input);
    if (!safeIP) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/virustotal/ip?ip=${encodeURIComponent(safeIP)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Request failed.");
      } else {
        setResult(json as VTIPResult);
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
          onChange={(e) => setInput(sanitizeSingleLineInput(e.target.value, { trim: false }))}
          placeholder="e.g. 8.8.8.8"
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#1e2d4a] bg-[#0f1629] text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition"
          disabled={loading}
          aria-label="IP address to check"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Checking…
            </span>
          ) : (
            "Check IP"
          )}
        </button>
      </form>

      {error && <VTErrorMessage message={error} />}

      {result && (
        <Card
          title="IP Reputation"
          icon={ShieldIcon}
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
              <StatItem label="IP Address" value={result.ip} />
              <StatItem
                label="Malicious"
                value={result.malicious}
                valueClass={maliciousColor(result.malicious)}
              />
              <StatItem label="Harmless" value={result.harmless} valueClass="text-emerald-600" />
              <StatItem label="Suspicious" value={result.suspicious} />
              <StatItem label="Reputation" value={result.reputation} />
              <StatItem label="Country" value={result.country || "—"} />
              <StatItem label="ASN" value={result.asn ?? "—"} />
              <StatItem label="AS Owner" value={result.asOwner || "—"} />
              {result.network && <StatItem label="Network" value={result.network} />}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

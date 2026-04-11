"use client";

import { useState } from "react";
import type { LookupResult } from "@/lib/types";

function buildSummary(r: LookupResult): string {
  const lines: string[] = [
    `🔍 SecureScope Scan Report`,
    `Target: ${r.query}`,
    `Scanned: ${new Date(r.timestamp).toLocaleString()}`,
    ``,
    `IP Reputation: ${r.ipReputation.status.toUpperCase()} (Abuse score: ${r.ipReputation.abuseConfidenceScore}%)`,
    `Domain Reputation: ${r.domainReputation.status.toUpperCase()} (Malicious vendors: ${r.domainReputation.malicious})`,
    `Blacklist: ${r.blacklist.listedCount}/${r.blacklist.totalChecked} lists flagged`,
    `SSL Certificate: ${r.ssl.status.toUpperCase()} (${r.ssl.daysRemaining} days remaining)`,
    `Security Headers: ${r.securityHeaders.grade} grade (${r.securityHeaders.score}/100)`,
    `Open Ports: ${r.openPorts.openCount} open`,
    ``,
    `Run your own scan at: ${typeof window !== "undefined" ? window.location.origin : "https://securescope.io"}`,
  ];
  return lines.join("\n");
}

export default function ShareButton({ result }: { result: LookupResult }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildSummary(result);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e2d4a] bg-white/5 hover:bg-white/10 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all shrink-0"
      aria-label="Copy scan summary to clipboard"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.474l6.733-3.366A2.52 2.52 0 0113 4.5z" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

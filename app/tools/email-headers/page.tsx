"use client";

import { useState } from "react";
import type { EmailHeaderResult } from "@/lib/types";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import EmailHeaderCard from "@/app/components/results/EmailHeaderCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";
import AISummaryPanel from "@/app/components/ui/AISummaryPanel";
import RiskScorePanel from "@/app/components/ui/RiskScorePanel";
import { scoreEmailHeaders } from "@/lib/risk-engine";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const PLACEHOLDER = `Received: from mail.example.com (mail.example.com [203.0.113.1])
  by mx.recipient.com with ESMTP id abc123
  for <user@recipient.com>; Mon, 8 Jan 2024 10:00:00 +0000
Authentication-Results: mx.recipient.com;
  spf=pass smtp.mailfrom=sender@example.com;
  dkim=pass header.i=@example.com;
  dmarc=pass
From: Sender Name <sender@example.com>
To: user@recipient.com
Subject: Test Email
Date: Mon, 8 Jan 2024 10:00:00 +0000
Message-ID: <abc123@mail.example.com>`;

export default function EmailHeadersPage() {
  const [loading, setLoading] = useState(false);
  const [headerInput, setHeaderInput] = useState("");
  const [data, setData] = useState<EmailHeaderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = headerInput.trim();
    if (!trimmed) {
      setError("Please paste raw email headers.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const { analyseEmailHeaders } = await import("@/lib/lookup-client");
      const { data } = await analyseEmailHeaders(trimmed);
      setData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const aiContext = data
    ? `Email header analysis: SPF=${data.spf.pass ? "pass" : data.spf.present ? `fail (${data.spf.result})` : "not found"}, DKIM=${data.dkim.pass ? "pass" : data.dkim.present ? `fail (${data.dkim.result})` : "not found"}, DMARC=${data.dmarc.pass ? "pass" : data.dmarc.present ? `fail (${data.dmarc.result})` : "not found"}, Sender IP=${data.senderIP ?? "unknown"}, From=${data.fromAddress ?? "unknown"}, Suspicious indicators: ${data.suspiciousIndicators.length > 0 ? data.suspiciousIndicators.join("; ") : "none"}.`
    : "";

  return (
    <ToolPageLayout
      title="Email Header Analyzer"
      description="Paste raw email headers to extract SPF, DKIM, DMARC authentication results, sender IP, and suspicious indicators."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="header-input" className="block text-xs font-medium text-slate-400 mb-1.5">
            Raw Email Headers
          </label>
          <textarea
            id="header-input"
            value={headerInput}
            onChange={(e) => setHeaderInput(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={10}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-[#1e2d4a] bg-[#0f1629] text-slate-300 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-y disabled:opacity-50"
          />
          <p className="text-xs text-slate-600 mt-1">
            In Gmail: open email → More (⋮) → Show original. In Outlook: File → Properties → Internet headers.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading || !headerInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analysing…
            </span>
          ) : (
            "Analyse Headers"
          )}
        </button>
      </form>

      {loading && <LoadingSpinner label="Analysing headers…" sublabel="Parsing SPF, DKIM, DMARC, and suspicious indicators…" />}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
      )}
      {!loading && !error && data && (
        <div className="space-y-4 mt-4">
          <EmailHeaderCard data={data} />
          <RiskScorePanel risk={scoreEmailHeaders(data)} />
          <AISummaryPanel toolName="Email Header Analyzer" context={aiContext} />
        </div>
      )}
      {!loading && !error && !data && (
        <div className="mt-4">
          <ToolEmptyState
            icon={Icon}
            title="Paste email headers above"
            description="Analyse any raw email headers to check authentication (SPF/DKIM/DMARC), trace sender IPs, and detect phishing indicators."
          />
        </div>
      )}
    </ToolPageLayout>
  );
}

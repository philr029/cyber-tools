"use client";

import { useState } from "react";
import type { RedirectTraceResult } from "@/lib/types";
import { validateURL, normaliseURL } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import RedirectTraceCard from "@/app/components/results/RedirectTraceCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";
import AISummaryPanel from "@/app/components/ui/AISummaryPanel";
import RiskScorePanel from "@/app/components/ui/RiskScorePanel";
import { scoreRedirectTrace } from "@/lib/risk-engine";

const Icon = (
  <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export default function RedirectTracePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RedirectTraceResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    const normalised = normaliseURL(url);
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { lookupRedirectTrace } = await import("@/lib/lookup-client");
      const { data, mock } = await lookupRedirectTrace(normalised);
      setData(data);
      setIsMock(mock);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const aiContext = data
    ? `Redirect trace for ${data.originalUrl}: ${data.hopCount} hop(s), final URL=${data.finalUrl}, suspicious=${data.isSuspicious}. ${
        data.suspiciousReasons.length > 0 ? `Reasons: ${data.suspiciousReasons.join("; ")}.` : "No suspicious indicators."
      }`
    : "";

  return (
    <ToolPageLayout
      title="URL Redirect Tracer"
      description="Follow the full redirect chain of any URL server-side. Reveals cloaked destinations, suspicious TLDs, and URL shortener tricks."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a URL (e.g. https://bit.ly/example)"
        buttonLabel="Trace Redirects"
        validate={validateURL}
        onSubmit={handleSubmit}
        loading={loading}
        hint="https:// is added automatically if omitted."
        examples={["https://google.com", "https://example.com", "https://bit.ly/3example"]}
      />

      {loading && (
        <LoadingSpinner
          label="Tracing redirects…"
          sublabel="Following the redirect chain server-side — may take a few seconds."
        />
      )}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
      )}
      {!loading && !error && data && (
        <div className="space-y-4">
          <RedirectTraceCard data={data} />
          <RiskScorePanel risk={scoreRedirectTrace(data)} />
          <AISummaryPanel toolName="URL Redirect Tracer" context={aiContext} />
        </div>
      )}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a URL to trace"
          description="Unpack shortened URLs, reveal redirect chains, and detect suspicious destinations before clicking."
        />
      )}
    </ToolPageLayout>
  );
}

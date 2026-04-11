"use client";

import { useState } from "react";
import type { DomainThreatScoreResult } from "@/lib/types";
import { validateDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import ThreatScoreCard from "@/app/components/results/ThreatScoreCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";
import AISummaryPanel from "@/app/components/ui/AISummaryPanel";

const Icon = (
  <svg className="w-10 h-10 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export default function ThreatScorePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DomainThreatScoreResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(domain: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { lookupThreatScore } = await import("@/lib/lookup-client");
      const { data, mock } = await lookupThreatScore(domain);
      setData(data);
      setIsMock(mock);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const aiContext = data
    ? `Threat score analysis for ${data.target}: Overall score=${data.totalScore}, Label=${data.label}. Breakdown: ${
        data.factors.map((f) => `${f.name}: ${f.score}/${f.maxScore} (${f.detail})`).join("; ")
      }.`
    : "";

  return (
    <ToolPageLayout
      title="Threat Score Engine"
      description="Aggregates SSL certificate validity, domain age (WHOIS), and security headers into a combined 0–100 risk score."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a domain (e.g. example.com)"
        buttonLabel="Calculate Score"
        validate={validateDomain}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["example.com", "google.com", "malicious-test.xyz"]}
      />

      {loading && (
        <LoadingSpinner
          label="Calculating threat score…"
          sublabel="Querying SSL, WHOIS, and security headers in parallel…"
        />
      )}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
      )}
      {!loading && !error && data && (
        <div className="space-y-4">
          <ThreatScoreCard data={data} />
          <AISummaryPanel toolName="Threat Score Engine" context={aiContext} />
        </div>
      )}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a domain"
          description="Get a combined risk score based on SSL certificate health, domain age, and security headers. Useful for quick phishing or threat triage."
        />
      )}
    </ToolPageLayout>
  );
}

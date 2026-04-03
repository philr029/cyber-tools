"use client";

import { useState } from "react";
import type { URLAnalysisResult } from "@/lib/types";
import { validateURL, normaliseURL } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import URLAnalysisCard from "@/app/components/results/URLAnalysisCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export default function URLAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<URLAnalysisResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    const normalised = normaliseURL(url);
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data, mock } = await import("@/lib/lookup-client").then((m) => m.lookupURL(normalised));
      setData(data);
      setIsMock(mock);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageLayout
      title="URL Analysis"
      description="Submit a URL to check for malware, phishing, and threats using VirusTotal's multi-engine analysis. Also reveals redirect chains and content type."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a URL (e.g. https://example.com)"
        buttonLabel="Analyse URL"
        validate={validateURL}
        onSubmit={handleSubmit}
        loading={loading}
        hint="https:// is added automatically if omitted."
        examples={["https://google.com", "https://example.com", "https://malicious-test.xyz"]}
      />

      {loading && <LoadingSpinner label="Analysing URL…" sublabel="Submitting to VirusTotal and waiting for results — this may take up to 30 seconds." />}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && data && <URLAnalysisCard data={data} />}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a URL to analyse"
          description="Submit any URL to check for threats, inspect redirect chains, and view multi-engine vendor analysis."
        />
      )}
    </ToolPageLayout>
  );
}

"use client";

import { useState } from "react";
import type { DomainReputationResult } from "@/lib/types";
import { validateDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import DomainReputationCard from "@/app/components/results/DomainReputationCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

export default function DomainLookupPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DomainReputationResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(domain: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/lookup/domain?domain=${encodeURIComponent(domain)}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Lookup failed."); return; }
      setData(json.data);
      setIsMock(json.mock);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageLayout
      title="Domain Reputation Lookup"
      description="Analyse a domain against VirusTotal's multi-engine threat database for malware, phishing, and category data."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a domain (e.g. example.com)"
        buttonLabel="Check Domain"
        validate={validateDomain}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["google.com", "example.com", "malicious-test.xyz"]}
      />

      {loading && <LoadingSpinner label="Analysing domain…" sublabel="Querying threat intelligence databases…" />}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && data && <DomainReputationCard data={data} />}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a domain name"
          description="Submit any domain to check multi-engine vendor analysis, categories, and registrar information."
        />
      )}
    </ToolPageLayout>
  );
}

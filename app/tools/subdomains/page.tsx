"use client";

import { useState } from "react";
import type { SubdomainResult } from "@/lib/types";
import { validateDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import SubdomainCard from "@/app/components/results/SubdomainCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";
import AISummaryPanel from "@/app/components/ui/AISummaryPanel";

const Icon = (
  <svg className="w-10 h-10 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

export default function SubdomainsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SubdomainResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(domain: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { lookupSubdomains } = await import("@/lib/lookup-client");
      const { data, mock } = await lookupSubdomains(domain);
      setData(data);
      setIsMock(mock);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const aiContext = data
    ? `Subdomain enumeration for ${data.domain}: Found ${data.totalFound} subdomain(s) via ${data.source}. Sample: ${
        data.subdomains
          .slice(0, 10)
          .map((s) => s.subdomain)
          .join(", ")
      }${data.totalFound > 10 ? "…" : ""}.`
    : "";

  return (
    <ToolPageLayout
      title="Subdomain Finder"
      description="Enumerate subdomains using certificate transparency logs (crt.sh). Passive, non-intrusive reconnaissance using public data only."
      isMock={isMock}
    >
      <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/5 border border-teal-500/20 text-xs text-teal-300">
        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        Passive recon only — uses public certificate transparency logs, no active probing
      </div>

      <ToolInput
        placeholder="Enter a domain (e.g. example.com)"
        buttonLabel="Find Subdomains"
        validate={validateDomain}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["example.com", "google.com", "github.com"]}
      />

      {loading && (
        <LoadingSpinner
          label="Enumerating subdomains…"
          sublabel="Querying certificate transparency logs at crt.sh — may take up to 15 seconds."
        />
      )}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
      )}
      {!loading && !error && data && (
        <div className="space-y-4">
          <SubdomainCard data={data} />
          <AISummaryPanel toolName="Subdomain Finder" context={aiContext} />
        </div>
      )}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a domain name"
          description="Find subdomains using certificate transparency logs — a passive reconnaissance technique used by security researchers and SOC analysts."
        />
      )}
    </ToolPageLayout>
  );
}

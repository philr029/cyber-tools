"use client";

import { useState } from "react";
import type { DNSResult } from "@/lib/types";
import { validateDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import DNSCard from "@/app/components/results/DNSCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export default function DNSLookupPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DNSResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(domain: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data, mock } = await import("@/lib/lookup-client").then((m) => m.lookupDNS(domain));
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
      title="DNS Lookup"
      description="Retrieve A, AAAA, MX, TXT, NS, and CNAME records for any domain, plus nameservers and reverse DNS."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a domain (e.g. example.com)"
        buttonLabel="Look Up DNS"
        validate={validateDomain}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["google.com", "example.com", "cloudflare.com"]}
      />

      {loading && <LoadingSpinner label="Resolving DNS records…" sublabel="Fetching A, AAAA, MX, TXT, NS records…" />}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && data && <DNSCard data={data} />}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a domain name"
          description="Submit any domain to view its DNS records including A, AAAA, MX, TXT, NS, and CNAME entries."
        />
      )}
    </ToolPageLayout>
  );
}

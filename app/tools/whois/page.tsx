"use client";

import { useState } from "react";
import type { WHOISResult } from "@/lib/types";
import { validateDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import WHOISCard from "@/app/components/results/WHOISCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

export default function WHOISPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WHOISResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(domain: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data, mock } = await import("@/lib/lookup-client").then((m) => m.lookupWHOIS(domain));
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
      title="WHOIS / Registrar Info"
      description="Look up domain registration details including registrar, creation date, expiry, nameservers, and DNSSEC status using RDAP."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a domain (e.g. example.com)"
        buttonLabel="Look Up WHOIS"
        validate={validateDomain}
        onSubmit={handleSubmit}
        loading={loading}
        hint="Uses the IANA RDAP bootstrap service. No API key required."
        examples={["google.com", "example.com", "github.com"]}
      />

      {loading && <LoadingSpinner label="Looking up WHOIS data…" sublabel="Querying RDAP registration database…" />}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && data && <WHOISCard data={data} />}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a domain name"
          description="Submit any domain to retrieve registrar information, registration dates, nameservers, and DNSSEC status."
        />
      )}
    </ToolPageLayout>
  );
}

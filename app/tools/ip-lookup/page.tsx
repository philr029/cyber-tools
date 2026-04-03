"use client";

import { useState } from "react";
import type { IPReputationResult } from "@/lib/types";
import { validateIP } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import IPReputationCard from "@/app/components/results/IPReputationCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

export default function IPLookupPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IPReputationResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(ip: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/lookup/ip?ip=${encodeURIComponent(ip)}`);
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
      title="IP Reputation Lookup"
      description="Check an IP address against AbuseIPDB to see abuse confidence score, ISP, country, and report history."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter an IP address (e.g. 8.8.8.8)"
        buttonLabel="Check IP"
        validate={validateIP}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["8.8.8.8", "1.1.1.1", "185.220.101.47"]}
      />

      {loading && <LoadingSpinner label="Checking IP reputation…" sublabel="Querying abuse databases…" />}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && data && <IPReputationCard data={data} />}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter an IP address"
          description="Submit any IPv4 or IPv6 address to check its reputation, abuse reports, ISP, and country."
        />
      )}
    </ToolPageLayout>
  );
}

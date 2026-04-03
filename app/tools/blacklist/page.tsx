"use client";

import { useState } from "react";
import type { BlacklistResult } from "@/lib/types";
import { validateIPOrDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import BlacklistCard from "@/app/components/results/BlacklistCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

export default function BlacklistPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlacklistResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(target: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data, mock } = await import("@/lib/lookup-client").then((m) => m.lookupBlacklist(target));
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
      title="Blacklist / Reputation Checker"
      description="Check an IP address or domain against major spam and abuse blacklists including Spamhaus, SURBL, Barracuda, SpamCop, and UCEPROTECT."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter an IP or domain (e.g. 8.8.8.8 or example.com)"
        buttonLabel="Check Blacklists"
        validate={validateIPOrDomain}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["8.8.8.8", "example.com", "malicious-test.xyz"]}
      />

      {loading && <LoadingSpinner label="Checking blacklists…" sublabel="Querying Spamhaus, SURBL, Barracuda, and more…" />}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && data && <BlacklistCard data={data} />}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter an IP or domain"
          description="Submit any IP address or domain to check whether it appears on major spam and abuse blacklists."
        />
      )}
    </ToolPageLayout>
  );
}

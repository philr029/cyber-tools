"use client";

import { useState } from "react";
import type { SSLCertificateResult } from "@/lib/types";
import { validateDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import SSLCard from "@/app/components/results/SSLCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export default function SSLCheckerPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SSLCertificateResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(domain: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data, mock } = await import("@/lib/lookup-client").then((m) => m.lookupSSL(domain));
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
      title="SSL Certificate Checker"
      description="Verify SSL/TLS certificate details including expiry date, issuer, protocol version, key size, and subject alternative names."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a domain (e.g. example.com)"
        buttonLabel="Check SSL"
        validate={validateDomain}
        onSubmit={handleSubmit}
        loading={loading}
        hint="SSL Labs analysis may take up to 60 seconds for uncached domains."
        examples={["google.com", "github.com", "example.com"]}
      />

      {loading && <LoadingSpinner label="Analysing SSL certificate…" sublabel="This may take up to 60 seconds for fresh scans." />}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && data && <SSLCard data={data} />}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a domain to check"
          description="Submit a domain to inspect its SSL/TLS certificate, expiry status, and cryptographic details."
        />
      )}
    </ToolPageLayout>
  );
}

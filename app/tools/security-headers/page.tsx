"use client";

import { useState } from "react";
import type { SecurityHeadersResult } from "@/lib/types";
import { validateDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import SecurityHeadersCard from "@/app/components/results/SecurityHeadersCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
  </svg>
);

export default function SecurityHeadersPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SecurityHeadersResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(domain: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data, mock } = await import("@/lib/lookup-client").then((m) => m.lookupHeaders(domain));
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
      title="Security Headers Checker"
      description="Inspect a domain's HTTP response headers for security misconfigurations. Checks for HSTS, CSP, X-Frame-Options, and more."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter a domain (e.g. example.com)"
        buttonLabel="Check Headers"
        validate={validateDomain}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["google.com", "github.com", "example.com"]}
      />

      {loading && <LoadingSpinner label="Fetching security headers…" sublabel="Sending HTTP request and inspecting response headers…" />}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && data && <SecurityHeadersCard data={data} />}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a domain to inspect"
          description="Submit a domain to grade its HTTP security headers against OWASP best practices."
        />
      )}
    </ToolPageLayout>
  );
}

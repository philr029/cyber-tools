"use client";

import { useState } from "react";
import type { GeoResult } from "@/lib/types";
import type { ValidationResult } from "@/lib/validators";
import { isValidIP } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import GeoCard from "@/app/components/results/GeoCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";
import AISummaryPanel from "@/app/components/ui/AISummaryPanel";

const Icon = (
  <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

function validateIP(value: string): ValidationResult {
  if (!value.trim()) return { ok: false, message: "Please enter an IP address." };
  if (!isValidIP(value.trim())) {
    return { ok: false, message: "Please enter a valid IPv4 address (e.g. 8.8.8.8)." };
  }
  return { ok: true };
}

export default function GeoLookupPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GeoResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(ip: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { lookupGeo } = await import("@/lib/lookup-client");
      const { data, mock } = await lookupGeo(ip);
      setData(data);
      setIsMock(mock);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const aiContext = data
    ? `Geolocation result for ${data.ip}: Country=${data.country} (${data.countryCode}), Region=${data.region}, City=${data.city}, ISP=${data.isp}, Organisation=${data.org}, ASN=${data.asn}, Timezone=${data.timezone}.`
    : "";

  return (
    <ToolPageLayout
      title="Geolocation & ASN Lookup"
      description="Look up the geographic location, ISP, and ASN for any IP address. Shows country, city, region, timezone, and a map preview."
      isMock={isMock}
    >
      <ToolInput
        placeholder="Enter an IP address (e.g. 8.8.8.8)"
        buttonLabel="Lookup Location"
        validate={validateIP}
        onSubmit={handleSubmit}
        loading={loading}
        examples={["8.8.8.8", "1.1.1.1", "185.220.101.47"]}
      />

      {loading && <LoadingSpinner label="Looking up geolocation…" sublabel="Querying ip-api.com for location data…" />}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
      )}
      {!loading && !error && data && (
        <div className="space-y-4">
          <GeoCard data={data} />
          <AISummaryPanel toolName="Geolocation & ASN Lookup" context={aiContext} />
        </div>
      )}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter an IP address"
          description="Geolocate any IPv4 address to see its country, city, ISP, ASN, and map position."
        />
      )}
    </ToolPageLayout>
  );
}

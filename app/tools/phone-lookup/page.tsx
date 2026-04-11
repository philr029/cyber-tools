"use client";

import { useState } from "react";
import type { PhoneResult } from "@/lib/types";
import { validatePhone } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import PhoneCard from "@/app/components/results/PhoneCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";
import AISummaryPanel from "@/app/components/ui/AISummaryPanel";

const Icon = (
  <svg className="w-10 h-10 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export default function PhoneLookupPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PhoneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(phone: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { lookupPhone } = await import("@/lib/lookup-client");
      const { data } = await lookupPhone(phone);
      setData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const aiContext = data
    ? `Phone number analysis: number=${data.e164 ?? data.raw}, country=${data.country ?? "unknown"}, type=${data.numberType}, carrier=${data.carrier ?? "unknown"}, risk flags: ${data.flags.length > 0 ? data.flags.map((f) => f.label).join("; ") : "none"}, status=${data.status}.`
    : "";

  return (
    <ToolPageLayout
      title="Phone Number Validator"
      description="Validate phone number format, detect country and carrier, identify VoIP / premium-rate numbers, and surface risk flags."
    >
      <ToolInput
        placeholder="Enter a phone number with country code (e.g. +1 202 555 1234)"
        buttonLabel="Analyse Number"
        validate={validatePhone}
        onSubmit={handleSubmit}
        loading={loading}
        hint="Include the country dial code for best results (e.g. +44 for UK, +49 for Germany)."
        examples={["+1 202 555 0199", "+44 20 7946 0958", "+49 30 12345678", "+61 2 9876 5432"]}
      />

      {loading && (
        <LoadingSpinner
          label="Analysing phone number…"
          sublabel="Checking format, country, and risk indicators…"
        />
      )}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
      {!loading && !error && data && (
        <div className="space-y-4">
          <PhoneCard data={data} />
          <AISummaryPanel toolName="Phone Number Validator" context={aiContext} />
        </div>
      )}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter a phone number"
          description="Validate any international phone number — detect country, carrier, VoIP status, and risk flags like premium-rate or suspicious patterns."
        />
      )}
    </ToolPageLayout>
  );
}

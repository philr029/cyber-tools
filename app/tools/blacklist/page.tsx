"use client";

import { useState } from "react";
import type { BlacklistResult } from "@/lib/types";
import { validateIPOrDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import BulkBlacklistUploader from "@/app/components/tools/BulkBlacklistUploader";
import BlacklistCard from "@/app/components/results/BlacklistCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";
import RiskScorePanel from "@/app/components/ui/RiskScorePanel";
import { scoreBlacklist } from "@/lib/risk-engine";

type Tab = "single" | "bulk";

const Icon = (
  <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

export default function BlacklistPage() {
  const [tab, setTab] = useState<Tab>("single");
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
      isMock={tab === "single" ? isMock : null}
    >
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-[#0f1629] rounded-xl border border-[#1e2d4a] mb-6 w-fit">
        <button
          type="button"
          onClick={() => setTab("single")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "single"
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
          aria-pressed={tab === "single"}
        >
          Single Check
        </button>
        <button
          type="button"
          onClick={() => setTab("bulk")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "bulk"
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
          aria-pressed={tab === "bulk"}
        >
          Bulk Upload
        </button>
      </div>

      {/* Single check panel */}
      {tab === "single" && (
        <>
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
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
          )}
          {!loading && !error && data && (
            <div className="space-y-4">
              <BlacklistCard data={data} />
              <RiskScorePanel risk={scoreBlacklist(data)} />
            </div>
          )}
          {!loading && !error && !data && (
            <ToolEmptyState
              icon={Icon}
              title="Enter an IP or domain"
              description="Submit any IP address or domain to check whether it appears on major spam and abuse blacklists."
            />
          )}
        </>
      )}

      {/* Bulk upload panel */}
      {tab === "bulk" && <BulkBlacklistUploader />}
    </ToolPageLayout>
  );
}

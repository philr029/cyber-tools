"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
              {data.listedCount === 0 && (
                <div className="rounded-2xl bg-[#0d1321] border border-emerald-500/20 overflow-hidden">
                  <div className="px-5 py-4 border-b border-emerald-500/10 bg-emerald-500/5 flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-emerald-400">Clean Sweep</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      All {data.totalChecked} blacklist checks passed for <span className="font-mono text-cyan-400">{data.target}</span>.
                      Ask the AI assistant what this means for your email deliverability and how to stay clean as you scale.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const prompt =
                          `I have just completed a Multi-RBL check for ${data.target}. ` +
                          `The results show ${data.totalChecked} of ${data.totalChecked} checks passed with zero listings found.\n\n` +
                          `Based on these 'clean' results, does this guarantee my emails will land in the Primary Inbox, ` +
                          `or are there other factors like provider-specific filters (Google/Outlook) I should still be worried about?\n\n` +
                          `If my IP/domain is clean across all ${data.totalChecked} checks but my open rates are still low, ` +
                          `how can I check if my domain reputation is the culprit despite passing these RBLs?\n\n` +
                          `Provide a 'Maintenance Schedule' to ensure these numbers stay at 100% as I scale my sending volume.\n\n` +
                          `Explain the difference between these Public RBLs and Private Internal Filters used by Gmail and Microsoft.`;
                        router.push(`/tools/ai-assistant?prompt=${encodeURIComponent(prompt)}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Ask AI Assistant
                    </button>
                  </div>
                </div>
              )}
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

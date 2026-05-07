"use client";

import { useEffect, useState } from "react";
import type { OpenPortsResult } from "@/lib/types";
import { isValidIP, isValidDomain } from "@/lib/validators";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import OpenPortsCard from "@/app/components/results/OpenPortsCard";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";
import RiskScorePanel from "@/app/components/ui/RiskScorePanel";
import { scoreOpenPorts } from "@/lib/risk-engine";
import type { ValidationResult } from "@/lib/validators";
import { useAuth } from "@/lib/auth-context";
import { FREE_DAILY_LIMIT, useDailyScans } from "@/lib/use-daily-scans";
import ReviewTargetModal from "@/app/components/tools/ReviewTargetModal";
import { ACTIVE_TOOL_COOLDOWN_SECONDS } from "@/lib/tool-limits";

const Icon = (
  <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
  </svg>
);

function validateTarget(value: string): ValidationResult {
  if (!value.trim()) return { ok: false, message: "Please enter an IP address or domain." };
  if (!isValidIP(value.trim()) && !isValidDomain(value.trim())) {
    return { ok: false, message: "Please enter a valid IP address (e.g. 8.8.8.8) or domain (e.g. example.com)." };
  }
  return { ok: true };
}

export default function PortScannerPage() {
  const { user } = useAuth();
  const { scansToday, increment: incrementScan } = useDailyScans(user?.plan ?? null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OpenPortsResult | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState("");
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => setCooldownSeconds((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  async function handleSubmit(target: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { lookupPortScan } = await import("@/lib/lookup-client");
      const { data, mock } = await lookupPortScan(target);
      setData(data);
      setIsMock(mock);
      incrementScan();
      setCooldownSeconds(ACTIVE_TOOL_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function requestReview(target: string) {
    setPendingTarget(target);
    setPermissionChecked(false);
    setReviewOpen(true);
  }

  function confirmReview() {
    if (!permissionChecked || !pendingTarget || cooldownSeconds > 0) return;
    setReviewOpen(false);
    void handleSubmit(pendingTarget);
  }

  return (
    <ToolPageLayout
      title="Port Scanner (Safe Mode)"
      description="Scan common ports on any IP address or domain. Non-intrusive TCP connect scan. Checks 15 common ports: FTP, SSH, SMTP, HTTP, HTTPS, RDP, and more."
      isMock={isMock}
    >
      <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300">
        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        Safe Scan (non-intrusive) — TCP connect only, 15 common ports, no packet crafting
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${cooldownSeconds > 0 ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cooldownSeconds > 0 ? "bg-amber-400" : "bg-emerald-400"}`} />
          {cooldownSeconds > 0 ? `Cooldown ${cooldownSeconds}s` : "Ready"}
        </span>
        {user?.plan === "free" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
            Credits {Math.max(FREE_DAILY_LIMIT - scansToday, 0)} left
          </span>
        )}
      </div>

      <ToolInput
        placeholder="Enter IP address or domain (e.g. 8.8.8.8 or example.com)"
        buttonLabel="Scan Ports"
        validate={validateTarget}
        onSubmit={requestReview}
        loading={loading}
        disabled={cooldownSeconds > 0}
        showTlsIndicator
        examples={["8.8.8.8", "example.com", "1.1.1.1"]}
      />

      <ReviewTargetModal
        open={reviewOpen}
        target={pendingTarget}
        targetLabel="IP / Domain"
        permissionChecked={permissionChecked}
        onPermissionChange={setPermissionChecked}
        onCancel={() => setReviewOpen(false)}
        onConfirm={confirmReview}
        loading={loading}
      />

      {loading && (
        <LoadingSpinner
          label="Scanning ports…"
          sublabel="Testing 15 common ports with TCP connect — this may take up to 45 seconds."
        />
      )}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
      )}
      {!loading && !error && data && (
        <div className="space-y-4">
          <OpenPortsCard data={data} />
          <RiskScorePanel risk={scoreOpenPorts(data)} />
        </div>
      )}
      {!loading && !error && !data && (
        <ToolEmptyState
          icon={Icon}
          title="Enter an IP or domain"
          description="Run a safe, non-intrusive port scan to see which common services are reachable. Useful for SOC triage and network troubleshooting."
        />
      )}
    </ToolPageLayout>
  );
}

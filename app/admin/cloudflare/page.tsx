"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ZoneCard, { type ZoneData } from "@/components/admin/cloudflare/ZoneCard";
import ThreatChart, {
  type AnalyticsTotals,
  type AnalyticsTimeseries,
} from "@/components/admin/cloudflare/ThreatChart";
import DnsTable, { type DnsRecord } from "@/components/admin/cloudflare/DnsTable";
import BlockedIpsTable, {
  type BlockedRule,
} from "@/components/admin/cloudflare/BlockedIpsTable";
import FirewallRulesList from "@/components/admin/cloudflare/FirewallRulesList";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CfApiResponse {
  result?: unknown;
  success?: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function apiFetch(url: string, opts?: RequestInit): Promise<CfApiResponse> {
  const res = await fetch(url, opts);
  const data = (await res.json()) as CfApiResponse;
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CloudflareAdminPage() {
  // Zone
  const [zoneData, setZoneData] = useState<ZoneData | null>(null);
  const [zoneLoading, setZoneLoading] = useState(true);
  const [zoneError, setZoneError] = useState<string | null>(null);

  // Analytics
  const [analyticsTotal, setAnalyticsTotal] = useState<AnalyticsTotals | null>(null);
  const [analyticsTimeseries, setAnalyticsTimeseries] = useState<AnalyticsTimeseries[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // DNS
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [dnsLoading, setDnsLoading] = useState(true);
  const [dnsError, setDnsError] = useState<string | null>(null);

  // Firewall
  const [firewallRules, setFirewallRules] = useState<BlockedRule[]>([]);
  const [firewallLoading, setFirewallLoading] = useState(true);
  const [firewallError, setFirewallError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchZone = useCallback(async () => {
    setZoneLoading(true);
    setZoneError(null);
    try {
      const data = await apiFetch("/api/cloudflare/zone");
      setZoneData((data.result as ZoneData) ?? null);
    } catch (err) {
      setZoneError(err instanceof Error ? err.message : "Failed to load zone info.");
    } finally {
      setZoneLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const data = await apiFetch("/api/cloudflare/analytics");
      const result = data.result as {
        totals?: AnalyticsTotals;
        timeseries?: AnalyticsTimeseries[];
      } | null;
      setAnalyticsTotal(result?.totals ?? null);
      setAnalyticsTimeseries(result?.timeseries ?? []);
    } catch (err) {
      setAnalyticsError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchDns = useCallback(async () => {
    setDnsLoading(true);
    setDnsError(null);
    try {
      const data = await apiFetch("/api/cloudflare/dns");
      setDnsRecords((data.result as DnsRecord[]) ?? []);
    } catch (err) {
      setDnsError(err instanceof Error ? err.message : "Failed to load DNS records.");
    } finally {
      setDnsLoading(false);
    }
  }, []);

  const fetchFirewall = useCallback(async () => {
    setFirewallLoading(true);
    setFirewallError(null);
    try {
      const data = await apiFetch("/api/cloudflare/firewall");
      setFirewallRules((data.result as BlockedRule[]) ?? []);
    } catch (err) {
      setFirewallError(err instanceof Error ? err.message : "Failed to load firewall rules.");
    } finally {
      setFirewallLoading(false);
    }
  }, []);

  // Load all panels in parallel on mount
  useEffect(() => {
    void Promise.all([fetchZone(), fetchAnalytics(), fetchDns(), fetchFirewall()]);
  }, [fetchZone, fetchAnalytics, fetchDns, fetchFirewall]);

  // ---------------------------------------------------------------------------
  // Mutation handlers
  // ---------------------------------------------------------------------------

  async function handleAddDns(form: {
    type: string;
    name: string;
    content: string;
    proxied: boolean;
  }) {
    await apiFetch("/api/cloudflare/dns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await fetchDns();
  }

  async function handleDeleteDns(id: string) {
    await apiFetch(`/api/cloudflare/dns?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await fetchDns();
  }

  async function handleBlockIp(ip: string, notes: string) {
    await apiFetch("/api/cloudflare/firewall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, notes }),
    });
    await fetchFirewall();
  }

  async function handleUnblockIp(id: string) {
    await apiFetch(`/api/cloudflare/firewall?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await fetchFirewall();
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-orange-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            <h1 className="text-xl font-bold text-slate-100">Cloudflare Admin</h1>
          </div>
          <p className="text-sm text-slate-400">
            Manage DNS, WAF rules, and traffic analytics for your Cloudflare zone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              void Promise.all([fetchZone(), fetchAnalytics(), fetchDns(), fetchFirewall()])
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Dashboard
          </Link>
        </div>
      </div>

      {/* Setup notice when credentials not configured */}
      {(zoneError?.includes("not configured") ?? false) && (
        <div className="mb-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 flex gap-3">
          <svg
            className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-300">Cloudflare credentials not configured</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Add{" "}
              <code className="font-mono bg-amber-500/10 px-1 rounded">CLOUDFLARE_API_TOKEN</code>{" "}
              and{" "}
              <code className="font-mono bg-amber-500/10 px-1 rounded">CLOUDFLARE_ZONE_ID</code>{" "}
              to your Vercel environment variables. The WAF rules panel below is always available for reference.
            </p>
          </div>
        </div>
      )}

      {/* Top row: Zone + Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ZoneCard data={zoneData} loading={zoneLoading} error={zoneError} />
        <ThreatChart
          totals={analyticsTotal}
          timeseries={analyticsTimeseries}
          loading={analyticsLoading}
          error={analyticsError}
        />
      </div>

      {/* Bottom row: DNS + Blocked IPs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DnsTable
          records={dnsRecords}
          loading={dnsLoading}
          error={dnsError}
          onAdd={handleAddDns}
          onDelete={handleDeleteDns}
        />
        <BlockedIpsTable
          rules={firewallRules}
          loading={firewallLoading}
          error={firewallError}
          onBlock={handleBlockIp}
          onUnblock={handleUnblockIp}
        />
      </div>

      {/* WAF Rules reference (full width) */}
      <FirewallRulesList />
    </div>
  );
}

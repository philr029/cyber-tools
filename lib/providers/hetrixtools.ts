/**
 * HetrixTools provider adapter.
 * Docs: https://docs.hetrixtools.com/blacklist-check-api/
 * Env:  HETRIXTOOLS_API_KEY
 */

import type { BlacklistResult } from "@/lib/types";

interface HetrixListEntry {
  blacklist: string;
  listed: boolean;
  delist_url?: string;
}

interface HetrixResponse {
  status: string;
  blacklists?: {
    email_blacklists?: HetrixListEntry[];
    domain_blacklists?: HetrixListEntry[];
    ip_blacklists?: HetrixListEntry[];
  };
}

export async function fetchBlacklist(target: string): Promise<BlacklistResult | null> {
  const apiKey = process.env.HETRIXTOOLS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.hetrixtools.com/v3/blacklist-check/${encodeURIComponent(apiKey)}/${encodeURIComponent(target)}/`,
      { next: { revalidate: 0 } },
    );

    if (!res.ok) return null;
    const json: HetrixResponse = await res.json();

    // Flatten all blacklist arrays
    const allLists: HetrixListEntry[] = [
      ...(json.blacklists?.ip_blacklists ?? []),
      ...(json.blacklists?.domain_blacklists ?? []),
      ...(json.blacklists?.email_blacklists ?? []),
    ];

    const entries = allLists.map((l) => ({
      source: l.blacklist,
      listed: l.listed,
      detail: l.listed ? "Listed" : "Not listed",
    }));

    const listedCount = entries.filter((e) => e.listed).length;
    const status =
      listedCount >= 3 ? "risk" : listedCount >= 1 ? "warning" : "safe";

    return {
      target,
      entries,
      listedCount,
      totalChecked: entries.length,
      status,
    };
  } catch {
    return null;
  }
}

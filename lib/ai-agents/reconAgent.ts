/**
 * Recon Agent — gathers all available intelligence for a given target.
 *
 * Calls the existing /api/lookup/* routes via lookupAll (and optionally WHOIS
 * + subdomains), then normalises the output into a ReconData structure for
 * downstream agents.
 *
 * No additional API keys are required — it reuses the existing provider layer.
 */

import { lookupAll, lookupWHOIS, lookupSubdomains } from "@/lib/lookup-client";
import { isValidIP } from "@/lib/validators";
import type { ReconData, QueryType } from "./agentTypes";

function classifyQuery(query: string): QueryType {
  const q = query.trim().toLowerCase();
  if (isValidIP(q)) return "ip";
  if (q.startsWith("http://") || q.startsWith("https://")) return "url";
  if (q.includes("@")) return "email";
  // Simple domain check: contains a dot and no spaces
  if (/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(q)) return "domain";
  return "unknown";
}

export async function runReconAgent(query: string): Promise<ReconData> {
  const trimmed = query.trim();
  const queryType = classifyQuery(trimmed);

  // Core scan — runs all relevant lookups in parallel
  const { result: lookupResult } = await lookupAll(trimmed);

  // Optional enrichment
  let whois = undefined;
  let subdomains = undefined;

  if (queryType === "domain") {
    const [whoisRes, subdomainsRes] = await Promise.allSettled([
      lookupWHOIS(trimmed),
      lookupSubdomains(trimmed),
    ]);
    if (whoisRes.status === "fulfilled") whois = whoisRes.value.data;
    if (subdomainsRes.status === "fulfilled") subdomains = subdomainsRes.value.data;
  }

  return {
    query: trimmed,
    queryType,
    lookupResult,
    whois,
    subdomains,
    timestamp: new Date().toISOString(),
  };
}

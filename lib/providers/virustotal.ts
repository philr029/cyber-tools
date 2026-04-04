/**
 * VirusTotal provider adapter.
 * Docs: https://developers.virustotal.com/reference/overview
 * Env:  VIRUSTOTAL_API_KEY
 *
 * Used for domain reputation and URL analysis.
 */

import type { DomainReputationResult, URLAnalysisResult, VTIPResult, VTDomainResult } from "@/lib/types";

interface VTAnalysisStats {
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  timeout?: number;
}

interface VTDomainAttributes {
  last_analysis_stats: VTAnalysisStats;
  categories: Record<string, string>;
  registrar?: string;
  creation_date?: number;
  reputation?: number;
}

interface VTURLAttributes {
  url: string;
  final_url?: string;
  last_http_response_code?: number;
  last_analysis_stats: VTAnalysisStats;
  categories: Record<string, string>;
  threat_names?: string[];
  redirection_chain?: string[];
  last_http_response_content_type?: string;
}

function unixToISO(unix: number | undefined): string {
  if (!unix) return "Unknown";
  return new Date(unix * 1000).toISOString().split("T")[0];
}

function vtCategories(cats: Record<string, string>): string[] {
  return [...new Set(Object.values(cats))];
}

interface VTIPAttributes {
  last_analysis_stats: VTAnalysisStats;
  reputation: number;
  country: string;
  asn: number | null;
  as_owner: string;
  network: string;
}

function vtStatus(malicious: number): import("@/lib/types").StatusLevel {
  if (malicious === 0) return "safe";
  if (malicious <= 3) return "warning";
  return "risk";
}

export async function fetchVTIPReputation(ip: string): Promise<VTIPResult | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(ip)}`,
      { headers: { "x-apikey": apiKey }, next: { revalidate: 0 } },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const attrs: VTIPAttributes = json.data.attributes;
    const stats = attrs.last_analysis_stats;

    return {
      ip,
      harmless: stats.harmless,
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      undetected: stats.undetected,
      reputation: attrs.reputation ?? 0,
      country: attrs.country ?? "Unknown",
      asn: attrs.asn ?? null,
      asOwner: attrs.as_owner ?? "Unknown",
      network: attrs.network ?? "Unknown",
      status: vtStatus(stats.malicious),
    };
  } catch {
    return null;
  }
}

interface VTDomainAttributesFull extends VTDomainAttributes {
  reputation?: number;
}

export async function fetchVTDomainReputation(domain: string): Promise<VTDomainResult | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(domain)}`,
      { headers: { "x-apikey": apiKey }, next: { revalidate: 0 } },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const attrs: VTDomainAttributesFull = json.data.attributes;
    const stats = attrs.last_analysis_stats;

    return {
      domain,
      harmless: stats.harmless,
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      undetected: stats.undetected,
      reputation: attrs.reputation ?? 0,
      registrar: attrs.registrar ?? "Unknown",
      createdDate: unixToISO(attrs.creation_date),
      status: vtStatus(stats.malicious),
    };
  } catch {
    return null;
  }
}


export async function fetchDomainReputation(
  domain: string,
): Promise<DomainReputationResult | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(domain)}`,
      {
        headers: { "x-apikey": apiKey },
        next: { revalidate: 0 },
      },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const attrs: VTDomainAttributes = json.data.attributes;
    const stats = attrs.last_analysis_stats;

    const status =
      stats.malicious >= 3 ? "risk" : stats.malicious >= 1 || stats.suspicious >= 3 ? "warning" : "safe";

    return {
      domain,
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      undetected: stats.undetected,
      harmless: stats.harmless,
      categories: vtCategories(attrs.categories ?? {}),
      registrar: attrs.registrar ?? "Unknown",
      createdDate: unixToISO(attrs.creation_date),
      status,
    };
  } catch {
    return null;
  }
}

export async function fetchURLAnalysis(url: string): Promise<URLAnalysisResult | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    // Step 1: submit URL for scanning
    const submitRes = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: {
        "x-apikey": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(url)}`,
      next: { revalidate: 0 },
    });

    if (!submitRes.ok) return null;
    const submitJson = await submitRes.json();
    const analysisId: string = submitJson.data.id;

    // Step 2: poll for results (up to 3 attempts with 2s delay)
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));

      const analysisRes = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(analysisId)}`,
        { headers: { "x-apikey": apiKey }, next: { revalidate: 0 } },
      );

      if (!analysisRes.ok) continue;
      const analysisJson = await analysisRes.json();

      if (analysisJson.data.attributes.status !== "completed") continue;

      const attrs: VTURLAttributes = analysisJson.data.attributes;
      const stats = attrs.last_analysis_stats;

      const status =
        stats.malicious >= 3 ? "risk" : stats.malicious >= 1 || stats.suspicious >= 3 ? "warning" : "safe";

      let domain = "";
      try {
        domain = new URL(attrs.url).hostname;
      } catch {
        domain = "";
      }

      return {
        url: attrs.url,
        finalUrl: attrs.final_url ?? attrs.url,
        statusCode: attrs.last_http_response_code ?? null,
        ipAddress: null,
        domain,
        redirectChain: attrs.redirection_chain ?? [],
        contentType: attrs.last_http_response_content_type ?? null,
        malicious: stats.malicious,
        suspicious: stats.suspicious,
        harmless: stats.harmless,
        undetected: stats.undetected,
        categories: vtCategories(attrs.categories ?? {}),
        threatNames: attrs.threat_names ?? [],
        status,
      };
    }

    return null;
  } catch {
    return null;
  }
}

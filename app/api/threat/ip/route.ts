/**
 * Unified IP Threat Intelligence route.
 * Queries AbuseIPDB and VirusTotal in parallel and returns a single combined
 * result with a calculated threat score and verdict.
 *
 * GET /api/threat/ip?ip=<address>
 */

import type { NextRequest } from "next/server";
import { validateIP } from "@/lib/validators";
import type {
  ThreatIPResult,
  ThreatIPAbuseIPDB,
  ThreatIPVirusTotal,
  ThreatVerdict,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Score / verdict helpers
// ---------------------------------------------------------------------------

function computeThreatScore(
  abuse: ThreatIPAbuseIPDB | null,
  vt: ThreatIPVirusTotal | null,
): number {
  let score = 0;
  if (abuse) score += abuse.abuseConfidenceScore * 0.6;
  if (vt) {
    score += vt.malicious * 12;
    score += vt.suspicious * 6;
  }
  return Math.round(Math.min(100, score));
}

function getThreatVerdict(score: number): ThreatVerdict {
  if (score <= 19) return "Safe";
  if (score <= 59) return "Suspicious";
  return "Malicious";
}

// ---------------------------------------------------------------------------
// Provider fetchers (server-side only — API keys never leave the server)
// ---------------------------------------------------------------------------

async function fetchAbuseIPDB(
  ip: string,
  apiKey: string,
): Promise<ThreatIPAbuseIPDB | null> {
  const res = await fetch(
    `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
    {
      headers: { Key: apiKey, Accept: "application/json" },
      next: { revalidate: 0 },
    },
  );
  if (!res.ok) return null;
  const json = await res.json();
  const d = json.data;
  return {
    abuseConfidenceScore: d.abuseConfidenceScore ?? 0,
    countryCode: d.countryCode ?? "",
    isp: d.isp ?? "",
    domain: d.domain ?? "",
    totalReports: d.totalReports ?? 0,
    lastReportedAt: d.lastReportedAt ?? null,
  };
}

async function fetchVirusTotal(
  ip: string,
  apiKey: string,
): Promise<ThreatIPVirusTotal | null> {
  const res = await fetch(
    `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(ip)}`,
    {
      headers: { "x-apikey": apiKey },
      next: { revalidate: 0 },
    },
  );
  if (!res.ok) return null;
  const json = await res.json();
  const attrs = json.data?.attributes;
  if (!attrs) return null;
  const stats = attrs.last_analysis_stats ?? {};
  return {
    harmless: stats.harmless ?? 0,
    malicious: stats.malicious ?? 0,
    suspicious: stats.suspicious ?? 0,
    reputation: attrs.reputation ?? 0,
    country: attrs.country ?? "",
    as_owner: attrs.as_owner ?? "",
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip") ?? "";

  const validation = validateIP(ip);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const abuseKey = process.env.ABUSEIPDB_API_KEY;
  const vtKey = process.env.VIRUSTOTAL_API_KEY;

  if (!abuseKey || !vtKey) {
    return Response.json(
      { error: "One or more required API keys are not configured." },
      { status: 500 },
    );
  }

  const cleanIp = ip.trim();

  const [abuseSettled, vtSettled] = await Promise.allSettled([
    fetchAbuseIPDB(cleanIp, abuseKey),
    fetchVirusTotal(cleanIp, vtKey),
  ]);

  const warnings: string[] = [];

  const abuseData: ThreatIPAbuseIPDB | null =
    abuseSettled.status === "fulfilled" && abuseSettled.value !== null
      ? abuseSettled.value
      : null;

  const vtData: ThreatIPVirusTotal | null =
    vtSettled.status === "fulfilled" && vtSettled.value !== null
      ? vtSettled.value
      : null;

  if (abuseData === null) {
    warnings.push("AbuseIPDB data is unavailable for this request.");
  }
  if (vtData === null) {
    warnings.push("VirusTotal data is unavailable for this request.");
  }

  const threatScore = computeThreatScore(abuseData, vtData);
  const verdict = getThreatVerdict(threatScore);

  const result: ThreatIPResult = {
    ip: cleanIp,
    sources: { abuseipdb: abuseData, virustotal: vtData },
    threatScore,
    verdict,
    warnings,
  };

  return Response.json(result);
}

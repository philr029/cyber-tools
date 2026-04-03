/**
 * AbuseIPDB provider adapter.
 * Docs: https://docs.abuseipdb.com/
 * Env:  ABUSEIPDB_API_KEY
 */

import type { IPReputationResult } from "@/lib/types";

interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string;
    usageType: string;
    isp: string;
    domain: string;
    countryName: string;
    totalReports: number;
    lastReportedAt: string | null;
  };
}

export async function fetchIPReputation(ip: string): Promise<IPReputationResult | null> {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) return null; // No key → caller uses mock data

  try {
    const res = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
      {
        headers: {
          Key: apiKey,
          Accept: "application/json",
        },
        // Prevent stale data in production
        next: { revalidate: 0 },
      },
    );

    if (!res.ok) return null;

    const json: AbuseIPDBResponse = await res.json();
    const d = json.data;

    const score = d.abuseConfidenceScore;
    const status =
      score >= 50 ? "risk" : score >= 20 ? "warning" : "safe";

    return {
      ipAddress: d.ipAddress,
      abuseConfidenceScore: score,
      isp: d.isp,
      usageType: d.usageType || "Unknown",
      country: d.countryName,
      countryCode: d.countryCode,
      totalReports: d.totalReports,
      lastReportedAt: d.lastReportedAt,
      status,
    };
  } catch {
    return null;
  }
}

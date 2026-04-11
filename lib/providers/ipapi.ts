/**
 * ip-api.com provider adapter (free tier, no API key required).
 * Docs: https://ip-api.com/docs/api:json
 * Note: Free tier is rate-limited to 45 requests/min from a single IP.
 */

import type { GeoResult } from "@/lib/types";

interface IpApiResponse {
  status: "success" | "fail";
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string; // e.g. "AS15169 Google LLC"
  query: string;
  message?: string;
}

export async function fetchGeo(ip: string): Promise<GeoResult | null> {
  try {
    const fields = "status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,query";
    const res = await fetch(
      `https://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`,
      { next: { revalidate: 0 } },
    );

    if (!res.ok) return null;

    const json: IpApiResponse = await res.json();
    if (json.status !== "success") return null;

    // Extract ASN number from "AS15169 Google LLC" → "AS15169"
    const asnMatch = json.as?.match(/^(AS\d+)/);
    const asn = asnMatch ? asnMatch[1] : json.as ?? "";

    return {
      ip: json.query,
      country: json.country ?? "Unknown",
      countryCode: json.countryCode ?? "--",
      region: json.regionName ?? json.region ?? "Unknown",
      city: json.city ?? "Unknown",
      lat: json.lat ?? 0,
      lon: json.lon ?? 0,
      timezone: json.timezone ?? "Unknown",
      isp: json.isp ?? "Unknown",
      org: json.org ?? "Unknown",
      asn,
      status: "safe",
    };
  } catch {
    return null;
  }
}

import type { NextRequest } from "next/server";
import { validateIP } from "@/lib/validators";
import { fetchIPReputation } from "@/lib/providers/abuseipdb";

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip") ?? "";

  const validation = validateIP(ip);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const result = await fetchIPReputation(ip.trim());

  // When no API key is configured the provider returns null; fall back to
  // default values and signal to the client that this is mock data so the
  // badge renders correctly instead of returning a 500 error.
  if (!result) {
    console.log("[api/lookup/ip] no API key configured, returning mock fallback for", ip);
    return Response.json({
      mock: true,
      ip: ip.trim(),
      abuseConfidenceScore: 0,
      countryCode: "--",
      isp: "Unknown",
      usageType: "Unknown",
      totalReports: 0,
    });
  }

  return Response.json({
    mock: false,
    source: "live",
    provider: "AbuseIPDB",
    ip: result.ipAddress,
    abuseConfidenceScore: result.abuseConfidenceScore,
    countryCode: result.countryCode,
    isp: result.isp,
    usageType: result.usageType,
    totalReports: result.totalReports,
  });
}

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
  if (!result) {
    return Response.json({ error: "Failed to fetch IP reputation data" }, { status: 500 });
  }

  return Response.json({
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

import type { NextRequest } from "next/server";
import { validateIP } from "@/lib/validators";
import { fetchIPReputation } from "@/lib/providers/abuseipdb";
import { MOCK_RESULTS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip") ?? "";

  const validation = validateIP(ip);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  // Try real API first; fall back to mock data
  const live = await fetchIPReputation(ip.trim());
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  // Mock fallback
  const normalised = ip.trim().toLowerCase();
  const mockResult = MOCK_RESULTS[normalised];
  const data = mockResult?.ipReputation ?? {
    ipAddress: ip.trim(),
    abuseConfidenceScore: 0,
    isp: "Unknown",
    usageType: "Unknown",
    country: "Unknown",
    countryCode: "--",
    totalReports: 0,
    lastReportedAt: null,
    status: "unknown" as const,
  };

  return Response.json({ data, mock: true });
}

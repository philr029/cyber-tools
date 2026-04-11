import type { NextRequest } from "next/server";
import { isValidIP, isValidDomain } from "@/lib/validators";
import { fetchGeo } from "@/lib/providers/ipapi";
import type { GeoResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ip") ?? "";
  const target = raw.trim();

  if (!target) {
    return Response.json({ error: "Please provide an IP address." }, { status: 400 });
  }

  if (!isValidIP(target) && !isValidDomain(target)) {
    return Response.json(
      { error: "Please enter a valid IP address or hostname." },
      { status: 400 },
    );
  }

  const live = await fetchGeo(target);
  if (live) {
    return Response.json({ data: live, mock: false });
  }

  // Fallback when ip-api.com is unreachable
  const fallback: GeoResult = {
    ip: target,
    country: "Unknown",
    countryCode: "--",
    region: "Unknown",
    city: "Unknown",
    lat: 0,
    lon: 0,
    timezone: "Unknown",
    isp: "Unknown",
    org: "Unknown",
    asn: "Unknown",
    status: "unknown",
  };

  return Response.json({ data: fallback, mock: true });
}

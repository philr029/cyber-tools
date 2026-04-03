import type { NextRequest } from "next/server";
import { validateIP } from "@/lib/validators";
import { fetchOpenPorts } from "@/lib/providers/shodan";
import type { OpenPortsResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("target") ?? "";
  const target = raw.trim();

  if (!target) {
    return Response.json({ error: "Please provide a target." }, { status: 400 });
  }

  // Shodan only supports IP address lookups
  const validation = validateIP(target);
  if (validation.ok) {
    const live = await fetchOpenPorts(target);
    if (live) {
      return Response.json({ data: live, mock: false });
    }
  }

  // Mock fallback for non-IP targets or when Shodan key is absent / fails
  const data: OpenPortsResult = {
    target,
    openCount: 0,
    ports: [],
    scanDuration: 0,
    status: "unknown",
  };

  return Response.json({ data, mock: true });
}

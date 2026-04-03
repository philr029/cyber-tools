import type { NextRequest } from "next/server";
import { validateIP } from "@/lib/validators";
import { fetchOpenPorts } from "@/lib/providers/shodan";
import type { OpenPortsResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("target") ?? "";

  if (!target.trim()) {
    return Response.json({ error: "Please provide a target." }, { status: 400 });
  }

  // Shodan only supports IP address lookups
  const validation = validateIP(target.trim());
  if (validation.ok) {
    const live = await fetchOpenPorts(target.trim());
    if (live) {
      return Response.json({ data: live, mock: false });
    }
  }

  // Mock fallback for non-IP targets or when Shodan key is absent / fails
  const data: OpenPortsResult = {
    target: target.trim(),
    openCount: 0,
    ports: [],
    scanDuration: 0,
    status: "unknown",
  };

  return Response.json({ data, mock: true });
}

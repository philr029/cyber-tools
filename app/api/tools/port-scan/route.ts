import type { NextRequest } from "next/server";
import { isValidIP, isValidDomain } from "@/lib/validators";
import { scanCommonPorts } from "@/lib/providers/tcpscanner";
import { assertSafeURL } from "@/lib/ssrf";
import type { OpenPortsResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("target") ?? "";
  const target = raw.trim();

  if (!target) {
    return Response.json({ error: "Please provide a target IP or hostname." }, { status: 400 });
  }

  if (!isValidIP(target) && !isValidDomain(target)) {
    return Response.json(
      { error: "Please enter a valid IP address or domain name." },
      { status: 400 },
    );
  }

  // Block SSRF / private ranges
  const safeCheck = assertSafeURL(`https://${target}`);
  if (!safeCheck.ok) {
    return Response.json({ error: safeCheck.reason }, { status: 400 });
  }

  try {
    const result: OpenPortsResult = await scanCommonPorts(target);
    return Response.json({ data: result, mock: false });
  } catch {
    const fallback: OpenPortsResult = {
      target,
      openCount: 0,
      ports: [],
      scanDuration: 0,
      status: "unknown",
    };
    return Response.json({ data: fallback, mock: true });
  }
}

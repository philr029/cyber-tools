import type { NextRequest } from "next/server";
import { validateDomain, validateIPOrDomain } from "@/lib/validators";
import { mxtoolboxLookup } from "@/lib/monitoring-hub/mxtoolbox-client";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";

export async function mxToolboxRouteGET(
  request: NextRequest,
  command: string,
  paramName: "domain" | "target",
): Promise<Response> {
  const ip = clientIpFromRequest(request);
  if (rateLimitExceeded(ip)) {
    return Response.json(
      { error: "Too many requests from this client. Try again shortly.", code: "CLIENT_RATE_LIMIT" },
      { status: 429 },
    );
  }

  const raw = request.nextUrl.searchParams.get(paramName === "domain" ? "domain" : "target") ?? "";
  const validation = paramName === "domain" ? validateDomain(raw) : validateIPOrDomain(raw);
  if (!validation.ok) {
    return Response.json({ error: validation.message, code: "INVALID_INPUT" }, { status: 400 });
  }

  const argument = raw.trim();
  const out = await mxtoolboxLookup(command, argument);
  if (!out.ok) {
    return Response.json({ error: out.message, code: out.code }, { status: out.httpStatus });
  }

  return Response.json({
    data: out.data,
    mock: false,
    durationMs: out.remoteDurationMs,
  });
}

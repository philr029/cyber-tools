import type { NextRequest } from "next/server";
import { validateDomain, validateIPOrDomain } from "@/lib/validators";
import { mxtoolboxLookup } from "@/lib/monitoring-hub/mxtoolbox-client";
import { addTestResult, addErrorLog } from "@/lib/monitoring-hub/store";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";
import type { HubStatus } from "@/lib/monitoring-hub/types";

export const runtime = "nodejs";

const COMMANDS = new Set(["mx", "dns", "blacklist", "spf", "dmarc", "txt", "a"]);

export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request);
  if (rateLimitExceeded(ip)) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const command = typeof (body as { command?: string }).command === "string" ? (body as { command: string }).command.toLowerCase() : "";
  const argument =
    typeof (body as { argument?: string }).argument === "string" ? (body as { argument: string }).argument.trim() : "";

  if (!COMMANDS.has(command)) {
    return Response.json({ error: "Unsupported MXToolbox command for this hub route.", code: "UNSUPPORTED" }, { status: 400 });
  }

  const validation =
    command === "blacklist" ? validateIPOrDomain(argument) : validateDomain(argument);
  if (!validation.ok) {
    return Response.json({ error: validation.message, code: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    const started = Date.now();
    const live = await mxtoolboxLookup(command, argument);
    const durationMs = Date.now() - started;

    if (!live.ok) {
      const row = addTestResult({
        testType: "mxtoolbox",
        target: argument,
        status: "failed",
        responseTime: durationMs,
        summary: `MXToolbox ${command} lookup failed: ${live.message}`,
        rawResult: { command, argument, code: live.code },
        errorMessage: live.message,
        source: "api",
        label: command,
      });
      return Response.json({ data: row, error: live.message, code: live.code }, { status: live.httpStatus });
    }

    const data = live.data as { Failed?: unknown[]; Warnings?: unknown[] };
    const failedN = Array.isArray(data.Failed) ? data.Failed.length : 0;
    const warnN = Array.isArray(data.Warnings) ? data.Warnings.length : 0;
    let status: HubStatus = "healthy";
    if (failedN > 0) status = "failed";
    else if (warnN > 0) status = "warning";

    const row = addTestResult({
      testType: "mxtoolbox",
      target: argument,
      status,
      responseTime: live.remoteDurationMs ?? durationMs,
      summary: `MXToolbox ${command} for ${argument}: ${failedN} failed, ${warnN} warnings.`,
      rawResult: { command, argument, payload: live.data },
      errorMessage: failedN ? `${failedN} failing checks reported by MXToolbox.` : null,
      source: "api",
      label: command,
    });

    return Response.json({ data: row, mock: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "MXToolbox runner crashed.";
    addErrorLog("MXToolbox monitoring runner error.", { message: msg, command, argument });
    return Response.json({ error: msg }, { status: 500 });
  }
}

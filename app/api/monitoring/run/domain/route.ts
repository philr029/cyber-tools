import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { collectDomainDns } from "@/lib/monitoring-hub/domain-dns";
import { mxtoolboxLookup } from "@/lib/monitoring-hub/mxtoolbox-client";
import { addTestResult, addErrorLog } from "@/lib/monitoring-hub/store";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";
import type { HubStatus } from "@/lib/monitoring-hub/types";

export const runtime = "nodejs";

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

  const domain = typeof (body as { domain?: string }).domain === "string" ? (body as { domain: string }).domain : "";
  const v = validateDomain(domain);
  if (!v.ok) {
    return Response.json({ error: v.message }, { status: 400 });
  }

  const started = Date.now();
  try {
    const bundle = await collectDomainDns(domain);
    const mxLive = await mxtoolboxLookup("blacklist", domain.trim().toLowerCase());

    let hubStatus: HubStatus = "healthy";
    const notes: string[] = [];

    if (bundle.errors.length) {
      hubStatus = "warning";
      notes.push(`${bundle.errors.length} DNS resolver warning(s).`);
    }
    if (bundle.mx.length === 0) {
      hubStatus = "warning";
      notes.push("No MX records — email may not be routed to this zone.");
    }

    let mxToolboxBlock: Record<string, unknown> = { skipped: true, reason: "MXTOOLBOX_API_KEY not configured or lookup failed." };
    if (mxLive.ok) {
      const data = mxLive.data as { Failed?: unknown[]; Warnings?: unknown[]; Passed?: unknown[] };
      const failedN = Array.isArray(data.Failed) ? data.Failed.length : 0;
      const warnN = Array.isArray(data.Warnings) ? data.Warnings.length : 0;
      mxToolboxBlock = { live: true, failedChecks: failedN, warnings: warnN };
      if (failedN > 0) {
        hubStatus = "failed";
        notes.push("MXToolbox blacklist reports failures.");
      } else if (warnN > 0 && hubStatus === "healthy") {
        hubStatus = "warning";
        notes.push("MXToolbox blacklist warnings present.");
      }
    } else {
      notes.push(mxLive.message);
    }

    const durationMs = Date.now() - started;

    const row = addTestResult({
      testType: "domain",
      target: domain.trim().toLowerCase(),
      status: hubStatus,
      responseTime: durationMs,
      summary:
        notes.join(" ") ||
        `DNS bundle OK — ${bundle.mx.length} MX, ${bundle.txt.length} TXT, ${bundle.ns.length} NS.`,
      rawResult: {
        bundle,
        mxtoolboxBlacklist: mxLive.ok ? mxLive.data : { error: mxLive.message, code: mxLive.code },
        mailHealthNote:
          "SMTP banner checks and deep mail path tests belong in MXToolbox `smtp` / your MTA telemetry — wire them when you promote beyond demos.",
      },
      errorMessage: hubStatus === "failed" ? notes.join(" · ") : null,
      source: mxLive.ok ? "api" : "mock",
    });

    return Response.json({ data: row, mock: !mxLive.ok });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Domain test crashed.";
    addErrorLog("Domain monitoring runner error.", { message: msg, domain });
    return Response.json({ error: msg }, { status: 500 });
  }
}

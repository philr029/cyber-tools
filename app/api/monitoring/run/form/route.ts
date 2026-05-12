import type { NextRequest } from "next/server";
import { executeFormTest } from "@/lib/server/form-test-executor";
import { MONITORING_FORM_DUMMY_FIELDS } from "@/lib/monitoring-hub/form-playwright-snippet";
import { checkUrlCooldown } from "@/lib/monitoring-hub/url-cooldown";
import { addTestResult, addErrorLog } from "@/lib/monitoring-hub/store";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";
import type { HubStatus } from "@/lib/monitoring-hub/types";
import type { AssertSafeURLOptions } from "@/lib/ssrf";

export const runtime = "nodejs";

function interpretForm(status: number): HubStatus {
  if (status >= 200 && status < 300) return "healthy";
  if (status >= 300 && status < 400) return "warning";
  return "failed";
}

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

  const b = body as Record<string, unknown>;
  const formUrl = typeof b.formUrl === "string" ? b.formUrl.trim() : "";
  const method = typeof b.method === "string" ? b.method : "POST";
  const contentType = typeof b.contentType === "string" ? b.contentType : "application/x-www-form-urlencoded";
  const enabled = b.enabled !== false;
  const minIntervalSeconds = Math.max(30, Math.min(86_400, Number(b.minIntervalSeconds) || 300));
  const allowPrivateTargets = b.allowPrivateTargets === true;

  if (!enabled) {
    return Response.json(
      { error: "Form tests are disabled in this configuration. Enable the toggle to run (staging only)." },
      { status: 400 },
    );
  }

  if (!formUrl) {
    return Response.json({ error: "formUrl is required." }, { status: 400 });
  }

  const cd = checkUrlCooldown(formUrl, minIntervalSeconds * 1000);
  if (!cd.ok) {
    return Response.json(
      {
        error: `Rate limited: wait ${cd.retryAfterSec}s before re-testing this URL (anti-spam guard).`,
        code: "URL_COOLDOWN",
      },
      { status: 429 },
    );
  }

  const extra = Array.isArray(b.fields) ? (b.fields as { key: string; value: string }[]) : [];
  const fields = [...MONITORING_FORM_DUMMY_FIELDS.map((x) => ({ key: x.key, value: x.value })), ...extra];

  const urlSafety: AssertSafeURLOptions | undefined = allowPrivateTargets
    ? { allowPrivateTargets: true }
    : undefined;

  try {
    const exec = await executeFormTest({
      url: formUrl,
      method,
      contentType,
      fields,
      urlSafetyOptions: urlSafety,
    });

    if (!exec.ok) {
      const row = addTestResult({
        testType: "form",
        target: formUrl,
        status: "failed",
        responseTime: null,
        summary: "Form submission probe rejected before HTTP.",
        rawResult: { error: exec.error },
        errorMessage: exec.error,
        source: "api",
      });
      return Response.json({ data: row, error: exec.error }, { status: exec.status });
    }

    const hubStatus = interpretForm(exec.status);
    const successSnippet =
      exec.body && exec.body.length < 4000
        ? exec.body.slice(0, 800)
        : exec.body
          ? `${exec.body.slice(0, 400)}…`
          : "";

    const row = addTestResult({
      testType: "form",
      target: formUrl,
      status: hubStatus,
      responseTime: exec.durationMs,
      summary: `HTTP ${exec.status} in ${exec.durationMs} ms (${hubStatus}).`,
      rawResult: {
        status: exec.status,
        statusText: exec.statusText,
        durationMs: exec.durationMs,
        finalUrl: exec.finalUrl,
        redirected: exec.redirected,
        observations: exec.observations,
        bodyPreview: successSnippet,
        playwrightNote:
          "Use MONITORING_FORM_DUMMY_FIELDS + executeFormTest (server) or POST /api/monitoring/run/form from GitHub Actions / Vercel Cron.",
      },
      errorMessage: hubStatus === "failed" ? `HTTP ${exec.status}` : null,
      source: "api",
    });

    return Response.json({
      data: row,
      details: {
        responseCode: exec.status,
        successMessage: hubStatus === "healthy" ? "2xx response — verify server-side that the lead was created." : null,
        errorMessage: hubStatus === "failed" ? `Non-success HTTP ${exec.status}` : null,
        timeTakenMs: exec.durationMs,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Form test crashed.";
    addErrorLog("Form monitoring runner error.", { message: msg, formUrl });
    return Response.json({ error: msg }, { status: 500 });
  }
}

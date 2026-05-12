import type { NextRequest } from "next/server";
import { assertSafeURL, type AssertSafeURLOptions } from "@/lib/ssrf";
import { normaliseURL, validateURL } from "@/lib/validators";
import { quickTlsCheck } from "@/lib/monitoring-hub/tls-quick-check";
import { addTestResult, addErrorLog } from "@/lib/monitoring-hub/store";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";
import type { HubStatus } from "@/lib/monitoring-hub/types";

export const runtime = "nodejs";

const MAX_BYTES = 256 * 1024;

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

  const rawUrl = (body as { url?: string }).url;
  const allowPrivate =
    (body as { allowPrivateTargets?: boolean }).allowPrivateTargets === true;

  if (!rawUrl || typeof rawUrl !== "string") {
    return Response.json({ error: "url is required." }, { status: 400 });
  }

  const v = validateURL(rawUrl);
  if (!v.ok) {
    return Response.json({ error: v.message }, { status: 400 });
  }

  const urlStr = normaliseURL(rawUrl.trim());
  const safetyOpts: AssertSafeURLOptions | undefined = allowPrivate
    ? { allowPrivateTargets: true }
    : undefined;
  const safe = assertSafeURL(urlStr, safetyOpts);
  if (!safe.ok) {
    return Response.json({ error: safe.reason }, { status: 400 });
  }

  const target = safe.url;
  const started = Date.now();

  let response: Response;
  try {
    response = await fetch(target, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(25_000),
      headers: {
        Accept: "text/html,application/json;q=0.8,*/*;q=0.5",
        "User-Agent": "SecureScope-MonitoringHub/1.0 (+https://example.com)",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed.";
    const row = addTestResult({
      testType: "website",
      target: target.toString(),
      status: "failed",
      responseTime: Date.now() - started,
      summary: `Downtime or network error for ${target.hostname}.`,
      rawResult: { error: msg, url: target.toString() },
      errorMessage: msg,
      source: "api",
    });
    return Response.json({ data: row, error: msg }, { status: 502 });
  }

  const durationMs = Date.now() - started;

  try {
    const buf = await response.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      // discard — we only needed status / timing
    }
  } catch {
    /* ignore body read errors */
  }

  const finalUrl = response.url || target.toString();
  const redirected = response.redirected;
  const code = response.status;

  let ssl: Awaited<ReturnType<typeof quickTlsCheck>> | null = null;
  if (target.protocol === "https:") {
    ssl = await quickTlsCheck(target.hostname);
  }

  let status: HubStatus = "healthy";
  let summary = `HTTP ${code} in ${durationMs} ms.`;
  const errors: string[] = [];

  if (code >= 500) {
    status = "failed";
    summary = `Server error HTTP ${code}.`;
  } else if (code >= 400) {
    status = "failed";
    summary = `Client or auth error HTTP ${code}.`;
  } else if (code >= 300) {
    status = "warning";
    summary = `Redirect chain returned HTTP ${code}.`;
  }

  if (redirected) {
    status = status === "failed" ? "failed" : "warning";
    errors.push(`Redirected to ${finalUrl}`);
  }

  if (durationMs > 8000) {
    status = "failed";
    errors.push("Very slow response (> 8s).");
    summary += " Marked failed for slow TTFB.";
  } else if (durationMs > 3500) {
    if (status === "healthy") status = "warning";
    errors.push("Elevated latency (> 3.5s).");
  }

  if (target.protocol === "https:" && ssl && !ssl.tlsOk) {
    if (status === "healthy") status = "warning";
    errors.push(`TLS: ${ssl.error ?? "invalid"}`);
  }

  const row = addTestResult({
    testType: "website",
    target: target.toString(),
    status,
    responseTime: durationMs,
    summary,
    rawResult: {
      url: target.toString(),
      httpStatus: code,
      finalUrl,
      redirected,
      ssl: ssl
        ? {
            valid: ssl.tlsOk,
            subjectCn: ssl.subjectCn,
            issuerCn: ssl.issuerCn,
            validTo: ssl.validTo,
            error: ssl.error,
          }
        : { note: "TLS probe skipped for non-HTTPS URL." },
    },
    errorMessage: errors.length ? errors.join(" · ") : null,
    source: "api",
  });

  return Response.json({
    data: row,
    details: {
      url: target.toString(),
      httpStatus: code,
      responseTime: durationMs,
      sslValid: ssl?.tlsOk ?? null,
      finalUrl,
      pass: status === "healthy",
    },
  });
}

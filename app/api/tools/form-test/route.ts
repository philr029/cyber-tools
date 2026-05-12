/**
 * Form Testing Tool — submits a form to a target URL server-side.
 * Prevents SSRF by blocking private IPs and unsafe protocols.
 *
 * POST /api/tools/form-test
 * Body: { url, method, fields, contentType, timeoutMs }
 */

import type { NextRequest } from "next/server";
import { executeFormTest } from "@/lib/server/form-test-executor";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    url: rawUrl,
    method = "POST",
    fields = [],
    contentType = "application/x-www-form-urlencoded",
    timeoutMs: rawTimeout,
  } = body as Record<string, unknown>;

  const result = await executeFormTest({
    url: typeof rawUrl === "string" ? rawUrl : "",
    method: typeof method === "string" ? method : undefined,
    fields: Array.isArray(fields) ? (fields as { key: string; value: string }[]) : undefined,
    contentType: typeof contentType === "string" ? contentType : undefined,
    timeoutMs: typeof rawTimeout === "number" ? rawTimeout : undefined,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({
    status: result.status,
    statusText: result.statusText,
    headers: result.headers,
    body: result.body,
    contentType: result.contentType,
    durationMs: result.durationMs,
    finalUrl: result.finalUrl,
    redirected: result.redirected,
    observations: result.observations,
  });
}

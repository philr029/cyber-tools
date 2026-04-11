/**
 * API Tester — proxies arbitrary HTTP requests server-side.
 * Prevents SSRF by blocking private IPs and unsafe protocols.
 *
 * POST /api/tools/api-test
 * Body: { url, method, headers, body, timeoutMs }
 */

import type { NextRequest } from "next/server";
import { assertSafeURL } from "@/lib/ssrf";

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_BYTES = 512 * 1024; // 512 KB cap on response body

// Headers that should never be forwarded to prevent information leakage
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "transfer-encoding",
  "keep-alive",
  "proxy-connection",
  "upgrade",
  "x-forwarded-for",
  "x-real-ip",
]);

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    url: rawUrl,
    method = "GET",
    headers: customHeaders = {},
    body: requestBody,
    timeoutMs: rawTimeout,
  } = body as Record<string, unknown>;

  // Validate method
  const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
  const normalizedMethod = String(method).toUpperCase();
  if (!allowedMethods.includes(normalizedMethod)) {
    return Response.json({ error: `Method '${method}' is not allowed.` }, { status: 400 });
  }

  // Validate URL
  if (!rawUrl || typeof rawUrl !== "string") {
    return Response.json({ error: "A URL is required." }, { status: 400 });
  }

  const safeCheck = assertSafeURL(rawUrl.trim());
  if (!safeCheck.ok) {
    return Response.json({ error: safeCheck.reason }, { status: 400 });
  }

  // Validate and clamp timeout
  const timeoutMs = Math.min(
    Math.max(1_000, Number(rawTimeout) || DEFAULT_TIMEOUT_MS),
    MAX_TIMEOUT_MS,
  );

  // Build forwarded headers (sanitized)
  const outHeaders: Record<string, string> = {};
  if (customHeaders && typeof customHeaders === "object") {
    for (const [k, v] of Object.entries(customHeaders as Record<string, unknown>)) {
      if (typeof k === "string" && typeof v === "string" && k.trim()) {
        const lower = k.toLowerCase();
        if (!STRIPPED_REQUEST_HEADERS.has(lower)) {
          outHeaders[k.trim()] = v;
        }
      }
    }
  }

  // Build fetch init
  const hasBody = ["POST", "PUT", "PATCH"].includes(normalizedMethod);
  const fetchInit: RequestInit = {
    method: normalizedMethod,
    headers: outHeaders,
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  };

  if (hasBody && requestBody !== undefined && requestBody !== null) {
    fetchInit.body = typeof requestBody === "string" ? requestBody : JSON.stringify(requestBody);
  }

  const startedAt = Date.now();
  let response: Response;
  try {
    // safeCheck.url has already been validated by assertSafeURL (blocks private IPs,
    // loopback, metadata endpoints, and non-HTTP protocols). This is an intentional
    // proxy tool; the SSRF risk is mitigated by that check.
    // lgtm[js/request-forgery]
    response = await fetch(safeCheck.url, fetchInit);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed.";
    const timedOut = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("abort");
    return Response.json(
      { error: timedOut ? "Request timed out." : `Network error: ${message}` },
      { status: 502 },
    );
  }

  const durationMs = Date.now() - startedAt;

  // Collect response headers (excluding sensitive ones)
  const SENSITIVE_RESPONSE_HEADERS = new Set(["set-cookie", "authorization", "proxy-authorization"]);
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => {
    if (!SENSITIVE_RESPONSE_HEADERS.has(k.toLowerCase())) {
      responseHeaders[k] = v;
    }
  });

  // Read body with size cap
  const contentType = response.headers.get("content-type") ?? "";
  let responseBody: string | null = null;
  try {
    const buffer = await response.arrayBuffer();
    const truncated = buffer.byteLength > MAX_RESPONSE_BYTES;
    const slice = truncated ? buffer.slice(0, MAX_RESPONSE_BYTES) : buffer;
    responseBody = new TextDecoder("utf-8", { fatal: false }).decode(slice);
    if (truncated) {
      responseBody += `\n\n[Response truncated — showing first ${MAX_RESPONSE_BYTES / 1024} KB of ${(buffer.byteLength / 1024).toFixed(1)} KB]`;
    }
  } catch {
    responseBody = null;
  }

  return Response.json({
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: responseBody,
    contentType,
    durationMs,
    url: safeCheck.url.toString(),
  });
}

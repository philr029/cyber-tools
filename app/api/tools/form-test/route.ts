/**
 * Form Testing Tool — submits a form to a target URL server-side.
 * Prevents SSRF by blocking private IPs and unsafe protocols.
 *
 * POST /api/tools/form-test
 * Body: { url, method, fields, contentType, timeoutMs }
 */

import type { NextRequest } from "next/server";
import { assertSafeURL } from "@/lib/ssrf";

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_BYTES = 256 * 1024; // 256 KB cap

interface FormField {
  key: string;
  value: string;
}

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

  // Validate method
  const normalizedMethod = String(method).toUpperCase();
  if (!["GET", "POST"].includes(normalizedMethod)) {
    return Response.json({ error: "Only GET and POST methods are supported for form testing." }, { status: 400 });
  }

  // Validate URL
  if (!rawUrl || typeof rawUrl !== "string") {
    return Response.json({ error: "A target URL is required." }, { status: 400 });
  }

  const safeCheck = assertSafeURL(rawUrl.trim());
  if (!safeCheck.ok) {
    return Response.json({ error: safeCheck.reason }, { status: 400 });
  }

  // Validate content type
  const allowedContentTypes = ["application/x-www-form-urlencoded", "multipart/form-data", "application/json"];
  const normalizedContentType = String(contentType);
  if (!allowedContentTypes.includes(normalizedContentType)) {
    return Response.json({ error: "Unsupported content type." }, { status: 400 });
  }

  // Validate fields
  if (!Array.isArray(fields)) {
    return Response.json({ error: "Fields must be an array." }, { status: 400 });
  }

  const validFields: FormField[] = [];
  for (const f of fields as unknown[]) {
    if (
      f &&
      typeof f === "object" &&
      "key" in f &&
      "value" in f &&
      typeof (f as FormField).key === "string" &&
      typeof (f as FormField).value === "string" &&
      (f as FormField).key.trim()
    ) {
      validFields.push({ key: (f as FormField).key.trim(), value: (f as FormField).value });
    }
  }

  const timeoutMs = Math.min(
    Math.max(1_000, Number(rawTimeout) || DEFAULT_TIMEOUT_MS),
    MAX_TIMEOUT_MS,
  );

  // Build the target URL and request
  let targetUrl = safeCheck.url.toString();
  const fetchInit: RequestInit = {
    method: normalizedMethod,
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  };

  if (normalizedMethod === "GET") {
    // Append fields as query params
    const params = new URLSearchParams();
    for (const { key, value } of validFields) {
      params.append(key, value);
    }
    const sep = targetUrl.includes("?") ? "&" : "?";
    if (validFields.length > 0) {
      targetUrl = `${targetUrl}${sep}${params.toString()}`;
    }
  } else {
    // POST — encode body
    if (normalizedContentType === "application/x-www-form-urlencoded") {
      const params = new URLSearchParams();
      for (const { key, value } of validFields) {
        params.append(key, value);
      }
      fetchInit.body = params.toString();
      fetchInit.headers = { "Content-Type": "application/x-www-form-urlencoded" };
    } else if (normalizedContentType === "multipart/form-data") {
      const formData = new FormData();
      for (const { key, value } of validFields) {
        formData.append(key, value);
      }
      fetchInit.body = formData;
      // Let fetch set Content-Type with boundary automatically
    } else if (normalizedContentType === "application/json") {
      const obj: Record<string, string> = {};
      for (const { key, value } of validFields) {
        obj[key] = value;
      }
      fetchInit.body = JSON.stringify(obj);
      fetchInit.headers = { "Content-Type": "application/json" };
    }
  }

  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(targetUrl, fetchInit);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed.";
    const timedOut = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("abort");
    return Response.json(
      { error: timedOut ? "Request timed out." : `Network error: ${message}` },
      { status: 502 },
    );
  }

  const durationMs = Date.now() - startedAt;

  // Collect response headers
  const SENSITIVE = new Set(["set-cookie", "authorization"]);
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => {
    if (!SENSITIVE.has(k.toLowerCase())) {
      responseHeaders[k] = v;
    }
  });

  // Read body with size cap
  const contentTypeResponse = response.headers.get("content-type") ?? "";
  let responseBody: string | null = null;
  try {
    const buffer = await response.arrayBuffer();
    const truncated = buffer.byteLength > MAX_RESPONSE_BYTES;
    const slice = truncated ? buffer.slice(0, MAX_RESPONSE_BYTES) : buffer;
    responseBody = new TextDecoder("utf-8", { fatal: false }).decode(slice);
    if (truncated) {
      responseBody += `\n\n[Response truncated — showing first ${MAX_RESPONSE_BYTES / 1024} KB]`;
    }
  } catch {
    responseBody = null;
  }

  // Security observations
  const observations: Array<{ label: string; severity: "info" | "warning" | "pass" }> = [];

  // Check for common security indicators in the response
  const csrfHeaderPresent =
    response.headers.has("x-csrf-token") ||
    response.headers.has("x-xsrf-token") ||
    responseBody?.includes("csrf") === true ||
    responseBody?.includes("_token") === true;

  if (normalizedMethod === "POST" && !csrfHeaderPresent) {
    observations.push({ label: "No CSRF token detected in response — potential CSRF vulnerability", severity: "warning" });
  }
  if (normalizedMethod === "POST" && csrfHeaderPresent) {
    observations.push({ label: "CSRF token detected in response", severity: "pass" });
  }

  // Check for security headers
  const securityHeaders = [
    { header: "content-security-policy", label: "Content-Security-Policy header present" },
    { header: "x-frame-options", label: "X-Frame-Options header present" },
    { header: "x-content-type-options", label: "X-Content-Type-Options header present" },
  ];
  for (const { header, label } of securityHeaders) {
    if (response.headers.has(header)) {
      observations.push({ label, severity: "pass" });
    } else {
      observations.push({ label: `Missing ${header.toUpperCase()} header`, severity: "warning" });
    }
  }

  // Check if response reveals server info
  if (response.headers.has("server") || response.headers.has("x-powered-by")) {
    observations.push({ label: `Server version disclosure detected (${response.headers.get("server") ?? response.headers.get("x-powered-by")})`, severity: "warning" });
  }

  // Check redirect to HTTPS
  if (safeCheck.url.protocol === "http:" && response.redirected) {
    observations.push({ label: "HTTP upgraded to HTTPS via redirect", severity: "pass" });
  } else if (safeCheck.url.protocol === "http:") {
    observations.push({ label: "Connection uses plain HTTP (not HTTPS)", severity: "warning" });
  }

  // Detect potential error in response body
  if (responseBody && /error|exception|traceback|stack trace|warning:/i.test(responseBody)) {
    observations.push({ label: "Response body may contain error/debug information", severity: "warning" });
  }

  return Response.json({
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: responseBody,
    contentType: contentTypeResponse,
    durationMs,
    finalUrl: response.url || targetUrl,
    redirected: response.redirected,
    observations,
  });
}

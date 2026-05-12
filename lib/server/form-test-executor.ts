/**
 * Shared server-side form submission probe (SSRF-safe).
 * Used by POST /api/tools/form-test and the Automated Monitoring Hub.
 */

import { assertSafeURL, type AssertSafeURLOptions } from "@/lib/ssrf";

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_BYTES = 256 * 1024; // 256 KB cap

export interface FormFieldInput {
  key: string;
  value: string;
}

export interface ExecuteFormTestInput {
  url: string;
  method?: string;
  fields?: FormFieldInput[];
  contentType?: string;
  timeoutMs?: number;
  /** Forwarded to assertSafeURL for staging/lab URLs when explicitly enabled. */
  urlSafetyOptions?: AssertSafeURLOptions;
}

export type FormTestExecutorResult =
  | {
      ok: true;
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string | null;
      contentType: string;
      durationMs: number;
      finalUrl: string;
      redirected: boolean;
      observations: Array<{ label: string; severity: "info" | "warning" | "pass" }>;
    }
  | { ok: false; status: number; error: string };

export async function executeFormTest(input: ExecuteFormTestInput): Promise<FormTestExecutorResult> {
  const {
    url: rawUrl,
    method = "POST",
    fields = [],
    contentType = "application/x-www-form-urlencoded",
    timeoutMs: rawTimeout,
    urlSafetyOptions,
  } = input;

  const normalizedMethod = String(method).toUpperCase();
  if (!["GET", "POST"].includes(normalizedMethod)) {
    return { ok: false, status: 400, error: "Only GET and POST methods are supported for form testing." };
  }

  if (!rawUrl || typeof rawUrl !== "string") {
    return { ok: false, status: 400, error: "A target URL is required." };
  }

  const safeCheck = assertSafeURL(rawUrl.trim(), urlSafetyOptions);
  if (!safeCheck.ok) {
    return { ok: false, status: 400, error: safeCheck.reason };
  }

  const allowedContentTypes = ["application/x-www-form-urlencoded", "multipart/form-data", "application/json"];
  const normalizedContentType = String(contentType);
  if (!allowedContentTypes.includes(normalizedContentType)) {
    return { ok: false, status: 400, error: "Unsupported content type." };
  }

  if (!Array.isArray(fields)) {
    return { ok: false, status: 400, error: "Fields must be an array." };
  }

  const validFields: FormFieldInput[] = [];
  for (const f of fields) {
    if (
      f &&
      typeof f === "object" &&
      typeof f.key === "string" &&
      typeof f.value === "string" &&
      f.key.trim()
    ) {
      validFields.push({ key: f.key.trim(), value: f.value });
    }
  }

  const timeoutMs = Math.min(Math.max(1_000, Number(rawTimeout) || DEFAULT_TIMEOUT_MS), MAX_TIMEOUT_MS);

  const targetURL = safeCheck.url;
  const fetchInit: RequestInit = {
    method: normalizedMethod,
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  };

  if (normalizedMethod === "GET") {
    for (const { key, value } of validFields) {
      targetURL.searchParams.append(key, value);
    }
  } else {
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
    // targetURL validated by assertSafeURL — intentional outbound proxy.
    // lgtm[js/request-forgery]
    response = await fetch(targetURL, fetchInit);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed.";
    const timedOut = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("abort");
    return {
      ok: false,
      status: 502,
      error: timedOut ? "Request timed out." : `Network error: ${message}`,
    };
  }

  const durationMs = Date.now() - startedAt;

  const SENSITIVE = new Set(["set-cookie", "authorization"]);
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => {
    if (!SENSITIVE.has(k.toLowerCase())) {
      responseHeaders[k] = v;
    }
  });

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

  const observations: Array<{ label: string; severity: "info" | "warning" | "pass" }> = [];

  const csrfHeaderPresent =
    response.headers.has("x-csrf-token") ||
    response.headers.has("x-xsrf-token") ||
    responseBody?.includes("csrf") === true ||
    responseBody?.includes("_token") === true;

  if (normalizedMethod === "POST" && !csrfHeaderPresent) {
    observations.push({
      label: "No CSRF token detected in response — potential CSRF vulnerability",
      severity: "warning",
    });
  }
  if (normalizedMethod === "POST" && csrfHeaderPresent) {
    observations.push({ label: "CSRF token detected in response", severity: "pass" });
  }

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

  if (response.headers.has("server") || response.headers.has("x-powered-by")) {
    observations.push({
      label: `Server version disclosure detected (${response.headers.get("server") ?? response.headers.get("x-powered-by")})`,
      severity: "warning",
    });
  }

  if (safeCheck.url.protocol === "http:" && response.redirected) {
    observations.push({ label: "HTTP upgraded to HTTPS via redirect", severity: "pass" });
  } else if (safeCheck.url.protocol === "http:") {
    observations.push({ label: "Connection uses plain HTTP (not HTTPS)", severity: "warning" });
  }

  if (responseBody && /error|exception|traceback|stack trace|warning:/i.test(responseBody)) {
    observations.push({ label: "Response body may contain error/debug information", severity: "warning" });
  }

  return {
    ok: true,
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: responseBody,
    contentType: contentTypeResponse,
    durationMs,
    finalUrl: response.url || targetURL.toString(),
    redirected: response.redirected,
    observations,
  };
}

/**
 * Website Health Checker — server-side proxy.
 * Fetches a URL, measures response time, extracts HTTP status, page title,
 * meta description, H1 headings, canonical URL, and security header grades.
 *
 * GET /api/tools/website-health?url=<encoded-url>
 *
 * SSRF is mitigated via assertSafeURL which blocks private IPs, loopback,
 * and cloud metadata endpoints.
 */

import type { NextRequest } from "next/server";
import { assertSafeURL } from "@/lib/ssrf";
import { normaliseURL } from "@/lib/validators";

const TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 256 * 1024; // 256 KB — enough to parse most page <head> tags

// Security headers that are graded
const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
] as const;

/** Strip HTML tags and decode common HTML entities from extracted text to prevent XSS via JSON output */
function sanitizeExtractedText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")          // strip all HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract content between <title>…</title> (case-insensitive) */
function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return sanitizeExtractedText(m[1]).slice(0, 300) || null;
}

/** Extract a specific <meta name="…" content="…"> value */
function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*?)["']`,
    "i",
  );
  const m = html.match(re) ?? html.match(
    new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']${name}["']`, "i"),
  );
  return m ? m[1].trim().slice(0, 500) : null;
}

/** Extract first <h1> text */
function extractH1(html: string): string | null {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  // Strip inner tags
  return m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 300) || null;
}

/** Extract <link rel="canonical" href="…"> */
function extractCanonical(html: string): string | null {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*?)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']*?)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1].trim().slice(0, 1000) : null;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url") ?? "";

  if (!rawUrl.trim()) {
    return Response.json({ error: "A URL is required." }, { status: 400 });
  }

  const normalised = normaliseURL(rawUrl.trim());
  const safeCheck = assertSafeURL(normalised);
  if (!safeCheck.ok) {
    return Response.json({ error: safeCheck.reason }, { status: 400 });
  }

  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(safeCheck.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        // Polite user-agent for crawling
        "User-Agent": "SecureScope-HealthChecker/1.0 (+https://securescope.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Request failed.";
    const timedOut = msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("abort");
    return Response.json(
      { error: timedOut ? "Request timed out after 15 seconds." : `Could not reach URL: ${msg}` },
      { status: 502 },
    );
  }

  const durationMs = Date.now() - startedAt;
  const contentType = response.headers.get("content-type") ?? "";
  const isHtml = contentType.includes("text/html") || contentType.includes("application/xhtml");

  // Collect security headers
  const secHeaders: Record<string, string | null> = {};
  for (const h of SECURITY_HEADERS) {
    secHeaders[h] = response.headers.get(h);
  }

  // Parse page content only for HTML responses
  let title: string | null = null;
  let metaDescription: string | null = null;
  let metaRobots: string | null = null;
  let metaViewport: string | null = null;
  let h1: string | null = null;
  let canonical: string | null = null;

  if (isHtml) {
    try {
      const buffer = await response.arrayBuffer();
      const slice = buffer.byteLength > MAX_BODY_BYTES ? buffer.slice(0, MAX_BODY_BYTES) : buffer;
      const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);
      title = extractTitle(html);
      metaDescription = extractMeta(html, "description");
      metaRobots = extractMeta(html, "robots");
      metaViewport = extractMeta(html, "viewport");
      h1 = extractH1(html);
      canonical = extractCanonical(html);
    } catch {
      // Parsing failed — continue without page data
    }
  } else {
    // Non-HTML: consume body to free connection
    try { await response.body?.cancel(); } catch { /* ignore */ }
  }

  // Build SEO checks array
  const seoChecks = [
    {
      name: "Page title",
      present: !!title,
      value: title,
      status: !title ? "fail" : title.length < 10 ? "warning" : title.length > 60 ? "warning" : "pass",
      hint: !title ? "No <title> tag found." : title.length > 60 ? "Title is longer than 60 characters." : undefined,
    },
    {
      name: "Meta description",
      present: !!metaDescription,
      value: metaDescription,
      status: !metaDescription ? "warning" : metaDescription.length < 50 ? "warning" : metaDescription.length > 160 ? "warning" : "pass",
      hint: !metaDescription ? "No meta description found." : metaDescription.length > 160 ? "Description is longer than 160 characters." : undefined,
    },
    {
      name: "H1 heading",
      present: !!h1,
      value: h1,
      status: !h1 ? "warning" : "pass",
      hint: !h1 ? "No <h1> tag found on the page." : undefined,
    },
    {
      name: "Canonical URL",
      present: !!canonical,
      value: canonical,
      status: canonical ? "pass" : "warning",
      hint: !canonical ? "No canonical link tag found." : undefined,
    },
    {
      name: "Robots meta",
      present: !!metaRobots,
      value: metaRobots,
      status: metaRobots?.toLowerCase().includes("noindex") ? "warning" : "pass",
      hint: metaRobots?.toLowerCase().includes("noindex") ? "Page is marked noindex — not eligible for search ranking." : undefined,
    },
    {
      name: "Viewport meta",
      present: !!metaViewport,
      value: metaViewport,
      status: !metaViewport ? "warning" : "pass",
      hint: !metaViewport ? "No viewport meta tag found — may not be mobile-friendly." : undefined,
    },
  ] as const;

  // Build security header checks
  const headerChecks = SECURITY_HEADERS.map((h) => ({
    name: h,
    present: !!secHeaders[h],
    value: secHeaders[h],
    status: secHeaders[h] ? "pass" : h === "strict-transport-security" || h === "content-security-policy" ? "fail" : "warning",
  }));

  return Response.json({
    url: normalised,
    finalUrl: response.url,
    statusCode: response.status,
    statusText: response.statusText,
    durationMs,
    contentType,
    redirected: response.redirected,
    isHtml,
    seoChecks,
    headerChecks,
  });
}

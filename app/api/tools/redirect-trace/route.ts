/**
 * URL Redirect Trace — follows redirect chain server-side.
 * Prevents SSRF by blocking private IPs and unsafe targets.
 *
 * GET /api/tools/redirect-trace?url=<url>
 */

import type { NextRequest } from "next/server";
import { validateURL, normaliseURL } from "@/lib/validators";
import { assertSafeURL } from "@/lib/ssrf";
import type { RedirectTraceResult, RedirectHop, StatusLevel } from "@/lib/types";

const MAX_REDIRECTS = 15;
const FETCH_TIMEOUT_MS = 10_000;

const SUSPICIOUS_TLDS = new Set([
  "xyz", "tk", "ml", "ga", "cf", "gq", "top", "work", "click",
  "link", "online", "site", "icu", "buzz", "monster",
]);

function isSuspiciousDomain(url: string): { suspicious: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const tld = hostname.split(".").pop() ?? "";

    if (SUSPICIOUS_TLDS.has(tld)) {
      return { suspicious: true, reason: `Suspicious TLD: .${tld}` };
    }

    // Detect URL shorteners
    const shorteners = new Set([
      "bit.ly", "tinyurl.com", "t.co", "ow.ly", "buff.ly",
      "short.link", "rebrand.ly", "cutt.ly", "tiny.one",
    ]);
    if (shorteners.has(hostname)) {
      return { suspicious: true, reason: `URL shortener: ${hostname}` };
    }

    // IP address used as domain (no hostname)
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return { suspicious: true, reason: "Destination uses raw IP address" };
    }
  } catch {
    return { suspicious: true, reason: "Could not parse URL" };
  }
  return { suspicious: false };
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url") ?? "";

  const validation = validateURL(rawUrl);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const startUrl = normaliseURL(rawUrl.trim());

  const safeCheck = assertSafeURL(startUrl);
  if (!safeCheck.ok) {
    return Response.json({ error: safeCheck.reason }, { status: 400 });
  }

  const hops: RedirectHop[] = [];
  let currentUrl = startUrl;
  let globalSuspicious = false;
  const suspiciousReasons: string[] = [];

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    // Safety check on each hop
    const hopSafe = assertSafeURL(currentUrl);
    if (!hopSafe.ok) {
      hops.push({
        url: currentUrl,
        statusCode: 0,
        isSuspicious: true,
        reason: `Blocked: ${hopSafe.reason}`,
      });
      globalSuspicious = true;
      suspiciousReasons.push(`Redirect to unsafe destination blocked: ${hopSafe.reason}`);
      break;
    }

    const { suspicious, reason } = isSuspiciousDomain(currentUrl);
    if (suspicious && reason) {
      suspiciousReasons.push(reason);
      globalSuspicious = true;
    }

    let res: Response;
    try {
      res = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SecureScope/1.0; +https://securescope.app)",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      hops.push({
        url: currentUrl,
        statusCode: 0,
        isSuspicious: suspicious,
        reason: err instanceof Error ? err.message : "Connection failed",
      });
      break;
    }

    const statusCode = res.status;
    hops.push({ url: currentUrl, statusCode, isSuspicious: suspicious, reason });

    // Follow redirects
    if (statusCode >= 300 && statusCode < 400) {
      const location = res.headers.get("location");
      if (!location) break;

      // Resolve relative redirects
      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        break;
      }
    } else {
      break;
    }
  }

  if (hops.length > MAX_REDIRECTS) {
    suspiciousReasons.push(`Redirect chain exceeds ${MAX_REDIRECTS} hops`);
    globalSuspicious = true;
  }

  const finalUrl = hops[hops.length - 1]?.url ?? startUrl;
  const status: StatusLevel = globalSuspicious
    ? suspiciousReasons.length >= 2
      ? "risk"
      : "warning"
    : "safe";

  const result: RedirectTraceResult = {
    originalUrl: startUrl,
    finalUrl,
    hopCount: hops.length,
    hops,
    isSuspicious: globalSuspicious,
    suspiciousReasons,
    status,
  };

  return Response.json({ data: result, mock: false });
}

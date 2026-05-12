/**
 * Lightweight per-IP sliding-window rate limiter for monitoring API routes.
 * For production scale, prefer Redis / Upstash / edge middleware quotas.
 */

const WINDOW_MS = 60_000;
const MAX_HITS = 40;

const buckets = new Map<string, number[]>();

export function rateLimitExceeded(ip: string): boolean {
  const now = Date.now();
  const key = ip || "unknown";
  const prev = buckets.get(key) ?? [];
  const fresh = prev.filter((t) => now - t < WINDOW_MS);
  fresh.push(now);
  buckets.set(key, fresh);
  return fresh.length > MAX_HITS;
}

export function clientIpFromRequest(request: Request): string {
  const h = request.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return "local";
}

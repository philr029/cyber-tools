const lastRun = new Map<string, number>();

export function checkUrlCooldown(urlKey: string, minIntervalMs: number): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = urlKey.trim();
  const now = Date.now();
  const prev = lastRun.get(key) ?? 0;
  const elapsed = now - prev;
  if (prev > 0 && elapsed < minIntervalMs) {
    return { ok: false, retryAfterSec: Math.ceil((minIntervalMs - elapsed) / 1000) };
  }
  lastRun.set(key, now);
  return { ok: true };
}

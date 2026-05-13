/** Returns false when `expiresAt` (ISO date or datetime) is in the past. */
export function isBannerScheduleActive(expiresAt?: string): boolean {
  if (!expiresAt?.trim()) return true;
  const raw = expiresAt.trim();
  const hasTime = /T\d/.test(raw);
  const iso = hasTime ? raw : `${raw}T23:59:59.999Z`;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return true;
  return Date.now() <= t;
}

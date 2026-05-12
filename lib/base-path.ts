/**
 * Optional sub-path for static hosts (e.g. GitHub Pages). Set `NEXT_PUBLIC_BASE_PATH`
 * to match `basePath` in `next.config.ts` so client-side links stay consistent.
 */
export function siteBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

/** Prefix an internal route for `<Link href>` / `router.push` when a base path is configured. */
export function withBasePath(path: string): string {
  const base = siteBasePath();
  if (!base) return path.startsWith("/") ? path : `/${path}`;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === base || p.startsWith(`${base}/`)) return p;
  return `${base}${p}`;
}

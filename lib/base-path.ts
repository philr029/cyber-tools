/**
 * Mirrors `next.config.ts`: when the app is hosted under a subpath (e.g. GitHub
 * project pages), set `NEXT_PUBLIC_BASE_PATH` to `/repo-name` (no trailing slash).
 * Same-origin `fetch("/api/...")` does not apply that prefix automatically; use
 * `withBasePath` or `appFetch` from the browser (and redirects in `proxy.ts`).
 */
export function getAppBasePath(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/$/, "");
}

/** Prefix an app-absolute path (starts with `/`) for fetch() and middleware redirects. */
export function withBasePath(href: string): string {
  const base = getAppBasePath();
  const path = href.startsWith("/") ? href : `/${href}`;
  return base ? `${base}${path}` : path;
}

/**
 * Use for post-login `router.push` when the target comes from a query string.
 * Blocks protocol-relative and absolute URLs (open-redirect hardening).
 */
export function safeAppRedirectPath(raw: string | null, fallback = "/dashboard"): string {
  if (raw == null) return fallback;
  const s = raw.trim();
  if (s === "") return fallback;
  if (!s.startsWith("/") || s.startsWith("//")) return fallback;
  if (s.includes("://") || s.includes("\\")) return fallback;
  return s;
}

/** Same-origin fetch that respects `NEXT_PUBLIC_BASE_PATH`. Pass-through for absolute http(s) URLs. */
export function appFetch(input: string, init?: RequestInit): Promise<Response> {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return fetch(input, init);
  }
  return fetch(withBasePath(input), init);
}

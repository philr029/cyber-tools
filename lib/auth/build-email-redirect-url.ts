import { safeAppRedirectPath, withBasePath } from "@/lib/base-path";

/**
 * Absolute URL for Supabase `redirectTo` / `emailRedirectTo` (PKCE / magic links).
 * Call from the browser only (e.g. form submit) — `window` is required.
 */
export function buildSupabaseEmailRedirectUrl(nextAppPath: string): string {
  const safe = safeAppRedirectPath(nextAppPath, "/dashboard");
  const q = encodeURIComponent(safe);
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.origin}${withBasePath(`/auth/callback?next=${q}`)}`;
}

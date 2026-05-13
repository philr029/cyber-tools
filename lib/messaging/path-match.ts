import type { AuthVisibility } from "@/lib/messaging/types";

export function matchesPathPrefixes(pathname: string, prefixes: string[] | undefined): boolean {
  if (!prefixes?.length) return true;
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function matchesAuth(
  visibility: AuthVisibility | undefined,
  isLoggedIn: boolean,
): boolean {
  const v = visibility ?? "any";
  if (v === "any") return true;
  if (v === "logged-in") return isLoggedIn;
  return !isLoggedIn;
}

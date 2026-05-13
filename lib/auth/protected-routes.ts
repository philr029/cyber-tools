import type { UserRole } from "@/lib/auth/user-role";
import { roleMeetsMinimum } from "@/lib/auth/user-role";

/** Always require a signed session (middleware). */
export const SESSION_REQUIRED_PREFIXES = [
  "/dashboard",
  "/settings",
  "/account",
] as const;

/**
 * Tool routes that call paid or sensitive APIs — require a signed-in session.
 * (Anonymous visitors can still use the public marketing/tool index pages.)
 */
export const TOOL_SESSION_PREFIXES = [
  "/tools/ai-assistant",
  "/tools/ai-report",
  "/tools/automated-monitoring",
  "/tools/ip-lookup",
  "/tools/domain-lookup",
  "/tools/url-analysis",
  "/tools/phone-line-tester",
  "/tools/api-tester",
  "/tools/lead-intelligence",
] as const;

/** Admin-only URL prefix (session must be admin). */
export const ADMIN_PREFIX = "/dashboard/admin";

/**
 * Paths that require at least **editor** (viewers are redirected to the dashboard).
 * Dashboard saved scans / exports are treated as editor+.
 */
export const EDITOR_MINIMUM_PREFIXES = [
  ...TOOL_SESSION_PREFIXES,
  "/dashboard/saved",
  "/dashboard/reports",
  "/dashboard/vault",
] as const;

export function pathRequiresSession(pathWithoutBase: string): boolean {
  if (SESSION_REQUIRED_PREFIXES.some((p) => pathWithoutBase === p || pathWithoutBase.startsWith(`${p}/`))) {
    return true;
  }
  return TOOL_SESSION_PREFIXES.some((p) => pathWithoutBase === p || pathWithoutBase.startsWith(`${p}/`));
}

export function pathRequiresAdmin(pathWithoutBase: string): boolean {
  return pathWithoutBase === ADMIN_PREFIX || pathWithoutBase.startsWith(`${ADMIN_PREFIX}/`);
}

export function pathRequiresEditor(pathWithoutBase: string): boolean {
  return EDITOR_MINIMUM_PREFIXES.some((p) => pathWithoutBase === p || pathWithoutBase.startsWith(`${p}/`));
}

export function roleMayAccessPath(role: UserRole, pathWithoutBase: string): boolean {
  if (pathRequiresAdmin(pathWithoutBase)) {
    return role === "admin";
  }
  if (pathRequiresEditor(pathWithoutBase)) {
    return roleMeetsMinimum(role, "editor");
  }
  return true;
}

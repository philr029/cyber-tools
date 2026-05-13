/**
 * Application roles for RBAC. Stored on `public.profiles` and enforced in `proxy.ts` + RLS.
 * Promotions take effect on the next middleware refresh (cookie session) or immediately after client refresh.
 */
export type UserRole = "admin" | "editor" | "viewer";

export type UserStatus = "active" | "disabled";

export function isUserRole(value: string): value is UserRole {
  return value === "admin" || value === "editor" || value === "viewer";
}

/** Minimum role rank for capability checks (admin > editor > viewer). */
const RANK: Record<UserRole, number> = { admin: 3, editor: 2, viewer: 1 };

export function roleMeetsMinimum(role: UserRole, minimum: UserRole): boolean {
  return RANK[role] >= RANK[minimum];
}

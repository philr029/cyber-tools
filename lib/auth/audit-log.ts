import "server-only";
import type { UserRole } from "@/lib/auth/user-role";

export type AuditEventType =
  | "login_success"
  | "login_failure"
  | "logout"
  | "role_change"
  | "tool_access"
  | "sensitive_action"
  | "password_reset_requested"
  | "password_reset_completed";

export interface AuditLogEntry {
  id: string;
  ts: string;
  type: AuditEventType;
  /** Authenticated user id, or null for anonymous failures. */
  userId: string | null;
  email: string | null;
  ip: string | null;
  message: string;
  meta?: Record<string, string | number | boolean | null>;
}

const MAX_ENTRIES = 500;
const entries: AuditLogEntry[] = [];

function randomId(): string {
  return `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * In-process audit ring buffer for demos and local dev.
 * On Vercel/serverless this only survives warm invocations — replace with Postgres,
 * DynamoDB, or a logging pipeline before relying on it for compliance.
 */
export function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "ts"> & { id?: string; ts?: string }): void {
  const row: AuditLogEntry = {
    id: entry.id ?? randomId(),
    ts: entry.ts ?? new Date().toISOString(),
    type: entry.type,
    userId: entry.userId,
    email: entry.email,
    ip: entry.ip,
    message: entry.message,
    meta: entry.meta,
  };
  entries.push(row);
  while (entries.length > MAX_ENTRIES) entries.shift();
}

export function listAuditLogs(limit = 100): AuditLogEntry[] {
  return entries.slice(-limit).reverse();
}

export function auditToolAccess(userId: string, email: string, ip: string | null, path: string): void {
  appendAuditLog({
    type: "tool_access",
    userId,
    email,
    ip,
    message: `Tool page accessed: ${path}`,
    meta: { path },
  });
}

export function auditRoleChange(actorId: string, actorEmail: string, ip: string | null, targetId: string, newRole: UserRole): void {
  appendAuditLog({
    type: "role_change",
    userId: actorId,
    email: actorEmail,
    ip,
    message: `Role updated for user ${targetId}`,
    meta: { targetId, newRole },
  });
}

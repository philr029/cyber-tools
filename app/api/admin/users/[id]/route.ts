import { NextRequest, NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server-auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { auditRoleChange, appendAuditLog } from "@/lib/auth/audit-log";
import { getClientIp } from "@/lib/server/client-ip";
import { isUserRole, type UserRole, type UserStatus } from "@/lib/auth/user-role";

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { user, profile } = await getServerAuth();
  if (!user || !profile || profile.disabled || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id: targetId } = await ctx.params;
  if (!targetId || targetId === user.id) {
    return NextResponse.json({ error: "Cannot modify your own account here." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const b = body as { role?: string; status?: string };
  if (b.role === undefined && b.status === undefined) {
    return NextResponse.json({ error: "No changes." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const ip = getClientIp(request);

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (b.role !== undefined) {
    if (!isUserRole(b.role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    patch.role = b.role;
    auditRoleChange(user.id, user.email ?? "", ip, targetId, b.role as UserRole);
  }

  if (b.status !== undefined) {
    if (b.status !== "active" && b.status !== "disabled") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.disabled = b.status === "disabled";
    appendAuditLog({
      type: "sensitive_action",
      userId: user.id,
      email: user.email ?? null,
      ip,
      message: `User status set to ${b.status}`,
      meta: { targetId },
    });
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", targetId)
    .select("*")
    .maybeSingle();

  if (error || !updated) {
    return NextResponse.json({ error: "Update failed." }, { status: 400 });
  }

  const u = updated as Record<string, unknown>;
  const disabled = Boolean(u.disabled);
  const email = (u.email as string) ?? "";
  const fullName = (u.full_name as string | null | undefined)?.trim();

  return NextResponse.json({
    user: {
      id: u.id as string,
      email,
      name: fullName || email.split("@")[0] || "User",
      plan: u.plan === "pro" ? "pro" : "free",
      role: u.role as UserRole,
      status: (disabled ? "disabled" : "active") as UserStatus,
      lastLoginAt: (u.last_sign_in_at as string | null) ?? null,
      scanCount: 0,
      createdAt: u.created_at as string,
    },
  });
}

import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server-auth";
import { createServerSupabase } from "@/lib/supabase/server";
import type { UserRole, UserStatus } from "@/lib/auth/user-role";

type PublicRow = {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  scanCount: number;
  createdAt: string;
};

function mapProfile(p: Record<string, unknown>): PublicRow {
  const disabled = Boolean(p.disabled);
  const email = (p.email as string) ?? "";
  const fullName = (p.full_name as string | null | undefined)?.trim();
  return {
    id: p.id as string,
    email,
    name: fullName || email.split("@")[0] || "User",
    plan: (p.plan as string) === "pro" ? "pro" : "free",
    role: (p.role === "admin" || p.role === "editor" || p.role === "viewer" ? p.role : "viewer") as UserRole,
    status: disabled ? "disabled" : "active",
    lastLoginAt: (p.last_sign_in_at as string | null) ?? null,
    scanCount: 0,
    createdAt: (p.created_at as string) ?? "",
  };
}

export async function GET() {
  const { user, profile } = await getServerAuth();
  if (!user || !profile || profile.disabled || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: "Unable to load users." }, { status: 500 });
  }

  const users: PublicRow[] = (data ?? []).map((row) => mapProfile(row as Record<string, unknown>));
  return NextResponse.json({ users });
}

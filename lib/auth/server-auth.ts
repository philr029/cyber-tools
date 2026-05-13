import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/auth/user-role";

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  plan: "free" | "pro";
  disabled: boolean;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
};

function parseRole(value: string | null | undefined): UserRole {
  if (value === "admin" || value === "editor" || value === "viewer") return value;
  return "viewer";
}

function parsePlan(value: string | null | undefined): "free" | "pro" {
  return value === "pro" ? "pro" : "free";
}

export async function getServerAuth(): Promise<{
  user: User | null;
  profile: ProfileRow | null;
}> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, profile: null };
  }

  const { data: row, error: pErr } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (pErr || !row) {
    return { user, profile: null };
  }

  const profile: ProfileRow = {
    id: row.id as string,
    email: (row.email as string) ?? null,
    full_name: (row.full_name as string) ?? null,
    role: parseRole(row.role as string),
    plan: parsePlan(row.plan as string),
    disabled: Boolean(row.disabled),
    last_sign_in_at: (row.last_sign_in_at as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };

  return { user, profile };
}

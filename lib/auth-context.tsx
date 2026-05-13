"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/auth/user-role";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro";
  role: UserRole;
  lastSignInAt: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Supabase access token expiry (unix seconds), if session exists. */
  sessionExpiresAt: number | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  sessionExpiresAt: null,
  refresh: async () => {},
  logout: async () => {},
});

function parseRole(value: string | null | undefined): UserRole {
  if (value === "admin" || value === "editor" || value === "viewer") return value;
  return "viewer";
}

function parsePlan(value: string | null | undefined): "free" | "pro" {
  return value === "pro" ? "pro" : "free";
}

function mapProfileToAuthUser(authUser: User, row: Record<string, unknown> | null): AuthUser {
  const email = authUser.email ?? "";
  const meta = authUser.user_metadata as Record<string, unknown> | undefined;
  const metaName = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  const fullName = (row?.full_name as string | undefined)?.trim() || metaName;
  return {
    id: authUser.id,
    email,
    name: fullName || email.split("@")[0] || "User",
    plan: parsePlan(row?.plan as string | undefined),
    role: parseRole(row?.role as string | undefined),
    lastSignInAt: (row?.last_sign_in_at as string | null | undefined) ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  const supabase = useMemo(() => {
    try {
      return createBrowserSupabase();
    } catch {
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setSessionExpiresAt(null);
      setLoading(false);
      return;
    }

    const {
      data: { user: authUser },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !authUser) {
      setUser(null);
      setSessionExpiresAt(null);
      setLoading(false);
      return;
    }

    const { data: row } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();

    if (row && Boolean((row as { disabled?: boolean }).disabled)) {
      await supabase.auth.signOut();
      setUser(null);
      setSessionExpiresAt(null);
      setLoading(false);
      return;
    }

    setUser(mapProfileToAuthUser(authUser, row));
    const { data: sessionData } = await supabase.auth.getSession();
    const exp = sessionData.session?.expires_at ?? null;
    setSessionExpiresAt(typeof exp === "number" ? exp : null);
    setLoading(false);
  }, [supabase]);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSessionExpiresAt(null);
  }, [supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, sessionExpiresAt, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

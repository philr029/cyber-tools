"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { withBasePath } from "@/lib/base-path";

function formatSessionExpiry(expiresAt: number | null): string {
  if (!expiresAt) return "Unknown";
  const ms = expiresAt * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const diff = ms - Date.now();
  if (diff <= 0) return "Expired — refresh by navigating or signing in again";
  const mins = Math.round(diff / 60_000);
  if (mins < 120) return `Active · refreshes in ~${mins} min (${d.toLocaleString()})`;
  return `Active · session ends ${d.toLocaleString()}`;
}

export default function SecuritySettingsPage() {
  const { user, loading, sessionExpiresAt, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const sessionLabel = useMemo(() => formatSessionExpiry(sessionExpiresAt), [sessionExpiresAt]);

  async function handleLogout() {
    await logout();
    toast("Signed out.", "info");
    router.refresh();
    router.push(withBasePath("/"));
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" aria-label="Loading" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex-1 max-w-xl mx-auto px-4 py-12 sm:py-16">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-cyan-400/90 mb-1">Account</p>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Security</h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Session tokens live in HttpOnly cookies via Supabase — passwords are never stored in{" "}
          <code className="text-slate-500">localStorage</code>.
        </p>
      </div>

      <div className="rounded-2xl border border-[#1e2d4a] bg-[#0c1222]/90 p-6 sm:p-7 space-y-6 shadow-xl shadow-black/20">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-200">Signed-in user</h2>
          <p className="text-sm text-slate-300">{user.email}</p>
          <p className="text-xs text-slate-500 font-mono break-all">ID: {user.id}</p>
        </section>

        <section className="space-y-2 pt-2 border-t border-[#1e2d4a]">
          <h2 className="text-sm font-semibold text-slate-200">Role</h2>
          <p className="text-sm text-slate-300 capitalize">{user.role}</p>
          <p className="text-xs text-slate-500">Enforced in middleware and via Row Level Security on `profiles`.</p>
        </section>

        <section className="space-y-2 pt-2 border-t border-[#1e2d4a]">
          <h2 className="text-sm font-semibold text-slate-200">Session status</h2>
          <p className="text-sm text-slate-300">{sessionLabel}</p>
          <p className="text-xs text-slate-500">Supabase refreshes tokens automatically when the tab is active.</p>
        </section>

        <section className="space-y-2 pt-2 border-t border-[#1e2d4a]">
          <h2 className="text-sm font-semibold text-slate-200">Last sign-in</h2>
          <p className="text-sm text-slate-300">
            {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "Not recorded yet — placeholder until sync from Auth"}
          </p>
          <p className="text-xs text-slate-500">
            Optional: add a trigger on <code className="text-slate-500">auth.users</code> to copy{" "}
            <code className="text-slate-500">last_sign_in_at</code> into <code className="text-slate-500">profiles</code> (see{" "}
            <code className="text-slate-500">supabase/migrations</code>).
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-[#1e2d4a]">
          <h2 className="text-sm font-semibold text-slate-200">Multi-factor authentication (MFA)</h2>
          <p className="text-sm text-amber-200/80 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
            Placeholder — enable TOTP or WebAuthn in the Supabase Dashboard (Authentication → Providers) and surface enrollment UI here.
          </p>
        </section>

        <section className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#1e2d4a]">
          <Link
            href={withBasePath("/forgot-password")}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#1e2d4a] bg-[#131929] px-4 text-sm font-medium text-slate-200 hover:border-cyan-500/40 transition-colors text-center"
          >
            Send password reset email
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-red-600/90 hover:bg-red-600 px-4 text-sm font-medium text-white transition-colors"
          >
            Sign out
          </button>
        </section>

        <p className="text-xs text-slate-500">
          <Link href={withBasePath("/account")} className="text-cyan-400 hover:text-cyan-300 font-medium">
            ← Back to profile
          </Link>
        </p>
      </div>
    </main>
  );
}

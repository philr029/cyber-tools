"use client";

import { useState, type FormEvent, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sanitizePasswordInput } from "@/lib/input-sanitization";
import { withBasePath } from "@/lib/base-path";
import { createBrowserSupabase } from "@/lib/supabase/client";

function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setSessionReady(true);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const p1 = sanitizePasswordInput(password);
    const p2 = sanitizePasswordInput(confirm);
    if (p1.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (p1 !== p2) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { error: updErr } = await supabase.auth.updateUser({ password: p1 });
      if (updErr) {
        setError(updErr.message || "Reset failed.");
        return;
      }
      await supabase.auth.signOut();
      router.push(withBasePath("/login?reset=ok"));
    } catch {
      setError("Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  if (!sessionReady) {
    return <div className="h-32 animate-pulse rounded-xl bg-[#131929]/80" aria-hidden />;
  }

  if (!hasSession) {
    return (
      <p className="text-sm text-amber-200/90">
        No active recovery session. Open the link from your email (it redirects through{" "}
        <code className="text-slate-400">/auth/callback</code>) or request a new reset from{" "}
        <Link href={withBasePath("/forgot-password")} className="text-cyan-400 underline">
          forgot password
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <div role="alert" className="rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      <div>
        <label htmlFor="np" className="block text-xs font-medium text-slate-400 mb-1.5">
          New password
        </label>
        <input
          id="np"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        />
      </div>
      <div>
        <label htmlFor="npc" className="block text-xs font-medium text-slate-400 mb-1.5">
          Confirm password
        </label>
        <input
          id="npc"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[44px] rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium"
      >
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Choose a new password</h1>
          <p className="text-sm text-slate-400 mt-2">
            Recovery links expire quickly. After updating, sign in again with your new password.
          </p>
        </div>
        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0c1222]/90 p-6 sm:p-7">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-[#131929]/80" />}>
            <ResetForm />
          </Suspense>
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href={withBasePath("/login")} className="text-cyan-400 hover:text-cyan-300 font-medium">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

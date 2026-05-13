"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  sanitizePasswordInput,
  sanitizeSingleLineInput,
} from "@/lib/input-sanitization";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { safeAppRedirectPath, withBasePath } from "@/lib/base-path";
import { createBrowserSupabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const safeEmail = sanitizeSingleLineInput(email);
    const safePassword = sanitizePasswordInput(password);

    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: safeEmail,
        password: safePassword,
      });
      if (signErr) {
        const msg = signErr.message || "Sign-in failed.";
        setError(msg);
        toast(msg, "error");
      } else {
        await refresh();
        toast("Welcome back.", "success");
        const redirect = safeAppRedirectPath(params.get("redirect"), "/dashboard");
        router.refresh();
        router.push(withBasePath(redirect));
      }
    } catch {
      const msg = "Unable to connect. Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/35 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-colors"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label htmlFor="password" className="block text-xs font-medium text-slate-400">
            Password
          </label>
          <Link
            href={withBasePath("/forgot-password")}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

function LoginBanners() {
  const params = useSearchParams();
  const reason = params.get("reason");
  const err = params.get("error");
  const reset = params.get("reset");

  if (reason === "disabled") {
    return (
      <div
        role="status"
        className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-100"
      >
        This account has been disabled. Contact an administrator if you need access restored.
      </div>
    );
  }
  if (err === "auth") {
    return (
      <div role="alert" className="mb-6 rounded-xl border border-red-500/35 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200">
        Email link sign-in failed or expired. Request a fresh link or sign in with your password.
      </div>
    );
  }
  if (reset === "ok") {
    return (
      <div className="mb-6 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-100">
        Password updated. You can sign in with your new password.
      </div>
    );
  }
  return null;
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Sign in to SecureScope</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Authentication is handled by <strong className="text-slate-300">Supabase Auth</strong> — sessions use
            HttpOnly cookies; nothing auth-critical is stored in <code className="text-slate-500">localStorage</code>.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginBanners />
        </Suspense>

        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0c1222]/90 p-6 sm:p-7 shadow-xl shadow-black/20">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-[#131929]/80" aria-hidden />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href={withBasePath("/signup")} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}

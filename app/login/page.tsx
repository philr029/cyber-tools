"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Login failed.", "error");
      } else {
        await refresh();
        toast(`Welcome back, ${data.user.name}!`, "success");
        const redirect = params.get("redirect") ?? "/dashboard";
        router.push(redirect);
      }
    } catch {
      toast("Unable to connect. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
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

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Sign in to SecureScope</h1>
          <p className="text-sm text-slate-400 mt-1">Cyber intelligence for modern security teams</p>
        </div>

        {/* Demo credentials notice */}
        <div className="mb-6 px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300">
          <p className="font-medium mb-1">Demo credentials</p>
          <p>Email: <span className="text-cyan-200 font-mono">demo@securescope.io</span></p>
          <p>Password: <span className="text-cyan-200 font-mono">demo1234</span></p>
        </div>

        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}

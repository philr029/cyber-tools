"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";
import { withBasePath } from "@/lib/base-path";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { buildSupabaseEmailRedirectUrl } from "@/lib/auth/build-email-redirect-url";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const safe = sanitizeSingleLineInput(email);
      const redirectTo = buildSupabaseEmailRedirectUrl("/reset-password");
      if (!redirectTo) {
        setError("Supabase environment is not configured in the browser.");
        setLoading(false);
        return;
      }
      const supabase = createBrowserSupabase();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(safe, { redirectTo });
      if (resetErr) {
        setError(resetErr.message || "Request failed.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Unable to reach Supabase. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Reset your password</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Enter the email on your account. If it exists, Supabase sends a recovery link to the same address (configure
            SMTP in the Supabase Dashboard for production deliverability).
          </p>
        </div>

        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0c1222]/90 p-6 sm:p-7">
          {done ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-300">
                If an account exists for that address, you will receive an email with a secure link. After opening it,
                choose a new password on the reset page.
              </p>
              <Link
                href={withBasePath("/login")}
                className="inline-flex min-h-[44px] items-center justify-center w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error ? (
                <div role="alert" className="rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
              <div>
                <label htmlFor="fp-email" className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
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

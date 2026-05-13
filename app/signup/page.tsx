"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  sanitizePasswordInput,
  sanitizeSingleLineInput,
} from "@/lib/input-sanitization";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { withBasePath } from "@/lib/base-path";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { buildSupabaseEmailRedirectUrl } from "@/lib/auth/build-email-redirect-url";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const safeName = sanitizeSingleLineInput(name, { maxLength: 120 });
    const safeEmail = sanitizeSingleLineInput(email);
    const safePassword = sanitizePasswordInput(password);

    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const redirectTo = buildSupabaseEmailRedirectUrl("/dashboard");
      if (!redirectTo) {
        toast("Missing site URL for email confirmation. Set NEXT_PUBLIC_* Supabase env vars.", "error");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: safeEmail,
        password: safePassword,
        options: {
          emailRedirectTo: redirectTo,
          data: { full_name: safeName },
        },
      });
      if (error) {
        toast(error.message || "Signup failed.", "error");
        return;
      }
      if (data.session) {
        await refresh();
        toast("Account created! Welcome to SecureScope.", "success");
        router.refresh();
        router.push(withBasePath("/dashboard"));
      } else {
        setAwaitingEmail(true);
        toast("Check your email to confirm your account.", "success");
      }
    } catch {
      toast("Unable to connect. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (awaitingEmail) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-100">Confirm your email</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            We sent a link to <span className="text-slate-200 font-medium">{email}</span>. After confirming, you&apos;ll
            be signed in on this device.
          </p>
          <Link href={withBasePath("/login")} className="inline-block text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Create your account</h1>
          <p className="text-sm text-slate-400 mt-1">Free plan · No card needed</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
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
                Creating account…
              </>
            ) : (
              "Create free account"
            )}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed px-1">
          New accounts receive the <strong className="text-slate-400">viewer</strong> role by default. An administrator
          can promote you to <strong className="text-slate-400">editor</strong> or <strong className="text-slate-400">admin</strong> in the admin dashboard.
        </p>

        <p className="text-center text-xs text-slate-600 mt-4">
          By signing up you agree to our <span className="text-slate-500">Terms of Service</span>
          {" & "}
          <span className="text-slate-500">Privacy Policy</span>.
        </p>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href={withBasePath("/login")} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

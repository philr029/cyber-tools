"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";
import { withBasePath } from "@/lib/base-path";

export default function AccountPage() {
  const { user, loading, refresh } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.name) return;
    queueMicrotask(() => setFullName(user.name));
  }, [user?.name]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const safe = sanitizeSingleLineInput(fullName, { maxLength: 120 });
    setSaving(true);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: safe, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) {
        toast(error.message || "Could not save profile.", "error");
        return;
      }
      await refresh();
      toast("Profile updated.", "success");
    } catch {
      toast("Could not save profile.", "error");
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Profile</h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Display name is stored in your Supabase <code className="text-slate-500">profiles</code> row (RLS: you can
          update your own name; role changes are admin-only).
        </p>
      </div>

      <div className="rounded-2xl border border-[#1e2d4a] bg-[#0c1222]/90 p-6 sm:p-7 shadow-xl shadow-black/20 space-y-6">
        <div>
          <label htmlFor="acct-email" className="block text-xs font-medium text-slate-400 mb-1.5">
            Email
          </label>
          <input
            id="acct-email"
            type="email"
            readOnly
            value={user.email}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#131929]/60 border border-[#1e2d4a] text-slate-400 text-sm cursor-not-allowed"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">Managed by Supabase Auth — change via your identity provider or support.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="acct-name" className="block text-xs font-medium text-slate-400 mb-1.5">
              Display name
            </label>
            <input
              id="acct-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <Link
              href={withBasePath("/account/security")}
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Security settings →
            </Link>
          </div>
        </form>

        <div className="pt-4 border-t border-[#1e2d4a] text-xs text-slate-500 space-y-1">
          <p>
            <span className="text-slate-400">Plan:</span> {user.plan}
          </p>
          <p>
            <span className="text-slate-400">Role:</span> {user.role}
          </p>
        </div>
      </div>
    </main>
  );
}

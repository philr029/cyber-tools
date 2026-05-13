import type { Metadata } from "next";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Privacy Policy – SecureScope",
  description: "Privacy policy for SecureScope.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mt-3 leading-relaxed">
        Replace this page with your organisation&apos;s privacy policy (controller identity, lawful bases, retention,
        subprocessors, international transfers, and data subject rights). Cookie-specific information is summarised on
        the{" "}
        <Link href={withBasePath("/cookies")} className="text-cyan-400 hover:text-cyan-300 font-medium">
          Cookie Policy
        </Link>{" "}
        page, including the Cookiebot declaration when configured.
      </p>
      <ul className="mt-8 list-disc pl-5 text-sm text-slate-300 space-y-2">
        <li>Authentication is processed by Supabase (see README).</li>
        <li>Optional analytics (e.g. GA4) loads only after statistics consent via Cookiebot.</li>
        <li>Use “Cookie Settings” in the site footer to change consent at any time.</li>
      </ul>
      <p className="text-sm text-slate-500 mt-10">
        <Link href={withBasePath("/")} className="text-cyan-400 hover:text-cyan-300 font-medium">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}

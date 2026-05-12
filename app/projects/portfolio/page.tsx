import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfolio – SecureScope",
  description: "Selected delivery notes and how SecureScope tooling supported each programme.",
};

export default function PortfolioPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Link href="/projects" className="text-sm font-semibold text-[var(--ss-accent)] hover:underline">
          ← Projects
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--ss-text)]">Portfolio</h1>
        <p className="mt-4 text-[var(--ss-text-secondary)] leading-relaxed">
          SecureScope bundles the same utilities used across marketing launches, tenant hardening reviews, and automation
          health checks. For public code samples and contributions, visit the maintainer GitHub profile linked from the
          home footer.
        </p>
        <div className="mt-8 rounded-3xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_90%,transparent)] p-6">
          <p className="text-sm text-[var(--ss-text-secondary)]">
            API integration ready — add keys in environment variables on Vercel, then call the existing `/api` routes from
            the live tools. Never expose provider secrets to the browser bundle.
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkle } from "@phosphor-icons/react";
import { getSuiteComingSoonEntry } from "@/lib/tools/suite-coming-soon";

export default function ToolsComingSoonClient() {
  const searchParams = useSearchParams();
  const k = searchParams.get("k");
  const entry = getSuiteComingSoonEntry(k);

  const title = entry?.title ?? "Toolkit module";
  const description =
    entry?.description ??
    "We are building this experience with the same care as the rest of SecureScope. Explore the live modules below.";

  return (
    <main className="flex-1 bg-[var(--ss-page)]">
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <div className="ss-card rounded-[1.75rem] p-8 text-center shadow-[0_20px_64px_rgba(0,0,0,0.28)] sm:p-10">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ss-accent-soft)] text-[var(--ss-accent)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_28%,transparent)]"
            aria-hidden
          >
            <Sparkle className="h-7 w-7" weight="duotone" />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ss-text-secondary)]">Coming soon</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-3xl">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ss-text-secondary)]">{description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/tools/browse"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_color-mix(in_srgb,var(--ss-accent)_28%,transparent)] motion-safe:transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-page)]"
            >
              Browse toolkit
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] px-5 py-2.5 text-sm font-medium text-[var(--ss-text)] motion-safe:transition-colors hover:bg-[color-mix(in_srgb,var(--ss-text)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-page)]"
            >
              Security suite
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

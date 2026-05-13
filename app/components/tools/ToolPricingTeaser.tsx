"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export default function ToolPricingTeaser() {
  return (
    <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--ss-accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--ss-accent-soft)_45%,transparent)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 motion-safe:transition-[border-color,box-shadow] motion-safe:duration-300 motion-safe:hover:shadow-[0_12px_40px_color-mix(in_srgb,var(--ss-accent)_12%,transparent)]">
      <p className="text-sm text-[var(--ss-text-secondary)]">
        <span className="font-semibold text-[var(--ss-text)]">🚀 Pro tools</span> — unlimited scans and team features are on the roadmap. Preview plans anytime.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={withBasePath("/pricing")}
          className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white motion-safe:transition-transform motion-safe:hover:-translate-y-px"
        >
          View pricing
        </Link>
        <Link
          href={withBasePath("/tools/browse")}
          className="ss-pill ss-pill-ghost px-3 py-1.5 text-xs font-semibold motion-safe:transition-transform motion-safe:hover:-translate-y-px"
        >
          Browse toolkit
        </Link>
      </div>
    </div>
  );
}

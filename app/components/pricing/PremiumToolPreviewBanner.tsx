"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

/**
 * Non-blocking “Pro preview” ribbon — informational only until real entitlements exist.
 */
export default function PremiumToolPreviewBanner({ toolLabel }: { toolLabel: string }) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/30" aria-hidden>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--ss-text)]">Pro preview · {toolLabel}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--ss-text-secondary)]">
            This ribbon is a UI placeholder for future Pro/Business entitlements. The tool below still runs in demo mode — no payment
            or API secrets are required to explore it.
          </p>
        </div>
      </div>
      <Link
        href={withBasePath("/pricing")}
        className="ss-pill ss-pill-primary inline-flex shrink-0 items-center justify-center px-4 py-2 text-xs font-semibold text-white"
      >
        View plans
      </Link>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import MockDataBanner from "@/app/components/ui/MockDataBanner";
import LiveActivityConsole from "@/app/components/tools/LiveActivityConsole";
import SecuritySignals from "@/app/components/tools/SecuritySignals";
import ToolPricingTeaser from "@/app/components/tools/ToolPricingTeaser";
import type { ActivityEntry } from "@/lib/use-activity-console";

interface ToolPageLayoutProps {
  title: string;
  description: string;
  isMock?: boolean | null;
  children: ReactNode;
  activityEntries?: ActivityEntry[];
}

const BackIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

export default function ToolPageLayout({
  title,
  description,
  isMock,
  children,
  activityEntries,
}: ToolPageLayoutProps) {
  return (
    <main className="flex-1 bg-[var(--ss-page)]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-[28px] border border-[var(--ss-border)] bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--ss-accent)_10%,transparent),transparent_44%),color-mix(in_srgb,var(--ss-page-2)_100%,transparent)] p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-[var(--ss-text-secondary)]">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--ss-accent)]"
            >
              {BackIcon}
              Suite
            </Link>
            <span className="text-[color-mix(in_srgb,var(--ss-text-secondary)_45%,transparent)]">/</span>
            <span className="font-medium text-[var(--ss-text)]">{title}</span>
          </div>

          <div className="mb-8 rounded-[24px] border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_88%,transparent)] p-6 sm:p-8 shadow-[0_14px_48px_rgba(0,0,0,0.26)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ss-text-secondary)]">Security-first module</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-4xl">{title}</h1>
                <p className="mt-3 text-sm leading-7 text-[var(--ss-text-secondary)]">{description}</p>
              </div>
              <div className="flex flex-col items-start gap-3">
                <SecuritySignals />
                {isMock !== null && isMock !== undefined && (
                  <div className="flex-shrink-0">
                    <MockDataBanner isMock={isMock} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <ToolPricingTeaser />

          {children}
          {activityEntries ? <LiveActivityConsole entries={activityEntries} /> : null}
        </div>
      </div>
    </main>
  );
}

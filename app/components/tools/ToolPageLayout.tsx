"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import MockDataBanner from "@/app/components/ui/MockDataBanner";
import LiveActivityConsole from "@/app/components/tools/LiveActivityConsole";
import SecuritySignals from "@/app/components/tools/SecuritySignals";
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
    <main className="flex-1 bg-[#050505]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_42%),#050505] p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-white/45">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-cyan-200"
            >
              {BackIcon}
              Suite
            </Link>
            <span>/</span>
            <span className="font-medium text-white/70">{title}</span>
          </div>

          <div className="mb-8 rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Security-First Module</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
                <p className="mt-3 text-sm leading-7 text-white/62">{description}</p>
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

          {children}
          {activityEntries ? <LiveActivityConsole entries={activityEntries} /> : null}
        </div>
      </div>
    </main>
  );
}

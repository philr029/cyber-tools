"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

export interface ToolkitPlaceholderProps {
  title: string;
  description: string;
  /** Short label for chips (e.g. “Web QA”). */
  category: string;
  bullets: string[];
  /** Optional primary deep-link into an existing live module. */
  primaryAction?: { href: string; label: string };
  related?: Array<{ href: string; label: string }>;
  children?: ReactNode;
}

export default function ToolkitPlaceholder({
  title,
  description,
  category,
  bullets,
  primaryAction,
  related,
  children,
}: ToolkitPlaceholderProps) {
  return (
    <ToolPageLayout title={title} description={description}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200">
            {category}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/55">
            Portfolio module
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-white/85 mb-3">What you can do here</p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/65">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        {children}

        <div className="flex flex-wrap gap-3">
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.25)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5"
            >
              {primaryAction.label}
            </Link>
          ) : null}
          <Link
            href="/tools"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 motion-safe:transition-colors hover:bg-white/10"
          >
            Browse all tools
          </Link>
        </div>

        {related && related.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-3">Related</p>
            <ul className="flex flex-col gap-2">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="text-sm text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </ToolPageLayout>
  );
}

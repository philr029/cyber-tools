"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export type ToolCategoryCardProps = {
  href: string;
  title: string;
  description: string;
  meta: string;
  accent: string;
  emoji?: string;
};

export default function ToolCategoryCard({ href, title, description, meta, accent, emoji }: ToolCategoryCardProps) {
  return (
    <Link
      href={withBasePath(href)}
      className="group ss-card card-lift relative overflow-hidden p-5 sm:p-6 motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1"
    >
      <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${accent} opacity-55 blur-2xl pointer-events-none`} aria-hidden />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight text-[var(--ss-text)]">
            {emoji ? (
              <span className="mr-1.5" aria-hidden>
                {emoji}
              </span>
            ) : null}
            {title}
          </h3>
          {meta ? (
            <span className="rounded-full border border-[var(--ss-border)] bg-[var(--ss-accent-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-accent)] shrink-0">
              {meta}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ss-text-secondary)]">{description}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ss-accent)] transition-colors group-hover:underline">
          Open hub
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

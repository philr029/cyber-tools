"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export interface CategoryToolCard {
  href: string;
  title: string;
  description: string;
  badge?: string;
  /** Short note that explains the IT/security value. */
  why?: string;
  /** Optional skill demonstrated by the tool. */
  skill?: string;
  /** Optional emoji or icon. */
  icon?: ReactNode;
  external?: boolean;
  status?: "live" | "demo" | "planned" | "beta";
  tags?: string[];
}

export interface CategoryIndexProps {
  eyebrow: string;
  title: string;
  intro: string;
  tools: CategoryToolCard[];
  /** Optional callout below the title. */
  callout?: ReactNode;
}

const ArrowIcon = (
  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
      clipRule="evenodd"
    />
  </svg>
);

const BackIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

export default function CategoryIndex({ eyebrow, title, intro, tools, callout }: CategoryIndexProps) {
  return (
    <main className="flex-1 bg-[var(--ss-page)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-[var(--ss-text-secondary)]">
          <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--ss-accent)]">
            {BackIcon}
            Home
          </Link>
          <span className="text-[color-mix(in_srgb,var(--ss-text-secondary)_45%,transparent)]">/</span>
          <Link href="/tools/browse" className="transition-colors hover:text-[var(--ss-accent)]">
            Toolkit index
          </Link>
          <span className="text-[color-mix(in_srgb,var(--ss-text-secondary)_45%,transparent)]">/</span>
          <span className="font-medium text-[var(--ss-text)]">{title}</span>
        </div>

        <header className="mb-12 rounded-[28px] border border-[var(--ss-border)] bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--ss-accent)_12%,transparent),transparent_42%),color-mix(in_srgb,var(--ss-elevated-solid)_55%,transparent)] p-8 sm:p-9 backdrop-blur-xl shadow-[0_20px_64px_rgba(0,0,0,0.28)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ss-accent)]">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ss-text-secondary)] sm:text-base">{intro}</p>
          {callout && <div className="mt-6">{callout}</div>}
        </header>

        <section aria-label={`${title} tools`} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const card = (
              <article className="group flex h-full flex-col rounded-[1.375rem] border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_82%,transparent)] p-5 sm:p-6 motion-safe:transition-[transform,border-color,background-color,box-shadow] motion-safe:duration-200 hover:border-[color-mix(in_srgb,var(--ss-accent)_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--ss-accent-soft)_35%,transparent)] motion-safe:hover:-translate-y-0.5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {tool.icon && (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-gradient-to-br from-[color-mix(in_srgb,var(--ss-accent)_28%,transparent)] to-[color-mix(in_srgb,var(--accent-blue)_22%,transparent)] text-[var(--ss-text)]">
                        {tool.icon}
                      </span>
                    )}
                    <h2 className="text-base font-semibold text-[var(--ss-text)]">{tool.title}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 justify-end">
                    {tool.status && tool.status !== "live" ? (
                      <span className="rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ss-text-secondary)]">
                        {tool.status}
                      </span>
                    ) : null}
                    {tool.badge && (
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--ss-accent)_28%,transparent)] bg-[var(--ss-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ss-accent)]">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--ss-text-secondary)]">{tool.description}</p>
                {tool.tags && tool.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tool.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] rounded-md bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] text-[var(--ss-text-secondary)] px-1.5 py-0.5 ring-1 ring-[var(--ss-border)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {(tool.why || tool.skill) && (
                  <div className="mt-3 space-y-1.5 text-[11px] text-[var(--ss-text-secondary)]">
                    {tool.why && (
                      <p>
                        <span className="font-semibold text-[var(--ss-text)]">Why it matters:</span> {tool.why}
                      </p>
                    )}
                    {tool.skill && (
                      <p>
                        <span className="font-semibold text-[var(--ss-text)]">Skill:</span> {tool.skill}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ss-accent)] transition-colors group-hover:text-[color-mix(in_srgb,var(--ss-accent)_88%,#fff)]">
                    Open tool {ArrowIcon}
                  </span>
                </div>
              </article>
            );
            if (tool.external) {
              return (
                <a key={tool.href} href={tool.href} target="_blank" rel="noopener noreferrer">
                  {card}
                </a>
              );
            }
            return (
              <Link key={tool.href} href={tool.href}>
                {card}
              </Link>
            );
          })}
        </section>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Link
            href="/tools/browse"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] px-4 py-2.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:border-[color-mix(in_srgb,var(--ss-accent)_30%,transparent)] motion-safe:transition-colors"
          >
            {BackIcon} Toolkit index
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] px-4 py-2.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:border-[color-mix(in_srgb,var(--ss-accent)_30%,transparent)] motion-safe:transition-colors"
          >
            Security lookup suite
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] px-4 py-2.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:border-[color-mix(in_srgb,var(--ss-accent)_30%,transparent)] motion-safe:transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

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
    <main className="flex-1 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-white/45">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-200"
          >
            {BackIcon}
            Home
          </Link>
          <span>/</span>
          <Link
            href="/tools"
            className="transition-colors hover:text-cyan-200"
          >
            All tools
          </Link>
          <span>/</span>
          <span className="font-medium text-white/70">{title}</span>
        </div>

        <header className="mb-10 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_40%),rgba(255,255,255,0.03)] p-8 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/90">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{intro}</p>
          {callout && <div className="mt-5">{callout}</div>}
        </header>

        <section aria-label={`${title} tools`} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const card = (
              <article className="group flex h-full flex-col rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 transition-all duration-200 hover:border-cyan-400/30 hover:bg-[rgba(34,211,238,0.05)] hover:-translate-y-0.5 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {tool.icon && (
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/20 text-white">
                        {tool.icon}
                      </span>
                    )}
                    <h2 className="text-base font-semibold text-white">{tool.title}</h2>
                  </div>
                  {tool.badge && (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">{tool.description}</p>
                {(tool.why || tool.skill) && (
                  <div className="mt-3 space-y-1.5 text-[11px] text-white/55">
                    {tool.why && (
                      <p>
                        <span className="font-semibold text-white/65">Why it matters:</span> {tool.why}
                      </p>
                    )}
                    {tool.skill && (
                      <p>
                        <span className="font-semibold text-white/65">Skill:</span> {tool.skill}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 transition-colors group-hover:text-cyan-100">
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

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 hover:text-white hover:border-white/30 transition-colors"
          >
            {BackIcon} Back to all tools
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 hover:text-white hover:border-white/30 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

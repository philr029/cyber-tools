"use client";

import Link from "next/link";
import { useCallback } from "react";
import { withBasePath } from "@/lib/base-path";
import { uniqueSiteTools } from "@/lib/tools/site-catalog";

const ctaClass =
  "ss-pill btn-micro inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-center motion-safe:transition-transform motion-safe:duration-200";

const ghost = `${ctaClass} ss-pill-ghost`;
const primary = `${ctaClass} ss-pill-primary shadow-lg shadow-cyan-500/10`;

export default function PremiumHero({
  onScrollToSearch,
  onTryDemoLookup,
}: {
  onScrollToSearch?: () => void;
  onTryDemoLookup?: () => void;
}) {
  const toolCount = uniqueSiteTools().length;
  const scrollSearch = useCallback(() => {
    onScrollToSearch?.();
    document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" });
  }, [onScrollToSearch]);

  return (
    <section className="relative hero-gradient hero-gradient-animated grid-bg overflow-hidden">
      <div className="absolute inset-0 ss-ambient-glow pointer-events-none motion-safe:opacity-100" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[color-mix(in_srgb,var(--ss-page)_88%,transparent)]"
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)] bg-[var(--ss-accent-soft)] text-xs font-semibold text-[var(--ss-accent)] animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ss-accent)] motion-safe:animate-pulse" />
              SecureScope platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-semibold text-[var(--ss-text)] leading-[1.08] tracking-tight mb-4 animate-fade-in-delay text-glow">
              Your all-in-one IT, marketing, cyber and automation command centre.
            </h1>

            <p className="text-base sm:text-lg text-[var(--ss-text-secondary)] max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-in-delay">
              Manage checks, tools, reports, workflows, daily tasks, website tests, phone tests, security logs and business
              automation from one clean dashboard.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5 mb-6 animate-fade-in-delay-2">
              <Link href={withBasePath("/tools/browse")} className={primary}>
                <span className="mr-1.5" aria-hidden>
                  🔍
                </span>
                Explore tools
              </Link>
              <Link href={withBasePath("/pricing")} className={ghost}>
                <span className="mr-1.5" aria-hidden>
                  💎
                </span>
                View pricing
              </Link>
              <Link href={withBasePath("/blog")} className={ghost}>
                <span className="mr-1.5" aria-hidden>
                  📰
                </span>
                Read blog
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2 mb-4 animate-fade-in-delay-2">
              <Link href={withBasePath("/domain-ip-tools")} className={ghost}>
                🌐 IT toolkit
              </Link>
              <Link href={withBasePath("/marketing-tools")} className={ghost}>
                ✉️ Marketing
              </Link>
              <Link href={withBasePath("/cyber-tools")} className={ghost}>
                🛡️ Security
              </Link>
              <Link href={withBasePath("/web-tools")} className={ghost}>
                🧪 Web QA
              </Link>
              <Link href={withBasePath("/forms")} className={ghost}>
                Contact / access
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 text-sm animate-fade-in-delay-2">
              <button
                type="button"
                onClick={scrollSearch}
                className="inline-flex items-center gap-2 font-semibold text-[var(--ss-accent)] hover:opacity-90 motion-safe:transition-opacity"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
                Jump to threat lookup
              </button>
              <span className="hidden sm:inline text-[var(--ss-text-secondary)]">·</span>
              <Link href={withBasePath("/docs")} className="text-[var(--ss-text-secondary)] font-medium hover:text-[var(--ss-text)] motion-safe:transition-colors">
                Read the docs →
              </Link>
              <span className="hidden sm:inline text-[var(--ss-text-secondary)]">·</span>
              <button
                type="button"
                onClick={() => onTryDemoLookup?.()}
                className="inline-flex items-center gap-2 font-medium text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] motion-safe:transition-colors"
              >
                Try a live demo lookup
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              {["SOC2-ready patterns (roadmap)", "Server-side API keys", "Supabase sessions", "Cookiebot CMP"].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-1 text-[11px] font-medium text-[var(--ss-text-secondary)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Product mockup */}
          <div className="animate-fade-in-delay-3 max-w-md mx-auto w-full lg:max-w-none">
            <div className="relative rounded-[1.35rem] border border-[var(--ss-border-strong)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_82%,transparent)] p-1 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="rounded-[1.15rem] bg-[color-mix(in_srgb,var(--ss-page)_40%,transparent)] border border-[var(--ss-border)] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[10px] font-mono text-[var(--ss-text-secondary)]">securescope.app / overview</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--ss-text)]">Live workspace</p>
                    <span className="text-[10px] rounded-full bg-[var(--ss-accent-soft)] px-2 py-0.5 font-semibold text-[var(--ss-accent)]">
                      Demo UI
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-3">
                      <p className="text-[10px] text-[var(--ss-text-secondary)]">Catalogued tools</p>
                      <p className="text-xl font-semibold text-[var(--ss-text)]">{toolCount}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-3">
                      <p className="text-[10px] text-[var(--ss-text-secondary)]">This week</p>
                      <p className="text-xl font-semibold text-[var(--ss-accent)]">—</p>
                      <p className="text-[9px] text-[var(--ss-text-secondary)] mt-0.5">API stats: coming soon</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--ss-text)_8%,transparent)] overflow-hidden">
                    <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] motion-safe:animate-progress-fill" />
                  </div>
                  <p className="text-[11px] text-[var(--ss-text-secondary)] leading-relaxed">
                    Glass panels, sticky navigation, and export-friendly forms — tuned for calm daily operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

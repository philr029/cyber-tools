"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import type { PricingTier } from "@/app/data/pricing";

export default function PricingPlanCards({ tiers }: { tiers: readonly PricingTier[] }) {
  return (
    <div className={`grid gap-5 ${tiers.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3"}`}>
      {tiers.map((tier) => (
        <article
          key={tier.id}
          className={`group relative flex flex-col overflow-hidden rounded-[1.35rem] border p-6 sm:p-7 motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-1 ${
            tier.highlighted
              ? "border-[color-mix(in_srgb,var(--ss-accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--ss-accent-soft)_55%,transparent)] shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)]"
              : "border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_55%,transparent)] shadow-[0_18px_50px_rgba(0,0,0,0.22)] hover:border-[color-mix(in_srgb,var(--ss-accent)_28%,transparent)]"
          } backdrop-blur-2xl`}
        >
          <div
            className={`pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full blur-3xl opacity-60 motion-safe:transition-opacity motion-safe:duration-500 group-hover:opacity-90 ${
              tier.highlighted
                ? "bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--ss-accent)_55%,transparent),transparent_68%)]"
                : "bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent-blue)_40%,transparent),transparent_70%)]"
            }`}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-[1.35rem] bg-gradient-to-br from-white/[0.07] via-transparent to-transparent opacity-80"
            aria-hidden
          />

          {tier.badge ? (
            <span className="relative mb-4 inline-flex w-fit items-center rounded-full bg-[color-mix(in_srgb,var(--ss-accent)_88%,#0f172a)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-black/25">
              {tier.badge}
            </span>
          ) : null}

          <div className={`relative ${tier.badge ? "" : "mt-4"}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ss-text-secondary)]">{tier.name}</p>
            <div className="mt-2 flex flex-wrap items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight text-[var(--ss-text)]">{tier.price}</span>
              <span className="pb-1 text-sm text-[var(--ss-text-secondary)]">{tier.cadence}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ss-text-secondary)]">{tier.description}</p>
          </div>

          <ul className="relative mt-5 flex-1 space-y-2.5">
            {tier.features.map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-[var(--ss-text-secondary)]">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400" aria-hidden>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>

          <div className="relative mt-8">
            <Link
              href={withBasePath(tier.ctaHref)}
              className={`flex w-full items-center justify-center rounded-2xl py-3 text-sm font-semibold motion-safe:transition-[transform,box-shadow,opacity] motion-safe:duration-200 motion-safe:hover:scale-[1.01] ${
                tier.highlighted
                  ? "bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] text-white shadow-[0_14px_40px_color-mix(in_srgb,var(--ss-accent)_35%,transparent)] hover:opacity-[0.97]"
                  : "border border-[color-mix(in_srgb,var(--ss-text)_14%,transparent)] bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_10%,transparent)]"
              }`}
            >
              {tier.ctaLabel}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

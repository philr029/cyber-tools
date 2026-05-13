"use client";

import { useState } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import { PRICING_TIERS, PRICING_COMPARISON, PRICING_FAQ, type PricingTierId } from "@/app/data/pricing";
import PricingPlanCards from "@/app/components/pricing/PricingPlanCards";
import PricingDisclaimer from "@/app/components/pricing/PricingDisclaimer";

const TIER_COLS: PricingTierId[] = ["free", "pro", "business"];

const TIER_LABEL: Record<PricingTierId, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business / Team",
};

function formatCell(value: string | boolean): string {
  if (typeof value === "boolean") return value ? "Included" : "—";
  return value;
}

export default function PricingPageClient() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  return (
    <main className="flex-1 animate-page-enter">
      <section className="relative overflow-hidden border-b border-[var(--ss-border)] px-4 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--ss-accent)_22%,transparent),transparent)]" aria-hidden />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ss-text-secondary)]">Pricing</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-4xl md:text-[2.75rem] md:leading-tight">
            Plans that stay out of your way
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ss-text-secondary)] sm:text-base">
            Pick a lane for solo analysts, consultants, or teams. Everything here is front-end copy until billing is connected — use
            it to rehearse packaging, not to collect payment.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <PricingDisclaimer />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={withBasePath("/signup")}
              className="ss-pill ss-pill-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 motion-safe:transition-transform motion-safe:hover:-translate-y-px"
            >
              Start free
            </Link>
            <Link
              href={withBasePath("/tools/browse")}
              className="ss-pill ss-pill-ghost px-6 py-2.5 text-sm font-semibold motion-safe:transition-transform motion-safe:hover:-translate-y-px"
            >
              View Pro tools
            </Link>
            <Link href={withBasePath("/contact")} className="ss-pill ss-pill-ghost px-6 py-2.5 text-sm font-semibold motion-safe:transition-transform motion-safe:hover:-translate-y-px">
              Contact for Business
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <PricingPlanCards tiers={PRICING_TIERS} />

        <section className="mb-14 mt-16" id="compare" aria-labelledby="compare-heading">
          <h2 id="compare-heading" className="mb-4 text-lg font-semibold text-[var(--ss-text)]">
            Feature comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_70%,transparent)] shadow-[0_18px_48px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] text-left">
                  <th className="p-4 font-semibold text-[var(--ss-text)]">Capability</th>
                  {TIER_COLS.map((id) => (
                    <th key={id} className="p-4 font-semibold text-[var(--ss-text-secondary)]">
                      {TIER_LABEL[id]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRICING_COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-t border-[var(--ss-border)]">
                    <td className="p-4 font-medium text-[var(--ss-text)]">{row.feature}</td>
                    {TIER_COLS.map((id) => (
                      <td key={id} className="p-4 text-[var(--ss-text-secondary)]">
                        {formatCell(row[id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto mb-14 max-w-2xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-4 text-center text-lg font-semibold text-[var(--ss-text)]">
            FAQ
          </h2>
          <div className="space-y-2">
            {PRICING_FAQ.map((item, i) => {
              const open = faqOpen === i;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_88%,transparent)] backdrop-blur-md"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-[var(--ss-text)] motion-safe:transition-colors motion-safe:hover:bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)]"
                    aria-expanded={open}
                    onClick={() => setFaqOpen(open ? null : i)}
                  >
                    {item.q}
                    <span className="text-[var(--ss-text-secondary)]">{open ? "−" : "+"}</span>
                  </button>
                  {open ? <p className="px-4 pb-4 text-sm leading-relaxed text-[var(--ss-text-secondary)]">{item.a}</p> : null}
                </div>
              );
            })}
          </div>
        </section>

        <PricingDisclaimer className="mb-10" />

        <div className="flex flex-wrap justify-center gap-3">
          <Link href={withBasePath("/contact")} className="ss-pill ss-pill-primary px-5 py-2.5 text-sm font-semibold text-white">
            Talk to us
          </Link>
          <Link href={withBasePath("/docs")} className="ss-pill ss-pill-ghost px-5 py-2.5 text-sm font-semibold">
            Read deployment docs
          </Link>
        </div>
      </div>
    </main>
  );
}

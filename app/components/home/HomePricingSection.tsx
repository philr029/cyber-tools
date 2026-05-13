"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import { PRICING_TIERS } from "@/app/data/pricing";
import PricingPlanCards from "@/app/components/pricing/PricingPlanCards";
import SectionReveal from "@/app/components/ui/SectionReveal";

export default function HomePricingSection() {
  return (
    <section className="mb-12 scroll-mt-28" id="pricing" aria-labelledby="home-pricing-heading">
      <SectionReveal>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ss-text-secondary)]">Pricing</p>
            <h2 id="home-pricing-heading" className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-3xl">
              Simple tiers that scale with your desk
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ss-text-secondary)]">
              Glassmorphism cards mirror the live pricing page. Numbers are placeholders — no checkout yet — so you can iterate on
              packaging before wiring payments server-side.
            </p>
          </div>
          <Link
            href={withBasePath("/pricing")}
            className="ss-pill ss-pill-ghost btn-micro inline-flex shrink-0 items-center justify-center px-4 py-2 text-xs font-semibold motion-safe:transition-transform motion-safe:hover:-translate-y-px"
          >
            Full comparison & FAQ
          </Link>
        </div>

        <PricingPlanCards tiers={PRICING_TIERS} />

        <p className="mt-6 text-center text-[11px] text-[var(--ss-text-secondary)]">
          Demo pricing — billing integration pending.{" "}
          <Link href={withBasePath("/pricing")} className="font-semibold text-[var(--ss-accent)] hover:underline">
            Read the disclaimer
          </Link>
        </p>
      </SectionReveal>
    </section>
  );
}

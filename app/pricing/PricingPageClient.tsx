"use client";

import { useState } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import { PRICING_TIERS, PRICING_COMPARISON, PRICING_FAQ, type PricingTierId } from "@/lib/platform/pricing-data";

function TierCard({
  tier,
  onUpgrade,
}: {
  tier: (typeof PRICING_TIERS)[number];
  onUpgrade: () => void;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        tier.highlighted
          ? "border-[color-mix(in_srgb,var(--ss-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--ss-accent-soft)_35%,transparent)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          : "border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_92%,transparent)]"
      }`}
    >
      {tier.badge ? (
        <span className="absolute top-0 right-0 rounded-bl-xl bg-[var(--ss-accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          {tier.badge}
        </span>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)]">{tier.name}</p>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-bold text-[var(--ss-text)]">{tier.price}</span>
        <span className="text-sm text-[var(--ss-text-secondary)] pb-1">{tier.cadence}</span>
      </div>
      <p className="mt-2 text-sm text-[var(--ss-text-secondary)]">{tier.description}</p>
      <ul className="mt-4 space-y-2 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-[var(--ss-text-secondary)]">
            <span className="text-emerald-500 mt-0.5" aria-hidden>
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-2">
        {tier.locked ? (
          <button
            type="button"
            onClick={onUpgrade}
            className="w-full rounded-xl border border-[var(--ss-border)] py-2.5 text-sm font-semibold text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
          >
            Unlock (placeholder)
          </button>
        ) : null}
        <Link
          href={withBasePath(tier.ctaHref)}
          className={`w-full text-center rounded-xl py-2.5 text-sm font-semibold transition-opacity ${
            tier.highlighted
              ? "bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] text-white shadow-lg hover:opacity-95"
              : "border border-[var(--ss-border)] text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
          }`}
        >
          {tier.ctaLabel}
        </Link>
      </div>
      {tier.locked ? (
        <p className="mt-2 text-[10px] text-center text-[var(--ss-text-secondary)]">
          Payments: Stripe / Lemon Squeezy / Paddle — server only.
        </p>
      ) : null}
    </div>
  );
}

const TIER_COLS: PricingTierId[] = ["free", "pro", "business", "enterprise"];

export default function PricingPageClient() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <main className="flex-1 py-14 px-4 animate-page-enter">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ss-text-secondary)]">Pricing</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-[var(--ss-text)] tracking-tight">Plans for every team stage</h1>
          <p className="mt-3 text-[var(--ss-text-secondary)] max-w-2xl mx-auto text-sm leading-relaxed">
            Front-end placeholders only — no live checkout. Auth today uses Supabase; payments and SSO would land on the server
            with secrets outside the browser.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-14">
          {PRICING_TIERS.map((t) => (
            <TierCard key={t.id} tier={t} onUpgrade={() => setUpgradeOpen(true)} />
          ))}
        </div>

        <section className="mb-14">
          <h2 className="text-lg font-semibold text-[var(--ss-text)] mb-4">Feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--ss-border)]">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] text-left">
                  <th className="p-3 font-semibold text-[var(--ss-text)]">Capability</th>
                  {TIER_COLS.map((id) => (
                    <th key={id} className="p-3 font-semibold text-[var(--ss-text-secondary)] capitalize">
                      {id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRICING_COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-t border-[var(--ss-border)]">
                    <td className="p-3 text-[var(--ss-text)]">{row.feature}</td>
                    {TIER_COLS.map((id) => (
                      <td key={id} className="p-3 text-[var(--ss-text-secondary)]">
                        {typeof row[id] === "boolean" ? (row[id] ? "Yes" : "—") : String(row[id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-2xl mx-auto mb-10">
          <h2 className="text-lg font-semibold text-[var(--ss-text)] mb-4 text-center">FAQ</h2>
          <div className="space-y-2">
            {PRICING_FAQ.map((item, i) => {
              const open = faqOpen === i;
              return (
                <div
                  key={item.q}
                  className="rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_90%,transparent)]"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-[var(--ss-text)]"
                    aria-expanded={open}
                    onClick={() => setFaqOpen(open ? null : i)}
                  >
                    {item.q}
                    <span className="text-[var(--ss-text-secondary)]">{open ? "−" : "+"}</span>
                  </button>
                  {open ? <p className="px-4 pb-3 text-sm text-[var(--ss-text-secondary)] leading-relaxed">{item.a}</p> : null}
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="ss-pill ss-pill-primary px-5 py-2.5 text-sm font-semibold text-white">
            Talk to us
          </Link>
          <Link href="/docs" className="ss-pill ss-pill-ghost px-5 py-2.5 text-sm font-semibold">
            Read deployment docs
          </Link>
        </div>
      </div>

      {upgradeOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setUpgradeOpen(false)}
          />
          <div className="relative max-w-md w-full rounded-2xl border border-[var(--ss-border)] bg-[var(--ss-elevated-solid)] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--ss-text)]">Upgrade flow</h3>
            <p className="mt-2 text-sm text-[var(--ss-text-secondary)]">
              Checkout is not wired. Use the contact or request-access forms to simulate a sales handoff, or connect a serverless
              billing route later.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setUpgradeOpen(false)}
                className="rounded-xl border border-[var(--ss-border)] px-4 py-2 text-sm font-medium text-[var(--ss-text)]"
              >
                Close
              </button>
              <Link href="/forms" className="rounded-xl bg-[var(--ss-accent)] px-4 py-2 text-sm font-semibold text-white">
                Open forms centre
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

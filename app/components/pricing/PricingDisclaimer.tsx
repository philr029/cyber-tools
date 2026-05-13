"use client";

export default function PricingDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      role="note"
      className={`rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-[var(--ss-text)] ${className}`}
    >
      <p className="font-semibold text-amber-200/95">Demo pricing only</p>
      <p className="mt-1 text-[var(--ss-text-secondary)] leading-relaxed">
        Dollar amounts, entitlements, and checkout buttons are placeholders until payment integration is added. Nothing on this page
        charges a card or creates a subscription.
      </p>
    </div>
  );
}

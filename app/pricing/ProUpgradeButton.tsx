"use client";

const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_PRO_LINK ?? "";

export default function ProUpgradeButton() {
  if (STRIPE_LINK) {
    return (
      <a
        href={STRIPE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
      >
        Upgrade to Pro
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className="block w-full text-center py-2.5 px-4 rounded-xl bg-cyan-600 text-white text-sm font-medium cursor-not-allowed opacity-60"
        disabled
        title="Stripe not yet configured"
      >
        Coming soon
      </button>
      <p className="text-center text-xs text-slate-600 mt-2">Payments not yet enabled</p>
    </>
  );
}

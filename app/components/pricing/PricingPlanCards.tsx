"use client";

import type { PricingTier } from "@/app/data/pricing";
import PricingCard from "@/app/components/pricing/PricingCard";

export default function PricingPlanCards({ tiers }: { tiers: readonly PricingTier[] }) {
  return (
    <div className={`grid gap-5 ${tiers.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3"}`}>
      {tiers.map((tier) => (
        <PricingCard key={tier.id} tier={tier} />
      ))}
    </div>
  );
}

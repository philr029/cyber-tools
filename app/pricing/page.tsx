import type { Metadata } from "next";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing – SecureScope",
  description: "Transparent tiers for individuals and teams — placeholders until billing is connected.",
};

export default function PricingPage() {
  return <PricingPageClient />;
}

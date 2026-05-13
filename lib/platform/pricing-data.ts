export type PricingTierId = "free" | "pro" | "business" | "enterprise";

export type PricingTier = {
  id: PricingTierId;
  name: string;
  price: string;
  cadence: string;
  description: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  locked?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "/ month",
    description: "Core desk checks and local workspace features.",
    features: [
      "Basic day-to-day tools",
      "Notes / checklists (where tools support them)",
      "Manual JSON/CSV exports from forms (browser)",
      "localStorage workspace (this device)",
    ],
    ctaLabel: "Get started",
    ctaHref: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    cadence: "/ month",
    description: "Placeholder tier for heavier individual usage.",
    highlighted: true,
    badge: "Most popular",
    features: [
      "Advanced dashboard widgets (UI placeholders)",
      "Automation templates & planners",
      "More export formats from forms centre",
      "Saved reports (when backed by auth storage)",
      "Pinned tools & extended history (UI)",
    ],
    ctaLabel: "Upgrade (placeholder)",
    ctaHref: "/contact",
    locked: true,
  },
  {
    id: "business",
    name: "Business",
    price: "Custom",
    cadence: "contact",
    description: "Team workflows — integrations not enabled in this demo.",
    features: [
      "Team workflows (roadmap)",
      "API integrations (Stripe / Supabase / Graph — server-side only)",
      "Scheduled checks (roadmap)",
      "Email reports (roadmap)",
      "Phone/site test automation (roadmap)",
      "Admin dashboard (existing RBAC for admins)",
    ],
    ctaLabel: "Talk to us",
    ctaHref: "/contact",
    locked: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "contact",
    description: "Compliance-oriented packaging — placeholders only.",
    features: [
      "Custom integrations",
      "SSO placeholder (Entra ID / Clerk)",
      "Audit logs (partial: admin security log)",
      "Compliance reports (templates)",
      "Dedicated support placeholder",
    ],
    ctaLabel: "Request enterprise brief",
    ctaHref: "/contact",
    locked: true,
  },
];

export type ComparisonRow = { feature: string } & Record<PricingTierId, string | boolean>;

export const PRICING_COMPARISON: ComparisonRow[] = [
  { feature: "Threat lookups", free: "Limited/day", pro: "Unlimited (when enabled)", business: "Team pooled", enterprise: "Custom" },
  { feature: "Monitoring alerts", free: false, pro: true, business: true, enterprise: true },
  { feature: "Form → webhook", free: "Optional env", pro: "Optional env", business: "Optional env", enterprise: "Custom" },
  { feature: "SSO", free: false, pro: false, business: "Roadmap", enterprise: "Roadmap" },
  { feature: "Audit trail", free: false, pro: "Basic", business: "Extended", enterprise: "Full (roadmap)" },
];

export const PRICING_FAQ = [
  {
    q: "Are payments live?",
    a: "No. Tiers describe a future product shape. Use Contact to reach out; there is no checkout in this repository.",
  },
  {
    q: "How do upgrades work later?",
    a: "Wire Stripe, Lemon Squeezy, or Paddle on the server. Never expose secret keys in NEXT_PUBLIC_* or client bundles.",
  },
  {
    q: "Where is data stored today?",
    a: "Most tool state is localStorage or Supabase-backed auth for dashboard routes. Read /docs for details.",
  },
  {
    q: "Can I self-host?",
    a: "Yes — see README deployment notes for Vercel and GitHub Pages base path configuration.",
  },
];

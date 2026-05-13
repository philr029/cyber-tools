/**
 * Demo pricing catalog — UI and copy only. No checkout, no billing secrets.
 * Wire Stripe / Lemon Squeezy / Paddle on the server when you are ready.
 */

export type PricingTierId = "free" | "pro" | "business";

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
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "/ month",
    description: "Run daily desk checks, explore the toolkit, and keep work on-device.",
    features: [
      "Full access to core lookup and checker tools",
      "Daily scan quota with transparent limits",
      "Workspace notes and exports where tools support them",
      "localStorage-first workspace on this browser",
      "Community-tier documentation and examples",
      "Upgrade path when you outgrow the free quota",
    ],
    ctaLabel: "Get started free",
    ctaHref: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    cadence: "/ month",
    description: "Placeholder tier for power users — unlimited scans and saved views when billing ships.",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Unlimited threat lookups when quota rules are relaxed",
      "Pinned dashboards and extended run history",
      "Advanced export presets from the forms centre",
      "Automation planner templates with deeper checklists",
      "Priority placement in the roadmap for new modules",
      "Email summaries (planned) without client-side secrets",
      "Single-seat licensing — team features move to Business / Team",
    ],
    ctaLabel: "Choose Pro",
    ctaHref: "/contact",
  },
  {
    id: "business",
    name: "Business / Team",
    price: "$49",
    cadence: "/ seat / month",
    description: "Pooled usage, shared templates, and admin-friendly controls — demo copy only today.",
    features: [
      "Pooled scan allowances across invited members",
      "Shared template libraries and pinned team hubs",
      "Role-aware admin previews (ties into dashboard RBAC)",
      "Scheduled checks and webhook hand-offs (roadmap)",
      "Invoice-friendly packaging once billing exists",
      "Dedicated onboarding checklist and success milestones",
      "Talk to us for SSO, audit exports, and custom limits",
    ],
    ctaLabel: "Talk to sales",
    ctaHref: "/contact",
  },
];

export type ComparisonRow = { feature: string } & Record<PricingTierId, string | boolean>;

export const PRICING_COMPARISON: ComparisonRow[] = [
  { feature: "Threat & DNS lookups", free: "Daily quota", pro: "Unlimited (when enabled)", business: "Pooled team quota" },
  { feature: "Dashboard widgets", free: "Core", pro: "Advanced layouts", business: "Team layouts" },
  { feature: "Monitoring & alerts", free: false, pro: true, business: true },
  { feature: "Forms → webhook / export", free: "Browser exports", pro: "Extended formats", business: "Shared destinations" },
  { feature: "Audit-friendly summaries", free: false, pro: "Individual", business: "Team rollups" },
  { feature: "SSO / IdP", free: false, pro: false, business: "Roadmap" },
];

export const PRICING_FAQ = [
  {
    q: "Are payments live?",
    a: "No. Every price is illustrative. Checkout is not wired in this repository — use Contact for access conversations until a server-side billing integration is added.",
  },
  {
    q: "How will upgrades work later?",
    a: "Use Stripe, Lemon Squeezy, or Paddle from a server route or edge function. Keep secret keys out of NEXT_PUBLIC_* variables and never ship them to the browser bundle.",
  },
  {
    q: "What does “locked” mean on some tool previews?",
    a: "Certain panels show a Pro/Business preview ribbon. Tools still run in demo mode; the ribbon is a UX placeholder until entitlements are enforced with real subscriptions.",
  },
  {
    q: "Where is data stored today?",
    a: "Most tool state stays in localStorage or authenticated Supabase sessions for dashboard routes. Read /docs for deployment-specific notes.",
  },
  {
    q: "Can we self-host?",
    a: "Yes. Follow README guidance for Vercel or static hosting, including NEXT_PUBLIC_BASE_PATH when using GitHub Pages.",
  },
];

/** Tool routes that show a non-blocking “Pro preview” ribbon (UI only). */
export const PREMIUM_TOOL_PREVIEW_PATHS: readonly string[] = [
  "/tools/automated-monitoring",
  "/tools/agent-scan",
];

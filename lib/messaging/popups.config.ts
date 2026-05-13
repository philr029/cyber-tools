import type { PopupConfig } from "@/lib/messaging/types";

/**
 * Popup / modal campaigns — only kinds handled by `PopupOrchestrator` auto-run here.
 * Programmatic modals (login prompt, confirm) use `lib/messaging/modal-context.tsx`.
 */
export const POPUPS: PopupConfig[] = [
  {
    id: "whats-new-q1-2026",
    kind: "whats-new",
    enabled: true,
    version: 1,
    title: "What’s new",
    message:
      "Cookie consent (Cookiebot), Supabase-backed auth, and a cleaner dashboard experience. Tell us what to build next from the feedback form.",
    delayMs: 4500,
    minIntervalMs: 1000 * 60 * 60 * 24 * 21,
    requiresMarketingConsent: false,
    dismissTtlDays: 60,
    pathPrefixes: ["/"],
    auth: "logged-in",
  },
  {
    id: "newsletter-product-updates",
    kind: "newsletter",
    enabled: true,
    version: 1,
    title: "Monthly product notes",
    message: "Optional: one short email per month with new tools and hardening tips. Requires marketing consent.",
    delayMs: 12000,
    minIntervalMs: 1000 * 60 * 60 * 24 * 30,
    requiresMarketingConsent: true,
    dismissTtlDays: 90,
    pathPrefixes: ["/", "/dashboard"],
    auth: "logged-in",
  },
];

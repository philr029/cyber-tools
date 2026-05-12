/**
 * Security suite “preview” tiles on `/tools` — no standalone tool page yet.
 * Keys match the `k` query param on `/tools/coming-soon`.
 */
export const SUITE_COMING_SOON_KEYS = [
  "username-footprint",
  "metadata-scraper",
  "shodan-explorer",
  "global-latency",
  "og-preview",
  "serp-visualizer",
  "utm-architect",
  "jwt-decoder",
  "cron-job-translator",
  "privacy-policy-scanner",
  "cookie-audit",
] as const;

export type SuiteComingSoonKey = (typeof SUITE_COMING_SOON_KEYS)[number];

export const SUITE_COMING_SOON_ENTRIES: Record<
  SuiteComingSoonKey,
  { title: string; description: string }
> = {
  "username-footprint": {
    title: "Username footprint",
    description: "Trace public account reuse across platforms. Spot naming collisions and exposure patterns quickly.",
  },
  "metadata-scraper": {
    title: "Metadata scraper",
    description: "Extract visible file and page metadata safely. Surface attribution clues and hidden context fields.",
  },
  "shodan-explorer": {
    title: "Shodan explorer",
    description: "Pivot through exposed services and banners fast. Triage internet-facing assets by risk signals.",
  },
  "global-latency": {
    title: "Global latency check",
    description: "Preview worldwide response timing checks and route quality baselines for distributed services.",
  },
  "og-preview": {
    title: "OG tag previewer",
    description: "Inspect Open Graph and social card presentation before content goes live.",
  },
  "serp-visualizer": {
    title: "SERP visualizer",
    description: "Model title, description, and rich-result presentation in a search-engine styled viewport.",
  },
  "utm-architect": {
    title: "UTM architect",
    description: "Build clean, validated campaign URLs with tracking parameter governance built in.",
  },
  "jwt-decoder": {
    title: "JWT decoder",
    description: "Decode token headers and claims instantly. Review expiry, issuer, and audience values at a glance.",
  },
  "cron-job-translator": {
    title: "Cron job translator",
    description: "Convert cron expressions into plain language. Validate run cadence before deployment or handoff.",
  },
  "privacy-policy-scanner": {
    title: "Privacy policy scanner",
    description: "Detect key policy sections, missing disclosures, and transparency gaps across public pages.",
  },
  "cookie-audit": {
    title: "Cookie tracker audit",
    description: "Enumerate first- and third-party tracking signals to support consent and policy reviews.",
  },
};

export function isSuiteComingSoonKey(k: string | null): k is SuiteComingSoonKey {
  return k !== null && (SUITE_COMING_SOON_KEYS as readonly string[]).includes(k);
}

export function getSuiteComingSoonEntry(k: string | null) {
  if (!isSuiteComingSoonKey(k)) return null;
  return { key: k, ...SUITE_COMING_SOON_ENTRIES[k] };
}

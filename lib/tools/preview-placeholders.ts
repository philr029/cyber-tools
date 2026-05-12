import type { MegaGroupLabel } from "@/lib/tools/site-catalog";

export const PREVIEW_SLUGS = [
  "robots-txt-checker",
  "phone-line-test-logger",
  "security-audit-checklist",
  "dynamics-365-checklist",
  "dynamics-365-lead-checklist",
  "finance-automation-checklist",
  "spf-dkim-dmarc-lab",
  "m365-user-checklist-generator",
] as const;

export type PreviewSlug = (typeof PREVIEW_SLUGS)[number];

export interface PreviewModule {
  slug: PreviewSlug;
  title: string;
  description: string;
  megaGroup: MegaGroupLabel;
  categoryChip: string;
  status: "demo" | "planned";
  bullets: string[];
  primaryAction?: { href: string; label: string };
  related?: Array<{ href: string; label: string }>;
}

export const PREVIEW_MODULES: Record<PreviewSlug, PreviewModule> = {
  "robots-txt-checker": {
    slug: "robots-txt-checker",
    title: "Robots.txt checker",
    description:
      "Portfolio-grade checklist for crawl rules, host directives, and sitemap pointers — designed to pair with your live sitemap workflow.",
    megaGroup: "Website Testing Tools",
    categoryChip: "Web QA",
    status: "demo",
    bullets: [
      "Validate User-agent groups and Disallow patterns against staging vs production hosts.",
      "Cross-check Allow paths with critical conversion URLs and authenticated areas.",
      "Confirm Sitemap directives resolve and match your published sitemap.xml.",
    ],
    primaryAction: { href: "/tools/sitemap-checker", label: "Open sitemap checker" },
    related: [
      { href: "/tools/broken-links", label: "Broken link checker" },
      { href: "/tools/seo-meta-checker", label: "SEO metadata checker" },
    ],
  },
  "phone-line-test-logger": {
    slug: "phone-line-test-logger",
    title: "Phone line test logger",
    description:
      "Structured logging template for PSTN/IVR smoke tests — escalations, carrier notes, and repeatability for ops desks.",
    megaGroup: "Domain & DNS Tools",
    categoryChip: "Voice QA",
    status: "demo",
    bullets: [
      "Capture dial sequences, observed latency, and audio quality notes per trunk.",
      "Track carrier ticket IDs alongside repro timestamps for handoffs.",
      "Export a concise test log suitable for change windows and CAB packs.",
    ],
    primaryAction: { href: "/tools/phone-line-tester", label: "Open phone line tester" },
    related: [
      { href: "/tools/phone-lookup", label: "Phone validator" },
      { href: "/tools/automated-monitoring", label: "Automated monitoring hub" },
    ],
  },
  "security-audit-checklist": {
    slug: "security-audit-checklist",
    title: "Security audit checklist",
    description:
      "Executive-ready audit framing across identity, email auth, endpoints, and SaaS posture — tuned for portfolio walkthroughs.",
    megaGroup: "Security Tools",
    categoryChip: "Security",
    status: "demo",
    bullets: [
      "Evidence prompts for SPF/DKIM/DMARC, TLS versions, and admin role sprawl.",
      "Segment findings by severity with remediation owners.",
      "Pairs with DNS and header tooling for repeatable quarterly reviews.",
    ],
    primaryAction: { href: "/tools/dns-security-checklist", label: "Open DNS security checklist" },
    related: [
      { href: "/tools/email-security-checklist", label: "Email security checklist" },
      { href: "/tools/security-headers", label: "Security headers" },
    ],
  },
  "dynamics-365-checklist": {
    slug: "dynamics-365-checklist",
    title: "Dynamics 365 readiness checklist",
    description:
      "Environment, security role, and integration guardrails for Business Central / CE-style rollouts — portfolio placeholder with clear expansion hooks.",
    megaGroup: "Business/Productivity Tools",
    categoryChip: "Dynamics 365",
    status: "planned",
    bullets: [
      "Separate dev/UAT/prod tenants with named admins and break-glass accounts.",
      "Review dual-write / dataverse integration scopes before go-live.",
      "Exportable checklist for partner handoffs and hypercare windows.",
    ],
    related: [
      { href: "/tools/automation/power-automate", label: "Power Automate planner" },
      { href: "/m365-tools", label: "Microsoft 365 hub" },
    ],
  },
  "dynamics-365-lead-checklist": {
    slug: "dynamics-365-lead-checklist",
    title: "Dynamics 365 lead checklist",
    description:
      "Sales operations framing for lead assignment, scoring hygiene, duplicate detection, and marketing-to-sales handoffs in CE-style orgs.",
    megaGroup: "Business/Productivity Tools",
    categoryChip: "Dynamics 365",
    status: "planned",
    bullets: [
      "Validate lead sources, UTM capture, and consent flags before routing rules go live.",
      "Document assignment queues, SLAs, and escalation paths for inbound spikes.",
      "Pair duplicate detection rules with marketing lists to avoid nurture collisions.",
    ],
    primaryAction: { href: "/lead-tools", label: "Open lead & pipeline hub" },
    related: [
      { href: "/tools/marketing-campaign-planner", label: "Marketing campaign planner" },
      { href: "/tools/preview/dynamics-365-checklist", label: "Dynamics readiness checklist" },
    ],
  },
  "finance-automation-checklist": {
    slug: "finance-automation-checklist",
    title: "Finance automation checklist",
    description:
      "Controls-friendly prompts for month-end close automation, reconciliations, segregation of duties, and a finance automation tracker narrative when wiring low-code flows.",
    megaGroup: "Business/Productivity Tools",
    categoryChip: "Finance",
    status: "demo",
    bullets: [
      "Map approval tiers and maker-checker rules before automating postings.",
      "Document data sources, refresh SLAs, and rollback paths for each workbook.",
      "Align with audit trails in Power Automate / Logic Apps run histories.",
    ],
    primaryAction: { href: "/tools/reporting/automation-roi", label: "Open automation ROI" },
    related: [
      { href: "/tools/business/risk-register", label: "Risk register builder" },
      { href: "/automation-tools", label: "Automation hub" },
    ],
  },
  "m365-user-checklist-generator": {
    slug: "m365-user-checklist-generator",
    title: "Microsoft 365 user checklist generator",
    description:
      "Portfolio demo that frames Entra ID, Exchange Online, Teams, and Intune tasks into one printable starter matrix — pairs with the live M365 checklist routes.",
    megaGroup: "Business/Productivity Tools",
    categoryChip: "Microsoft 365",
    status: "demo",
    bullets: [
      "Group tasks by persona (remote vs desk, VIP vs standard) before exporting.",
      "Include licence SKU, MFA method, and device compliance profile on one row per user.",
      "Surface Safe Links / Defender baselines as optional add-on columns.",
    ],
    primaryAction: { href: "/tools/m365/new-starter", label: "Open new starter checklist" },
    related: [
      { href: "/tools/m365/leaver", label: "Leaver / offboarding checklist" },
      { href: "/m365-tools", label: "Microsoft 365 hub" },
    ],
  },
  "spf-dkim-dmarc-lab": {
    slug: "spf-dkim-dmarc-lab",
    title: "SPF / DKIM / DMARC lab",
    description:
      "Guided pass that stitches together MX alignment, TXT inspection, and authentication outcomes — optimised for interviews and demos.",
    megaGroup: "Domain & DNS Tools",
    categoryChip: "Email auth",
    status: "demo",
    bullets: [
      "Walkthrough for SPF flattening risks and include limits.",
      "DKIM selector strategy and rotation reminders.",
      "DMARC policy progression from none → quarantine → reject with reporting.",
    ],
    primaryAction: { href: "/tools/mx-dns-checker", label: "Open MX / DNS checker" },
    related: [
      { href: "/tools/email-security-checklist", label: "Email security checklist" },
      { href: "/tools/email-deliverability", label: "Email deliverability" },
    ],
  },
};

export function isPreviewSlug(s: string): s is PreviewSlug {
  return (PREVIEW_SLUGS as readonly string[]).includes(s);
}

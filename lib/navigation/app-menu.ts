// =============================================================================
// Primary navigation — compact top bar + mega menu / mobile accordion.
// Categories are curated for scanability (desktop mega menu, mobile sections).
// =============================================================================

import type { NavGroup, NavLink } from "@/lib/tools/site-catalog";

/** Main bar: high-intent destinations only. Deeper tool lists live under Tools. */
export const TOP_BAR_LINKS: NavLink[] = [
  { href: "/", label: "Home", description: "SecureScope landing and threat lookup" },
  { href: "/tools/browse", label: "Toolkit", description: "Browse and filter the full catalog" },
  { href: "/pricing", label: "Pricing", description: "Free, Pro, and Business tiers" },
  { href: "/blog", label: "Blog", description: "Build notes, security, and automation write-ups" },
  { href: "/docs", label: "Docs", description: "Help centre and deployment notes" },
  { href: "/contact", label: "Contact", description: "Sales, access requests, and feedback" },
];

/** Pinned chips at the top of the desktop mega menu. */
export const MEGA_MENU_POPULAR: NavLink[] = [
  { href: "/tools/ip-lookup", label: "IP reputation", description: "Abuse and ASN signals" },
  { href: "/tools/dns-lookup", label: "DNS lookup", description: "A, MX, TXT, and friends" },
  { href: "/tools/automated-monitoring", label: "Monitoring hub", description: "Uptime, DNS, and forms" },
  { href: "/web-tools", label: "Web QA hub", description: "Launch, performance, and accessibility" },
  { href: "/marketing-tools", label: "Marketing hub", description: "UTMs, campaigns, and creative QA" },
  { href: "/tools/ai-assistant", label: "AI assistant", description: "Guided checks and drafting" },
];

/**
 * Seven hub-aligned categories (mega menu columns + mobile accordions).
 * Each `index` is a real hub route; featured links stay short to avoid overwhelm.
 */
export const PRIMARY_NAV_MENU: NavGroup[] = [
  {
    label: "Security Tools",
    emoji: "🛡️",
    iconKey: "security",
    index: "/cyber-tools",
    tagline: "Hardening, email safety, SSL, headers, and threat context",
    maxFeaturedLinks: 8,
    links: [
      { href: "/cyber-tools", label: "Security hub", description: "Full cybersecurity toolkit index" },
      { href: "/tools/m365/defender-baseline", label: "Defender baseline", description: "Microsoft Defender for Endpoint prompts" },
      { href: "/tools/email-security-checklist", label: "Email security checklist", description: "SPF, DKIM, and DMARC hygiene" },
      { href: "/tools/phishing-email-analyser", label: "Phishing email analyser", description: "Headers and content heuristics" },
      { href: "/tools/security/admin-hardening-checklist", label: "Admin hardening", description: "Privileged access guardrails" },
      { href: "/tools/ssl-checker", label: "SSL checker", description: "Chain, expiry, and cipher notes" },
      { href: "/tools/security-headers", label: "Security headers", description: "HTTP header review" },
      { href: "/tools/threat-score", label: "Threat score", description: "Composite risk scoring" },
      { href: "/tools/blacklist", label: "Blacklist checker", description: "DNSBL-style reputation signals" },
      { href: "/tools/security/malwarebytes-checklist", label: "Malwarebytes checklist", description: "MBAM validation prompts" },
    ],
  },
  {
    label: "Domain & DNS Tools",
    emoji: "🌐",
    iconKey: "domain",
    index: "/domain-ip-tools",
    tagline: "WHOIS, DNS, MX, geolocation, and reputation",
    maxFeaturedLinks: 8,
    links: [
      { href: "/domain-ip-tools", label: "Domain & IP hub", description: "Network and mail-path diagnostics" },
      { href: "/tools/ip-lookup", label: "IP lookup", description: "Abuse context and ASN signals" },
      { href: "/tools/dns-lookup", label: "DNS lookup", description: "Record-level inspection" },
      { href: "/tools/mx-dns-checker", label: "MX / DNS checker", description: "Mail exchanger and SPF alignment" },
      { href: "/tools/whois", label: "WHOIS / RDAP", description: "Registration and nameserver context" },
      { href: "/tools/subdomains", label: "Subdomain finder", description: "Enumeration-friendly checklist" },
      { href: "/tools/domain-lookup", label: "Domain reputation", description: "High-signal intel cards" },
      { href: "/tools/geo-lookup", label: "IP geolocation", description: "Geo hints without invasive probes" },
      { href: "/tools/port-scanner", label: "Port scan (info)", description: "Educational exposure checklist" },
    ],
  },
  {
    label: "Email & Marketing Tools",
    emoji: "✉️",
    iconKey: "marketing",
    index: "/marketing-tools",
    tagline: "Campaign QA, creative tools, and deliverability",
    maxFeaturedLinks: 8,
    links: [
      { href: "/marketing-tools", label: "Marketing hub", description: "Growth and conversion utilities" },
      { href: "/tools/email-headers", label: "Email header analyser", description: "Authentication and routing forensics" },
      { href: "/tools/email-subject-line-tester", label: "Subject line tester", description: "Length, power words, preview text" },
      { href: "/tools/marketing/utm-builder", label: "UTM builder", description: "Tagged URLs for clean attribution" },
      { href: "/tools/marketing-campaign-planner", label: "Campaign planner", description: "Objectives, channels, and measurement" },
      { href: "/tools/seo-meta-checker", label: "SEO meta checker", description: "Titles, robots, canonical, social cards" },
      { href: "/tools/launch-checklist", label: "Launch checklist", description: "Pre-flight go-live review" },
      {
        href: "/tools/marketing/coming-soon?slug=competitor-post-tracker-ui",
        label: "Competitor tracker",
        description: "Cadence log — scaffold UI",
      },
    ],
  },
  {
    label: "Automation Tools",
    emoji: "⚙️",
    iconKey: "automation",
    index: "/automation-tools",
    tagline: "Monitoring, schedules, API safety, and integrations",
    maxFeaturedLinks: 8,
    links: [
      { href: "/automation-tools", label: "Automation hub", description: "Ops automation index" },
      { href: "/tools/automated-monitoring", label: "Automated monitoring", description: "Uptime, DNS, forms, and phone hub" },
      { href: "/tools/api-tester", label: "API tester", description: "Compose requests and smoke endpoints" },
      { href: "/tools/automation/lead-form-qa", label: "Lead form QA", description: "Marketing form quality checklist" },
      { href: "/tools/automation/daily-test-planner", label: "Daily test planner", description: "Recurring smoke and regression plan" },
      { href: "/tools/automation/github-actions", label: "GitHub Actions", description: "Cron and workflow hygiene" },
      { href: "/tools/automation/api-integration-planner", label: "API integration planner", description: "Contracts and failure modes" },
      { href: "/tools/phone-line-tester", label: "Phone line tester", description: "PSTN, IVR, and escalation scripts" },
    ],
  },
  {
    label: "Website Testing Tools",
    emoji: "🧪",
    iconKey: "webqa",
    index: "/web-tools",
    tagline: "Forms, performance, accessibility, and broken links",
    maxFeaturedLinks: 8,
    links: [
      { href: "/web-tools", label: "Website testing hub", description: "Launch QA and performance" },
      { href: "/tools/website-form-tester", label: "Website form tester", description: "Structured multi-step passes" },
      { href: "/tools/form-tester", label: "Form tester", description: "Field-level functional passes" },
      { href: "/tools/form-testing-checklist", label: "Form testing checklist", description: "Validation and analytics hooks" },
      { href: "/tools/broken-links", label: "Broken link checker", description: "Spot 404s and bad transports" },
      { href: "/tools/qa/accessibility", label: "Accessibility checklist", description: "WCAG-oriented manual QA" },
      { href: "/tools/page-speed-checklist", label: "Page speed checklist", description: "Core Web Vitals hygiene" },
      { href: "/tools/uptime-checker", label: "Uptime checker", description: "Reachability windows and alerts" },
    ],
  },
  {
    label: "Admin Tools",
    emoji: "🧰",
    iconKey: "admin",
    index: "/it-admin-tools",
    tagline: "Microsoft 365, service desk, devices, and daily desk utilities",
    maxFeaturedLinks: 8,
    links: [
      { href: "/it-admin-tools", label: "IT admin hub", description: "Tenant-adjacent runbooks" },
      { href: "/m365-tools", label: "Microsoft 365 tools", description: "Entra, Exchange, Intune shortcuts" },
      { href: "/tools/m365/intune-onboarding", label: "Intune onboarding", description: "Device readiness prompts" },
      { href: "/tools/m365/leaver", label: "Leaver checklist", description: "Offboarding guardrails" },
      { href: "/tools/m365/device-readiness", label: "Device readiness", description: "Build verification prompts" },
      { href: "/tools/m365/forwarding-audit", label: "Forwarding audit", description: "Mail flow and shadow rules" },
      { href: "/tools/it-admin/ticket-triage", label: "Ticket triage", description: "Service desk prioritisation" },
      { href: "/tools/it-admin/shared-mailbox", label: "Shared mailbox", description: "Delegation and access patterns" },
      { href: "/day-to-day-tools", label: "Day-to-day tools", description: "Timers, planners, templates, dev utilities" },
    ],
  },
  {
    label: "Reports & Dashboards",
    emoji: "📊",
    iconKey: "reports",
    index: "/reporting-tools",
    tagline: "Rollups, ROI, risk, and portfolio views",
    maxFeaturedLinks: 8,
    links: [
      { href: "/reporting-tools", label: "Reporting hub", description: "Monthly summaries and QA exports" },
      { href: "/dashboard", label: "Workspace dashboard", description: "Signed-in overview" },
      { href: "/tools/reporting/qa-report", label: "QA report generator", description: "Release-quality rollup template" },
      { href: "/tools/reporting/automation-roi", label: "Automation ROI", description: "Payback and time-saved math" },
      { href: "/tools/business/risk-register", label: "Risk register", description: "Likelihood and impact grid" },
      { href: "/tools/business/vendor-comparison", label: "Vendor comparison", description: "Side-by-side evaluation" },
      { href: "/projects/finance-dashboard", label: "Finance dashboard", description: "Controls-aware automation framing" },
      { href: "/projects/portfolio", label: "Portfolio", description: "Highlighted builds and case studies" },
      { href: "/business-tools", label: "Business tools hub", description: "ROI, vendor, and finance workflows" },
    ],
  },
];

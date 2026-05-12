// =============================================================================
// Primary navigation — curated mega menu + compact top bar (single source).
// =============================================================================

import type { NavGroup, NavLink } from "@/lib/tools/site-catalog";

/** Minimal top bar: everything else lives under the Tools mega menu. */
export const TOP_BAR_LINKS: NavLink[] = [
  { href: "/", label: "Home", description: "SecureScope landing and threat lookup" },
];

/**
 * Seven premium groups (Apple-style hub + featured links).
 * Indices are real routes; every href is validated against existing pages or new stubs.
 */
export const PRIMARY_NAV_MENU: NavGroup[] = [
  {
    label: "Dashboard",
    index: "/dashboard",
    tagline: "Workspace overview, launches, and history",
    maxFeaturedLinks: 8,
    links: [
      { href: "/", label: "Home", description: "Landing page, lookup hero, and highlights" },
      { href: "/dashboard", label: "Overview", description: "Signed-in workspace home" },
      { href: "/tools/browse", label: "Quick Launch", description: "Full toolkit grid with filters" },
      { href: "/dashboard/history", label: "Recent Tools", description: "Past scans and lookups" },
    ],
  },
  {
    label: "IT Tools",
    index: "/domain-ip-tools",
    tagline: "Network, mail path, and identity-adjacent checks",
    maxFeaturedLinks: 12,
    links: [
      { href: "/tools/ip-lookup", label: "IP Lookup", description: "Abuse context and ASN signals" },
      { href: "/tools/dns-lookup", label: "DNS Lookup", description: "A, MX, TXT, NS, and CNAME records" },
      { href: "/tools/mx-dns-checker", label: "MX Checker", description: "Mail exchanger and SPF alignment" },
      { href: "/tools/blacklist", label: "Blacklist Checker", description: "DNSBL-style reputation signals" },
      { href: "/tools/port-scanner", label: "Port Scanner UI", description: "Educational exposure checklist" },
      { href: "/tools/ssl-checker", label: "SSL Checker", description: "Chain, expiry, and cipher notes" },
      { href: "/tools/whois", label: "WHOIS Lookup", description: "Registration and nameserver context" },
      { href: "/tools/email-headers", label: "Email Header Analyzer", description: "Authentication and routing forensics" },
      { href: "/tools/preview/security-audit-checklist", label: "Security Checklist", description: "Cross-domain audit framing" },
    ],
  },
  {
    label: "Marketing Tools",
    index: "/marketing-tools",
    tagline: "Campaign QA, SEO, and conversion diagnostics",
    maxFeaturedLinks: 12,
    links: [
      { href: "/web-tools", label: "Website Tester", description: "Launch QA, performance, and forms hub" },
      { href: "/tools/website-form-tester", label: "Form Tester", description: "Structured multi-step form passes" },
      { href: "/tools/launch-checklist", label: "Landing Page Checker", description: "Pre-flight go-live checklist" },
      { href: "/tools/seo-meta-checker", label: "SEO Checker", description: "Titles, robots, canonical, social cards" },
      { href: "/tools/marketing/utm-builder", label: "UTM Builder", description: "Tagged URLs for clean attribution" },
      { href: "/tools/marketing-campaign-planner", label: "Campaign Checklist", description: "Objectives, channels, and measurement" },
      {
        href: "/tools/marketing/coming-soon?slug=competitor-post-tracker-ui",
        label: "Competitor Tracker",
        description: "Cadence and positioning log — scaffold UI",
      },
    ],
  },
  {
    label: "Automation",
    index: "/automation-tools",
    tagline: "Monitoring, schedules, and integration safety",
    maxFeaturedLinks: 12,
    links: [
      { href: "/tools/phone-line-tester", label: "Phone Test Dashboard", description: "PSTN, IVR, and escalation scripts" },
      { href: "/tools/automation/lead-form-qa", label: "Website Form Automation", description: "Marketing form quality checklist" },
      { href: "/tools/automated-monitoring", label: "Domain Monitoring", description: "Uptime, DNS, forms, and phone hub" },
      { href: "/tools/api-tester", label: "API Status Monitor", description: "Compose requests and smoke endpoints" },
      { href: "/tools/automation/daily-test-planner", label: "Scheduled Checks", description: "Recurring smoke and regression plan" },
      { href: "/tools/reporting/qa-report", label: "Report Generator", description: "Release-quality rollup template" },
    ],
  },
  {
    label: "Security",
    index: "/cyber-tools",
    tagline: "Endpoint posture, email safety, and hardening",
    maxFeaturedLinks: 12,
    links: [
      { href: "/tools/m365/defender-baseline", label: "Defender Notes", description: "Microsoft Defender for Endpoint prompts" },
      { href: "/tools/security/malwarebytes-checklist", label: "Malwarebytes Tests", description: "MBAM validation and escalation checklist" },
      { href: "/tools/phishing-email-analyser", label: "Phishing Simulation Notes", description: "Headers and content heuristics" },
      { href: "/tools/email-security-checklist", label: "Email Security Checks", description: "SPF, DKIM, and DMARC hygiene" },
      { href: "/tools/security/bitlocker-checklist", label: "BitLocker Checklist", description: "Encryption, escrow, and recovery keys" },
      { href: "/tools/security/admin-hardening-checklist", label: "Admin Hardening Checklist", description: "Privileged access and tenant guardrails" },
      { href: "/tools/security/port-blocking-checklist", label: "Port Blocking Checklist", description: "Host firewall posture for clients and servers" },
    ],
  },
  {
    label: "Projects",
    index: "/projects",
    tagline: "Curated bundles and portfolio entry points",
    maxFeaturedLinks: 8,
    links: [
      { href: "/projects/portfolio", label: "Portfolio", description: "Highlighted builds and case studies" },
      { href: "/projects/tutorcare-tests", label: "TutorCare Tests", description: "QA notes for the TutorCare programme" },
      { href: "/projects/cyber-tools", label: "Cyber Tools", description: "Shortcut into the security hub" },
      { href: "/projects/finance-dashboard", label: "Finance Dashboard", description: "Controls-aware automation framing" },
      { href: "/projects/email-marketing", label: "Email Marketing Tool", description: "Campaign and deliverability hub" },
    ],
  },
  {
    label: "Resources",
    index: "/resources",
    tagline: "Docs, certs, and engineering references",
    maxFeaturedLinks: 10,
    links: [
      { href: "/resources/documentation", label: "Documentation", description: "How SecureScope is structured" },
      { href: "/resources/runbooks", label: "Runbooks", description: "Operational response starters" },
      { href: "/resources/study-notes", label: "Study Notes", description: "Exam and interview prep index" },
      { href: "/resources/ms-102", label: "MS-102", description: "Microsoft 365 administrator track" },
      { href: "/resources/security-plus", label: "Security+", description: "CompTIA Security+ quick map" },
      { href: "/resources/github-notes", label: "GitHub Notes", description: "Repo hygiene and Actions references" },
      { href: "/coding-tools", label: "Coding & AI hub", description: "Snippets, APIs, prompts, and repo tools" },
    ],
  },
];

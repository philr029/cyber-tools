// =============================================================================
// Navigation data
// -----------------------------------------------------------------------------
// Single source of truth for the main site navigation, consumed by both the
// desktop mega menu (`MegaMenu`) and the mobile drawer (`MobileNav`).
//
// To add a new tool category:
//   1. Add a new group below with a unique `label` and `index` route.
//   2. Add links — make sure every `href` corresponds to a real route under
//      `app/`. The Header verifies links exist at build time via TypeScript
//      paths, but missing routes only fail at runtime, so double-check.
//   3. (Optional) Tag a link with `comingSoon: true` to render it as a
//      disabled "Coming soon" pill instead of an active link.
// =============================================================================

export interface NavLink {
  href: string;
  label: string;
  /** Short description shown in the mega menu under the link label. */
  description?: string;
  /** Render as a disabled "Coming soon" entry instead of a navigation link. */
  comingSoon?: boolean;
}

export interface NavGroup {
  label: string;
  /** Landing page that lists all tools in this category. */
  index: string;
  /** Short tagline displayed under the group title in the mega menu. */
  tagline?: string;
  links: NavLink[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Coding",
    index: "/coding-tools",
    tagline: "Generators & helpers for engineers",
    links: [
      { href: "/coding-tools", label: "All coding tools" },
      { href: "/tools/coding/snippet", label: "Code Snippet Generator" },
      { href: "/tools/coding/regex", label: "Regex Builder" },
      { href: "/tools/coding/json-formatter", label: "JSON Formatter" },
      { href: "/tools/coding/api-builder", label: "API Request Builder" },
      { href: "/tools/coding/actions-generator", label: "GitHub Actions Generator" },
      { href: "/tools/coding/readme-generator", label: "README Generator" },
      { href: "/tools/coding/commit-message", label: "Commit Message Generator" },
      { href: "/tools/coding/bug-report", label: "Bug Report Generator" },
      { href: "/tools/coding/changelog", label: "Changelog Generator" },
      { href: "/tools/coding/code-review-checklist", label: "Code Review Checklist" },
    ],
  },
  {
    label: "IT Admin",
    index: "/it-admin-tools",
    tagline: "Onboarding, offboarding & day-2 ops",
    links: [
      { href: "/it-admin-tools", label: "All IT admin tools" },
      { href: "/tools/m365/new-starter", label: "New Starter Builder" },
      { href: "/tools/m365/leaver", label: "Leaver Builder" },
      { href: "/tools/it-admin/shared-mailbox", label: "Shared Mailbox Request" },
      { href: "/tools/it-admin/licence-planner", label: "M365 Licence Planner" },
      { href: "/tools/it-admin/access-review", label: "User Access Review" },
      { href: "/tools/it-admin/ticket-triage", label: "Ticket Triage" },
      { href: "/tools/it-admin/device-build", label: "Device Build Checklist" },
      { href: "/tools/it-admin/software-install", label: "Software Install Checklist" },
    ],
  },
  {
    label: "Web Tools",
    index: "/web-tools",
    tagline: "Launch, QA & website testing",
    links: [
      { href: "/web-tools", label: "All web tools" },
      { href: "/tools/launch-checklist", label: "Launch Checklist" },
      { href: "/tools/website-status", label: "Website Status" },
      { href: "/tools/automated-monitoring", label: "Automated Monitoring Hub", description: "Server-side uptime, forms, DNS & MXToolbox with mock storage." },
      { href: "/tools/redirect-trace", label: "URL Redirect Tracer" },
      { href: "/tools/broken-links", label: "Broken Link Checker" },
      { href: "/tools/meta-preview", label: "Meta Title/Description" },
      { href: "/tools/qa/seo-meta", label: "SEO Meta Tag Checker" },
      { href: "/tools/qa/accessibility", label: "Accessibility Checklist" },
      { href: "/tools/page-speed-checklist", label: "Page Speed Checklist" },
      { href: "/tools/mobile-responsiveness", label: "Mobile Responsiveness" },
      { href: "/tools/form-testing-checklist", label: "Form Testing Checklist" },
      { href: "/tools/form-test-plan", label: "Form Test Plan" },
    ],
  },
  {
    label: "Cyber",
    index: "/cyber-tools",
    tagline: "Threat intel, hardening & response",
    links: [
      { href: "/cyber-tools", label: "All cyber tools" },
      { href: "/tools/security/password-advisor", label: "Password Strength Advisor" },
      { href: "/tools/security/phishing-link", label: "Phishing Link Analyser" },
      { href: "/tools/security/firewall-rules", label: "Firewall Rule Generator" },
      { href: "/tools/security/incident-report", label: "Security Incident Report" },
      { href: "/tools/security/domain-reputation", label: "Domain Reputation (API)" },
      { href: "/tools/ip-lookup", label: "IP Reputation" },
      { href: "/tools/domain-lookup", label: "Domain Reputation" },
      { href: "/tools/phishing-email-analyser", label: "Phishing Email Analyser" },
      { href: "/tools/password-strength", label: "Password Strength" },
      { href: "/tools/email-security-checklist", label: "Email Security Checklist" },
      { href: "/tools/phishing-url-checklist", label: "Phishing URL Heuristics" },
      { href: "/tools/suspicious-url", label: "Suspicious URL Checker" },
      { href: "/tools/security-headers", label: "Security Headers" },
      { href: "/tools/ssl-checker", label: "SSL Certificate" },
      { href: "/tools/ssl-checklist", label: "SSL Renewal Checklist" },
      { href: "/tools/dns-lookup", label: "DNS Lookup" },
      { href: "/tools/dns-security-checklist", label: "DNS Security Checklist" },
      { href: "/tools/incident-response", label: "Incident Response" },
      { href: "/tools/port-scanner", label: "Port Scan (info)" },
    ],
  },
  {
    label: "Microsoft 365",
    index: "/m365-tools",
    tagline: "Entra, Defender, Intune & more",
    links: [
      { href: "/m365-tools", label: "All M365 tools" },
      { href: "/tools/m365/licence-checker", label: "Licence Checker" },
      { href: "/tools/m365/new-starter", label: "New Starter Checklist" },
      { href: "/tools/m365/leaver", label: "Leaver Checklist" },
      { href: "/tools/m365/mfa-readiness", label: "MFA Readiness" },
      { href: "/tools/m365/mfa-status", label: "MFA Status Checker" },
      { href: "/tools/m365/conditional-access", label: "CA Baseline" },
      { href: "/tools/m365/ca-policy-builder", label: "CA Policy Builder" },
      { href: "/tools/m365/safe-links", label: "Safe Links Explainer" },
      { href: "/tools/m365/forwarding-audit", label: "Email Forwarding Audit" },
      { href: "/tools/m365/admin-role-review", label: "Admin Role Review" },
      { href: "/tools/m365/intune-compliance", label: "Intune Compliance" },
      { href: "/tools/m365/incident-response", label: "Incident Response Report" },
      { href: "/tools/m365/teams-phone", label: "Teams Phone Setup" },
      { href: "/tools/m365/intune-onboarding", label: "Intune Onboarding" },
      { href: "/tools/m365/device-readiness", label: "Device Readiness" },
      { href: "/tools/m365/defender-baseline", label: "Defender Baseline" },
    ],
  },
  {
    label: "Domain / IP",
    index: "/domain-ip-tools",
    tagline: "WHOIS, DNS, geo & deliverability",
    links: [
      { href: "/domain-ip-tools", label: "All domain & IP tools" },
      { href: "/tools/automated-monitoring", label: "Automated Monitoring Hub", description: "DNS bundles, MXToolbox proxy & blacklist context." },
      { href: "/tools/whois", label: "WHOIS / RDAP" },
      { href: "/tools/dns-lookup", label: "DNS Lookup" },
      { href: "/tools/subdomains", label: "Subdomain Finder" },
      { href: "/tools/geo-lookup", label: "IP Geolocation" },
      { href: "/tools/blacklist", label: "Blacklist Check" },
      { href: "/tools/blacklist-monitor", label: "Blacklist Monitor Plan" },
      { href: "/tools/email-deliverability", label: "Email Deliverability" },
      { href: "/tools/redirect-trace", label: "Redirect Tracer" },
      { href: "/tools/domain-protection", label: "Domain Protection" },
    ],
  },
  {
    label: "Automation",
    index: "/automation-tools",
    tagline: "CI/CD, Power Automate, API planners",
    links: [
      { href: "/automation-tools", label: "All automation tools" },
      { href: "/tools/automation/daily-test-planner", label: "Daily Test Planner" },
      { href: "/tools/automation/lead-form-qa", label: "Lead Form QA" },
      { href: "/tools/automation/github-actions", label: "GitHub Actions Schedule" },
      { href: "/tools/automated-monitoring", label: "Automated Monitoring Hub", description: "Phone, uptime, forms, DNS, MXToolbox & search — server-side only." },
      { href: "/tools/automation/api-key-safety", label: "API Key Safety" },
      { href: "/tools/automation/vercel-env-guide", label: "Vercel Env Vars" },
      { href: "/tools/automation/power-automate", label: "Power Automate Planner" },
      { href: "/tools/automation/api-integration-planner", label: "API Integration Planner" },
      { href: "/tools/api-tester", label: "API Tester" },
      { href: "/tools/keyforge", label: "KeyForge" },
    ],
  },
  {
    label: "Business",
    index: "/business-tools",
    tagline: "Comms, SOPs & vendor management",
    links: [
      { href: "/business-tools", label: "All business tools" },
      { href: "/tools/business/email", label: "Email Generator" },
      { href: "/tools/business/meeting-notes", label: "Meeting Notes Generator" },
      { href: "/tools/business/project-update", label: "Project Update Generator" },
      { href: "/tools/business/sop", label: "SOP Generator" },
      { href: "/tools/business/risk-register", label: "Risk Register Builder" },
      { href: "/tools/business/ticket-priority", label: "Ticket Priority" },
      { href: "/tools/business/root-cause", label: "Root Cause Analysis" },
      { href: "/tools/business/change-request", label: "Change Request" },
      { href: "/tools/business/asset-handover", label: "Asset Handover" },
      { href: "/tools/business/vendor-comparison", label: "Vendor Comparison" },
    ],
  },
  {
    label: "Reporting",
    index: "/reporting-tools",
    tagline: "Security, IT & automation reports",
    links: [
      { href: "/reporting-tools", label: "All reporting tools" },
      { href: "/tools/reporting/security-report", label: "Security Report" },
      { href: "/tools/reporting/monthly-it-summary", label: "Monthly IT Summary" },
      { href: "/tools/reporting/qa-report", label: "QA Report" },
      { href: "/tools/reporting/automation-roi", label: "Automation ROI" },
    ],
  },
  {
    label: "Phone / Lead",
    index: "/lead-tools",
    tagline: "Phone, lead & form intelligence",
    links: [
      { href: "/lead-tools", label: "All phone & lead tools" },
      { href: "/tools/phone-lookup", label: "Phone Validator" },
      { href: "/tools/automated-monitoring", label: "Automated Monitoring Hub", description: "Phone, forms & deliverability checks (server-side)." },
      { href: "/tools/lead-intelligence", label: "Lead Intelligence" },
      { href: "/tools/automation/lead-form-qa", label: "Lead Form QA Checklist" },
      { href: "/tools/form-tester", label: "Form Tester" },
      { href: "/tools/email-headers", label: "Email Headers" },
    ],
  },
];

// Simple top-level routes that don't need a mega menu panel.
export const SIMPLE_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "All Tools" },
  { href: "/pricing", label: "Pricing" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/about", label: "About" },
];

// =============================================================================
// Site tools catalog — single source for mega menu, mobile nav, search index,
// category pages, and homepage tool cards.
// =============================================================================

/** Navigation link shape (mega menu + mobile drawer). */
export interface NavLink {
  href: string;
  label: string;
  description?: string;
  comingSoon?: boolean;
}

export interface NavGroup {
  label: string;
  index: string;
  tagline?: string;
  links: NavLink[];
  maxFeaturedLinks?: number;
}

/** Compact primary bar — secondary routes live under Tools. */
export const TOP_BAR_LINKS: NavLink[] = [
  { href: "/", label: "Home", description: "SecureScope home" },
  { href: "/automation-tools", label: "Automation", description: "CI/CD, monitoring & integration planners" },
  { href: "/dashboard", label: "Dashboards", description: "Saved scans, alerts & workspace" },
];

/** Canonical mega-menu / search category labels (8 groups). */
export const MEGA_GROUP_LABELS = [
  "Website Testing Tools",
  "Domain & DNS Tools",
  "Security Tools",
  "Marketing Tools",
  "Automation Tools",
  "Coding/Developer Tools",
  "AI Tools",
  "Business/Productivity Tools",
] as const;

export type MegaGroupLabel = (typeof MEGA_GROUP_LABELS)[number];

export interface SiteTool {
  href: string;
  label: string;
  description: string;
  megaGroup: MegaGroupLabel;
  /** Sort order within the mega group (lower first). */
  megaOrder: number;
  /** Search + filter keywords (lowercase tokens). */
  keywords: string[];
  /** Short tag shown on cards (e.g. “DNS”, “Security”). */
  categoryTag: string;
  /** Optional vendor / mode badge. */
  badge?: string;
  comingSoon?: boolean;
  /** Homepage / sidebar highlights */
  featured?: boolean;
  recentlyAdded?: boolean;
  mostUseful?: boolean;
  /** Category index “why” blurb */
  why?: string;
  skill?: string;
}

export interface MegaGroupSpec {
  label: MegaGroupLabel;
  index: string;
  tagline: string;
  /** Phosphor icon name for menus */
  icon: "Globe" | "TreeStructure" | "ShieldCheck" | "Megaphone" | "GearSix" | "Code" | "Sparkle" | "Briefcase";
  maxFeaturedLinks?: number;
}

export const MEGA_GROUP_SPECS: MegaGroupSpec[] = [
  {
    label: "Website Testing Tools",
    index: "/web-tools",
    tagline: "Launch QA, forms, performance, and UX",
    icon: "Globe",
    maxFeaturedLinks: 8,
  },
  {
    label: "Domain & DNS Tools",
    index: "/domain-ip-tools",
    tagline: "WHOIS, DNS, mail paths, and reputation context",
    icon: "TreeStructure",
    maxFeaturedLinks: 8,
  },
  {
    label: "Security Tools",
    index: "/cyber-tools",
    tagline: "Threat checks, hardening, and incident helpers",
    icon: "ShieldCheck",
    maxFeaturedLinks: 8,
  },
  {
    label: "Marketing Tools",
    index: "/marketing-tools",
    tagline: "Campaigns, SEO, social, and conversion",
    icon: "Megaphone",
    maxFeaturedLinks: 8,
  },
  {
    label: "Automation Tools",
    index: "/automation-tools",
    tagline: "CI/CD, monitoring, and integration safety",
    icon: "GearSix",
    maxFeaturedLinks: 8,
  },
  {
    label: "Coding/Developer Tools",
    index: "/coding-tools",
    tagline: "Snippets, APIs, repos, and shipping hygiene",
    icon: "Code",
    maxFeaturedLinks: 8,
  },
  {
    label: "AI Tools",
    index: "/tools/ai-assistant",
    tagline: "Assistants, prompts, and automated analysis",
    icon: "Sparkle",
    maxFeaturedLinks: 8,
  },
  {
    label: "Business/Productivity Tools",
    index: "/business-tools",
    tagline: "M365, IT ops, reporting, and workspace",
    icon: "Briefcase",
    maxFeaturedLinks: 8,
  },
];

function slugKeywords(...parts: string[]): string[] {
  const out = new Set<string>();
  for (const p of parts) {
    for (const raw of p.toLowerCase().split(/[^a-z0-9]+/i)) {
      const t = raw.trim();
      if (t.length > 1) out.add(t);
    }
  }
  return [...out];
}

function megaGroupForHref(href: string): MegaGroupLabel {
  if (href === "/tools/automation/lead-form-qa") {
    return "Website Testing Tools";
  }
  if (
    href === "/web-tools" ||
    href.startsWith("/tools/launch") ||
    href === "/tools/website-status" ||
    href === "/tools/redirect-trace" ||
    href === "/tools/broken-links" ||
    href === "/tools/meta-preview" ||
    href.startsWith("/tools/qa/") ||
    href === "/tools/page-speed-checklist" ||
    href === "/tools/mobile-responsiveness" ||
    href.startsWith("/tools/form") ||
    href === "/tools/uptime-checker" ||
    href === "/tools/page-speed-checker" ||
    href === "/tools/sitemap-checker" ||
    href === "/tools/website-form-tester" ||
    href === "/tools/url-safety-checker" ||
    href === "/tools/seo-meta-checker" ||
    href === "/tools/keyword-checker"
  ) {
    return "Website Testing Tools";
  }

  if (
    href === "/domain-ip-tools" ||
    href === "/tools/whois" ||
    href === "/tools/dns-lookup" ||
    href === "/tools/subdomains" ||
    href === "/tools/geo-lookup" ||
    href === "/tools/email-deliverability" ||
    href === "/tools/domain-protection" ||
    href === "/tools/email-headers" ||
    href === "/tools/mx-dns-checker" ||
    href === "/tools/domain-reputation-checker" ||
    href === "/tools/domain-lookup" ||
    href === "/tools/security/domain-reputation" ||
    href === "/tools/phone-line-tester" ||
    href === "/tools/email-header-analyser"
  ) {
    return "Domain & DNS Tools";
  }

  if (
    href === "/cyber-tools" ||
    href === "/tools" ||
    href.startsWith("/tools/security/") ||
    href === "/tools/password-strength" ||
    href === "/tools/phishing-email-analyser" ||
    href === "/tools/email-security-checklist" ||
    href === "/tools/phishing-url-checklist" ||
    href === "/tools/suspicious-url" ||
    href === "/tools/security-headers" ||
    href.startsWith("/tools/ssl") ||
    href === "/tools/dns-security-checklist" ||
    href === "/tools/incident-response" ||
    href === "/tools/port-scanner" ||
    href === "/tools/url-analysis" ||
    href === "/tools/threat-score" ||
    href === "/tools/blacklist" ||
    href === "/tools/blacklist-monitor" ||
    href === "/tools/ip-lookup" ||
    href === "/tools/ip-reputation-checker" ||
    href === "/tools/ssl-certificate-checker"
  ) {
    return "Security Tools";
  }

  if (
    href === "/marketing-tools" ||
    (href.startsWith("/tools/marketing/") &&
      href !== "/tools/marketing/roas-calculator" &&
      href !== "/tools/marketing/conversion-rate-calculator") ||
    href === "/tools/marketing-campaign-planner" ||
    href === "/tools/social-post-generator" ||
    href === "/tools/email-subject-line-tester"
  ) {
    return "Marketing Tools";
  }

  if (href === "/tools/marketing/roas-calculator" || href === "/tools/marketing/conversion-rate-calculator") {
    return "Marketing Tools";
  }

  if (
    href === "/automation-tools" ||
    href === "/tools/automated-monitoring" ||
    href.startsWith("/tools/automation/") ||
    href === "/tools/api-env-checklist"
  ) {
    return "Automation Tools";
  }

  if (
    href === "/coding-tools" ||
    href.startsWith("/tools/coding/") ||
    href === "/tools/api-tester" ||
    href === "/tools/keyforge" ||
    href === "/tools/github-repo-health" ||
    href === "/tools/code-snippet-library"
  ) {
    return "Coding/Developer Tools";
  }

  if (
    href === "/tools/ai-assistant" ||
    href === "/tools/ai-report" ||
    href === "/tools/agent-scan" ||
    href === "/tools/ai-prompt-generator"
  ) {
    return "AI Tools";
  }

  return "Business/Productivity Tools";
}

function categoryTagForGroup(g: MegaGroupLabel): string {
  switch (g) {
    case "Website Testing Tools":
      return "Web QA";
    case "Domain & DNS Tools":
      return "DNS";
    case "Security Tools":
      return "Security";
    case "Marketing Tools":
      return "Marketing";
    case "Automation Tools":
      return "Automation";
    case "Coding/Developer Tools":
      return "Developer";
    case "AI Tools":
      return "AI";
    default:
      return "Productivity";
  }
}

/** Curated rows (order = default mega-menu order within inferred group). */
const RAW_TOOLS: Array<
  Omit<SiteTool, "megaGroup" | "megaOrder" | "keywords" | "categoryTag"> & { megaGroup?: MegaGroupLabel }
> = [
  // —— Website testing ——
  { href: "/web-tools", label: "Website testing hub", description: "Launch, QA, performance, and forms.", featured: true },
  { href: "/tools/launch-checklist", label: "Launch Checklist", description: "Pre-flight checks before go-live." },
  { href: "/tools/website-status", label: "Website Status", description: "Reachability and basic health signals.", mostUseful: true },
  { href: "/tools/redirect-trace", label: "URL Redirect Tracer", description: "Follow chains and final destinations." },
  { href: "/tools/broken-links", label: "Broken Link Checker", description: "Spot 404s and bad transports.", mostUseful: true },
  { href: "/tools/meta-preview", label: "Meta Title / Description", description: "Length-aware SERP snippet preview." },
  { href: "/tools/qa/seo-meta", label: "SEO Meta Tag Checker", description: "Structured pass on indexability tags." },
  { href: "/tools/qa/accessibility", label: "Accessibility Checklist", description: "WCAG-oriented manual QA prompts." },
  { href: "/tools/page-speed-checklist", label: "Page Speed Checklist", description: "Core Web Vitals and perf hygiene." },
  { href: "/tools/mobile-responsiveness", label: "Mobile Responsiveness", description: "Viewport and touch UX review." },
  { href: "/tools/form-testing-checklist", label: "Form Testing Checklist", description: "Validation, errors, and analytics hooks." },
  { href: "/tools/form-test-plan", label: "Form Test Plan", description: "Plan coverage for critical flows." },
  { href: "/tools/form-tester", label: "Form Tester", description: "Field-level functional passes via hardened relay." },
  { href: "/tools/automation/lead-form-qa", label: "Lead Form QA", description: "Marketing form quality checklist." },
  { href: "/tools/website-form-tester", label: "Website Form Tester", description: "Structured passes for multi-step forms.", recentlyAdded: true },
  { href: "/tools/uptime-checker", label: "Uptime Checker", description: "Reachability windows and alert-ready notes.", recentlyAdded: true },
  { href: "/tools/page-speed-checker", label: "Page Speed Checker", description: "Lab-style checklist for LCP, CLS, and TTFB.", recentlyAdded: true },
  { href: "/tools/sitemap-checker", label: "Sitemap Checker", description: "Validate sitemap URLs and index signals.", recentlyAdded: true },
  { href: "/tools/url-safety-checker", label: "URL Safety Checker", description: "Heuristic checklist before opening unknown links.", recentlyAdded: true },
  { href: "/tools/seo-meta-checker", label: "SEO Meta Checker", description: "Titles, robots, canonical, and social cards.", recentlyAdded: true },
  { href: "/tools/keyword-checker", label: "Keyword Checker", description: "Density, intent, and cannibalisation prompts.", recentlyAdded: true },

  // —— Domain & DNS ——
  { href: "/domain-ip-tools", label: "Domain & IP hub", description: "WHOIS, DNS, geo, and mail paths.", featured: true },
  { href: "/tools/whois", label: "WHOIS / RDAP", description: "Registration and nameserver context." },
  { href: "/tools/dns-lookup", label: "DNS Lookup", description: "Record-level DNS inspection." },
  { href: "/tools/mx-dns-checker", label: "MX / DNS Checker", description: "Mail exchanger and SPF alignment checks.", recentlyAdded: true },
  { href: "/tools/subdomains", label: "Subdomain Finder", description: "Enumeration-friendly checklist." },
  { href: "/tools/geo-lookup", label: "IP Geolocation", description: "Geo hints without invasive probes." },
  { href: "/tools/email-deliverability", label: "Email Deliverability", description: "MX, SPF alignment, and bounce signals." },
  { href: "/tools/domain-protection", label: "Domain Protection", description: "Transfers, locks, and alerts." },
  { href: "/tools/email-headers", label: "Email Headers", description: "Authentication and routing forensics." },
  { href: "/tools/email-header-analyser", label: "Email Header Analyser", description: "Same toolkit with UK spelling route.", recentlyAdded: true },
  { href: "/tools/domain-lookup", label: "Domain Reputation", description: "High-signal intel cards.", mostUseful: true },
  { href: "/tools/security/domain-reputation", label: "Domain Reputation (API)", description: "Vendor-backed domain verdicts." },
  { href: "/tools/domain-reputation-checker", label: "Domain Reputation Checker", description: "Checklist + links into the live suite.", recentlyAdded: true },
  { href: "/tools/phone-line-tester", label: "Phone Line Tester", description: "PSTN, IVR, and escalation test scripts.", recentlyAdded: true },

  // —— Security ——
  { href: "/cyber-tools", label: "Security hub", description: "Hardening, phishing, and incident helpers.", featured: true },
  { href: "/tools", label: "Security suite overview", description: "Combined scan entry and modules." },
  { href: "/tools/security/password-advisor", label: "Password Strength Advisor", description: "Policy-aware password review.", mostUseful: true },
  { href: "/tools/security/phishing-link", label: "Phishing Link Analyser", description: "URL heuristics and signals." },
  { href: "/tools/security/firewall-rules", label: "Firewall Rule Generator", description: "Readable rule drafts." },
  { href: "/tools/security/incident-report", label: "Security Incident Report", description: "Structured IR narrative." },
  { href: "/tools/ip-lookup", label: "IP Reputation", description: "Abuse and ASN context.", mostUseful: true },
  { href: "/tools/ip-reputation-checker", label: "IP Reputation Checker", description: "Focused checklist around ASN and abuse.", recentlyAdded: true },
  { href: "/tools/phishing-email-analyser", label: "Phishing Email Analyser", description: "Headers and content heuristics." },
  { href: "/tools/password-strength", label: "Password Strength", description: "Entropy and pattern checks." },
  { href: "/tools/email-security-checklist", label: "Email Security Checklist", description: "SPF, DKIM, and DMARC hygiene." },
  { href: "/tools/phishing-url-checklist", label: "Phishing URL Heuristics", description: "Manual URL review prompts." },
  { href: "/tools/suspicious-url", label: "Suspicious URL Checker", description: "Quick verdict scaffolding." },
  { href: "/tools/security-headers", label: "Security Headers", description: "HTTP security header review." },
  { href: "/tools/ssl-checker", label: "SSL Certificate Checker", description: "Chain, expiry, and cipher notes." },
  { href: "/tools/ssl-certificate-checker", label: "SSL Certificate Checker (alias)", description: "Portfolio-friendly entry to the SSL module.", recentlyAdded: true },
  { href: "/tools/ssl-checklist", label: "SSL Renewal Checklist", description: "Renewal comms and owners." },
  { href: "/tools/dns-security-checklist", label: "DNS Security Checklist", description: "DNSSEC and delegation hygiene." },
  { href: "/tools/incident-response", label: "Incident Response", description: "Generic IR runbook prompts." },
  { href: "/tools/port-scanner", label: "Port Scan (info)", description: "Educational port exposure notes." },
  { href: "/tools/url-analysis", label: "URL Analysis", description: "Deep link analysis with redirect context." },
  { href: "/tools/threat-score", label: "Threat Score", description: "Composite risk scoring for domains and URLs." },
  { href: "/tools/blacklist", label: "Blacklist Checker", description: "DNSBL-style reputation signals." },
  { href: "/tools/blacklist-monitor", label: "Blacklist Monitor Plan", description: "Operational monitoring checklist." },

  // —— Marketing ——
  { href: "/marketing-tools", label: "Marketing hub", description: "Searchable marketing toolkit.", featured: true },
  { href: "/tools/marketing/utm-builder", label: "UTM Builder", description: "Tagged URLs for clean attribution." },
  { href: "/tools/marketing/blog-title-generator", label: "Blog Title Generator", description: "Angles and curiosity hooks." },
  { href: "/tools/marketing/subject-line-generator", label: "Subject Line Generator", description: "Inbox-aware subject lines." },
  { href: "/tools/marketing/linkedin-post-generator", label: "LinkedIn Post Generator", description: "Professional hooks and CTAs." },
  { href: "/tools/meta-preview", label: "SERP / Meta Preview", description: "Title and description length tooling." },
  { href: "/tools/marketing/roas-calculator", label: "ROAS Calculator", description: "Return on ad spend math." },
  { href: "/tools/marketing/conversion-rate-calculator", label: "Conversion Rate Calculator", description: "Funnel conversion percentages." },
  { href: "/tools/marketing-campaign-planner", label: "Marketing Campaign Planner", description: "Objectives, channels, and measurement grid.", recentlyAdded: true },
  { href: "/tools/social-post-generator", label: "Social Media Post Generator", description: "Hooks per platform with CTA prompts.", recentlyAdded: true },
  { href: "/tools/email-subject-line-tester", label: "Email Subject Line Tester", description: "Length, power words, and preview text.", recentlyAdded: true },

  // —— Automation ——
  { href: "/automation-tools", label: "Automation hub", description: "Pipelines, planners, and API safety.", featured: true },
  { href: "/tools/automated-monitoring", label: "Automated Monitoring Hub", description: "Uptime, forms, DNS, and phone checks." },
  { href: "/tools/automation/daily-test-planner", label: "Daily Test Planner", description: "Recurring smoke and regression plan." },
  { href: "/tools/automation/github-actions", label: "GitHub Actions Schedule", description: "Cron and workflow hygiene." },
  { href: "/tools/automation/api-key-safety", label: "API Key Safety", description: "Secrets handling checklist." },
  { href: "/tools/automation/vercel-env-guide", label: "Vercel Env Vars", description: "Environment promotion guide." },
  { href: "/tools/automation/power-automate", label: "Power Automate Planner", description: "Connectors and guardrails." },
  { href: "/tools/automation/api-integration-planner", label: "API Integration Planner", description: "Contracts and failure modes." },
  { href: "/tools/api-env-checklist", label: "API Key & Env Checklist", description: "Rotation, scopes, and CI/CD hygiene.", recentlyAdded: true },

  // —— AI ——
  { href: "/tools/ai-assistant", label: "AI Assistant", description: "Guided analysis chat for investigations.", featured: true },
  { href: "/tools/ai-report", label: "AI Report", description: "Narrative summaries from scan context." },
  { href: "/tools/agent-scan", label: "Agent Scan", description: "Orchestrated multi-step scan flows." },
  { href: "/tools/ai-prompt-generator", label: "AI Prompt Generator", description: "Role, constraints, and eval-ready prompts.", recentlyAdded: true },

  // —— Coding / developer ——
  { href: "/coding-tools", label: "Coding utilities hub", description: "Generators and engineering helpers.", featured: true },
  { href: "/tools/api-tester", label: "API Tester", description: "Compose requests with saved presets." },
  { href: "/tools/keyforge", label: "KeyForge", description: "Secrets and random material helpers." },
  { href: "/tools/coding/snippet", label: "Code Snippet Generator", description: "Shareable snippets with language tags.", mostUseful: true },
  { href: "/tools/code-snippet-library", label: "Code Snippet Library", description: "Curated starters mapped to the snippet lab.", recentlyAdded: true },
  { href: "/tools/github-repo-health", label: "GitHub Repo Health Checker", description: "Branch protection, releases, and docs gaps.", recentlyAdded: true },
  { href: "/tools/coding/regex", label: "Regex Builder", description: "Interactive pattern scaffolding." },
  { href: "/tools/coding/json-formatter", label: "JSON Formatter", description: "Pretty-print and minify JSON." },
  { href: "/tools/coding/api-builder", label: "API Request Builder", description: "cURL and fetch drafts." },
  { href: "/tools/coding/actions-generator", label: "GitHub Actions Generator", description: "Workflow YAML starters." },
  { href: "/tools/coding/readme-generator", label: "README Generator", description: "Repo readme skeletons." },
  { href: "/tools/coding/commit-message", label: "Commit Message Generator", description: "Conventional commit helper." },
  { href: "/tools/coding/bug-report", label: "Bug Report Generator", description: "Repro-ready bug templates." },
  { href: "/tools/coding/changelog", label: "Changelog Generator", description: "Release note scaffolding." },
  { href: "/tools/coding/code-review-checklist", label: "Code Review Checklist", description: "PR review prompts." },

  // —— Business / productivity ——
  { href: "/m365-tools", label: "Microsoft 365 hub", description: "Entra, Defender, Intune, and mail hygiene.", featured: true },
  { href: "/it-admin-tools", label: "IT admin hub", description: "Onboarding, tickets, and device workflows." },
  { href: "/business-tools", label: "Business comms hub", description: "Email, SOPs, risk, and vendor docs." },
  { href: "/reporting-tools", label: "Reporting hub", description: "Security, IT, and automation reports." },
  { href: "/lead-tools", label: "Lead & pipeline hub", description: "Phone, lead intel, and CRM-adjacent flows." },
  { href: "/tools/lead-intelligence", label: "Lead Intelligence", description: "Signals and enrichment checklist." },
  { href: "/tools/phone-lookup", label: "Phone Validator", description: "E.164 validation and carrier hints." },
  { href: "/tools/reporting/automation-roi", label: "Automation ROI", description: "Time saved and payback math." },
  { href: "/tools/business/vendor-comparison", label: "Vendor Comparison", description: "Side-by-side evaluation grid." },
  { href: "/tools/business/risk-register", label: "Risk Register Builder", description: "Likelihood and impact grid." },
  { href: "/tools/business/email", label: "Email Generator", description: "Stakeholder-ready drafts." },
  { href: "/tools/business/meeting-notes", label: "Meeting Notes Generator", description: "Structured recap templates." },
  { href: "/tools/business/project-update", label: "Project Update Generator", description: "Exec-friendly status packs." },
  { href: "/tools/business/sop", label: "SOP Generator", description: "Repeatable procedure drafts." },
  { href: "/tools/business/ticket-priority", label: "Ticket Priority", description: "Triage rubric for service desks." },
  { href: "/tools/business/root-cause", label: "Root Cause Analysis", description: "Five-whys style RCA prompts." },
  { href: "/tools/business/change-request", label: "Change Request", description: "Controlled change narrative." },
  { href: "/tools/business/asset-handover", label: "Asset Handover", description: "Hardware and access transfers." },
  { href: "/tools/reporting/security-report", label: "Security Report", description: "Monthly or ad-hoc sec summary." },
  { href: "/tools/reporting/monthly-it-summary", label: "Monthly IT Summary", description: "Ops KPI narrative." },
  { href: "/tools/reporting/qa-report", label: "QA Report", description: "Release quality rollup." },
  { href: "/tools/m365/new-starter", label: "New Starter Checklist", description: "Day-one access and comms." },
  { href: "/tools/m365/leaver", label: "Leaver Checklist", description: "Offboarding and access removal." },
  { href: "/tools/m365/licence-checker", label: "Licence Checker", description: "SKU sanity and cost signals." },
  { href: "/tools/m365/mfa-readiness", label: "MFA Readiness", description: "Rollout blockers and comms pack." },
  { href: "/tools/m365/mfa-status", label: "MFA Status Checker", description: "Coverage heuristics per identity." },
  { href: "/tools/m365/conditional-access", label: "CA Baseline", description: "Conditional Access guardrails." },
  { href: "/tools/m365/ca-policy-builder", label: "CA Policy Builder", description: "Draft policies with rationale." },
  { href: "/tools/m365/safe-links", label: "Safe Links Explainer", description: "Time-of-click protection primer." },
  { href: "/tools/m365/forwarding-audit", label: "Email Forwarding Audit", description: "Suspicious routing patterns." },
  { href: "/tools/m365/admin-role-review", label: "Admin Role Review", description: "Least-privilege role passes." },
  { href: "/tools/m365/intune-compliance", label: "Intune Compliance", description: "Device posture expectations." },
  { href: "/tools/m365/incident-response", label: "M365 Incident Response", description: "Tenant-scoped IR template." },
  { href: "/tools/m365/teams-phone", label: "Teams Phone Setup", description: "PSTN and policy checklist." },
  { href: "/tools/m365/intune-onboarding", label: "Intune Onboarding", description: "Enrollment and profiles." },
  { href: "/tools/m365/device-readiness", label: "Device Readiness", description: "Pre-deploy hardware checks." },
  { href: "/tools/m365/defender-baseline", label: "Defender Baseline", description: "Endpoint hardening prompts." },
  { href: "/tools/it-admin/shared-mailbox", label: "Shared Mailbox Request", description: "Governed mailbox requests." },
  { href: "/tools/it-admin/licence-planner", label: "M365 Licence Planner", description: "Seat planning worksheet." },
  { href: "/tools/it-admin/access-review", label: "User Access Review", description: "Periodic access certification." },
  { href: "/tools/it-admin/ticket-triage", label: "Ticket Triage", description: "Severity and routing prompts." },
  { href: "/tools/it-admin/device-build", label: "Device Build Checklist", description: "Golden image verification." },
  { href: "/tools/it-admin/software-install", label: "Software Install Checklist", description: "Packaging and approvals." },
  { href: "/settings", label: "Settings", description: "Account, workspace, and preferences." },
  { href: "/pricing", label: "Pricing", description: "Plans and usage limits." },
  { href: "/enterprise", label: "Enterprise", description: "Teams, security review, and pilots." },
  { href: "/projects", label: "Projects", description: "Curated starter flows across the toolkit." },
  { href: "/about", label: "About", description: "Platform, stack, and security posture." },
  { href: "/contact", label: "Contact", description: "Reach the team and sales." },
  { href: "/dashboard", label: "Dashboard overview", description: "Primary dashboard landing." },
  { href: "/dashboard/monitoring", label: "Monitoring", description: "Targets and uptime-style views." },
  { href: "/dashboard/alerts", label: "Alerts", description: "Triggered findings inbox." },
  { href: "/dashboard/reports", label: "Reports", description: "Exported and saved summaries." },
  { href: "/dashboard/history", label: "History", description: "Past scans and lookups." },
  { href: "/dashboard/saved", label: "Saved", description: "Bookmarked assets and notes." },
  { href: "/dashboard/activity", label: "Activity", description: "Recent actions timeline." },
  { href: "/dashboard/cases", label: "Cases", description: "Investigation case files." },
  { href: "/dashboard/playbooks", label: "Playbooks", description: "Response procedure library." },
];

function buildSiteTools(): SiteTool[] {
  return RAW_TOOLS.map((row, idx) => {
    const megaGroup = row.megaGroup ?? megaGroupForHref(row.href);
    const categoryTag = categoryTagForGroup(megaGroup);
    const keywords = slugKeywords(row.label, row.description, megaGroup, categoryTag, row.href.replace(/^\//, "").replace(/\//g, " "));
    return {
      ...row,
      megaGroup,
      megaOrder: idx,
      keywords,
      categoryTag,
    };
  });
}

export const SITE_TOOLS: SiteTool[] = buildSiteTools();

/** Dedup by href (first wins). */
export function uniqueSiteTools(): SiteTool[] {
  const m = new Map<string, SiteTool>();
  for (const t of SITE_TOOLS) {
    if (!m.has(t.href)) m.set(t.href, t);
  }
  return [...m.values()];
}

export function toolsByMegaGroup(label: MegaGroupLabel): SiteTool[] {
  return uniqueSiteTools()
    .filter((t) => t.megaGroup === label)
    .sort((a, b) => a.megaOrder - b.megaOrder);
}

export function buildNavGroups(): NavGroup[] {
  return MEGA_GROUP_SPECS.map((spec) => {
    const tools = toolsByMegaGroup(spec.label);
    const links: NavLink[] = tools.map((t) => ({
      href: t.href,
      label: t.label,
      description: t.description,
      comingSoon: t.comingSoon,
    }));
    return {
      label: spec.label,
      index: spec.index,
      tagline: spec.tagline,
      maxFeaturedLinks: spec.maxFeaturedLinks,
      links,
    };
  });
}

export function featuredToolsList(limit = 8): SiteTool[] {
  const u = uniqueSiteTools();
  const featured = u.filter((t) => t.featured);
  const rest = u.filter((t) => !t.featured && t.mostUseful);
  const out = [...featured, ...rest];
  return out.slice(0, limit);
}

export function recentlyAddedToolsList(limit = 6): SiteTool[] {
  return uniqueSiteTools()
    .filter((t) => t.recentlyAdded)
    .sort((a, b) => b.megaOrder - a.megaOrder)
    .slice(0, limit);
}

export function mostUsefulToolsList(limit = 6): SiteTool[] {
  return uniqueSiteTools()
    .filter((t) => t.mostUseful)
    .sort((a, b) => a.megaOrder - b.megaOrder)
    .slice(0, limit);
}

export function categoryIndexTools(label: MegaGroupLabel) {
  return toolsByMegaGroup(label).map((t) => ({
    href: t.href,
    title: t.label,
    description: t.description,
    badge: t.badge ?? t.categoryTag,
    why: t.why,
    skill: t.skill,
  }));
}

/** Filter catalog entries for hub pages that are a subset of a mega group (e.g. M365 only). */
export function categoryCardsWhere(pred: (t: SiteTool) => boolean) {
  return uniqueSiteTools()
    .filter(pred)
    .sort((a, b) => a.megaOrder - b.megaOrder)
    .map((t) => ({
      href: t.href,
      title: t.label,
      description: t.description,
      badge: t.badge ?? t.categoryTag,
      why: t.why,
      skill: t.skill,
    }));
}

export const NAV_GROUPS: NavGroup[] = buildNavGroups();

// =============================================================================
// Navigation data
// -----------------------------------------------------------------------------
// Single source of truth for mega menu + mobile drawer. Top-level header links
// are defined separately in `TOP_BAR_LINKS` (see Header).
//
// Categories follow the product IA: website QA, corporate IT & security,
// automation, marketing, CRM/reports, phone & forms, domain intel, AI,
// dashboards, and developer/settings utilities.
// =============================================================================

export interface NavLink {
  href: string;
  label: string;
  description?: string;
  comingSoon?: boolean;
}

export interface NavGroup {
  label: string;
  /** Primary landing page for “View all …” in the mega menu. */
  index: string;
  tagline?: string;
  links: NavLink[];
  /** Optional: show more than the default number of featured links in mega menu. */
  maxFeaturedLinks?: number;
}

export const TOP_BAR_LINKS: NavLink[] = [
  { href: "/", label: "Home", description: "SecureScope home" },
  { href: "/automation-tools", label: "Automation", description: "CI/CD, monitoring & integration planners" },
  { href: "/dashboard", label: "Dashboards", description: "Saved scans, alerts & workspace" },
  { href: "/projects", label: "Projects", description: "Curated starter flows across the toolkit" },
  { href: "/about", label: "About", description: "Platform, stack & security posture" },
  { href: "/contact", label: "Contact", description: "Reach the team & sales" },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Website Tools",
    index: "/web-tools",
    tagline: "Launch, QA & on-site checks",
    maxFeaturedLinks: 7,
    links: [
      { href: "/web-tools", label: "All website tools", description: "Hub for launch, QA & performance utilities." },
      { href: "/tools/launch-checklist", label: "Launch Checklist", description: "Pre-flight checks before go-live." },
      { href: "/tools/website-status", label: "Website Status", description: "Reachability and basic health signals." },
      { href: "/tools/redirect-trace", label: "URL Redirect Tracer", description: "Follow chains and final destinations." },
      { href: "/tools/broken-links", label: "Broken Link Checker", description: "Spot 404s and bad transports." },
      { href: "/tools/meta-preview", label: "Meta Title / Description", description: "Length-aware SERP snippet preview." },
      { href: "/tools/qa/seo-meta", label: "SEO Meta Tag Checker", description: "Structured pass on indexability tags." },
      { href: "/tools/qa/accessibility", label: "Accessibility Checklist", description: "WCAG-oriented manual QA prompts." },
      { href: "/tools/page-speed-checklist", label: "Page Speed Checklist", description: "Core Web Vitals & perf hygiene." },
      { href: "/tools/mobile-responsiveness", label: "Mobile Responsiveness", description: "Viewport and touch UX review." },
      { href: "/tools/form-testing-checklist", label: "Form Testing Checklist", description: "Validation, errors & analytics hooks." },
      { href: "/tools/form-test-plan", label: "Form Test Plan", description: "Plan coverage for critical flows." },
    ],
  },
  {
    label: "IT & Security Tools",
    index: "/tools",
    tagline: "Admin workflows, M365 & threat surface",
    maxFeaturedLinks: 8,
    links: [
      { href: "/tools", label: "Security suite overview", description: "Domain/IP suite and combined scan entry." },
      { href: "/it-admin-tools", label: "IT admin hub", description: "Onboarding, tickets & device workflows." },
      { href: "/m365-tools", label: "Microsoft 365 hub", description: "Entra, Defender, Intune & mail hygiene." },
      { href: "/cyber-tools", label: "Cybersecurity hub", description: "Hardening, phishing & incident helpers." },
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
      { href: "/tools/security/password-advisor", label: "Password Strength Advisor", description: "Policy-aware password review." },
      { href: "/tools/security/phishing-link", label: "Phishing Link Analyser", description: "URL heuristics and signals." },
      { href: "/tools/security/firewall-rules", label: "Firewall Rule Generator", description: "Readable rule drafts." },
      { href: "/tools/security/incident-report", label: "Security Incident Report", description: "Structured IR narrative." },
      { href: "/tools/security/domain-reputation", label: "Domain Reputation (API)", description: "Vendor-backed domain verdicts." },
      { href: "/tools/ip-lookup", label: "IP Reputation", description: "Abuse and ASN context." },
      { href: "/tools/domain-lookup", label: "Domain Reputation", description: "High-signal intel cards." },
      { href: "/tools/phishing-email-analyser", label: "Phishing Email Analyser", description: "Headers and content heuristics." },
      { href: "/tools/password-strength", label: "Password Strength", description: "Entropy and pattern checks." },
      { href: "/tools/email-security-checklist", label: "Email Security Checklist", description: "SPF/DKIM/DMARC hygiene." },
      { href: "/tools/phishing-url-checklist", label: "Phishing URL Heuristics", description: "Manual URL review prompts." },
      { href: "/tools/suspicious-url", label: "Suspicious URL Checker", description: "Quick verdict scaffolding." },
      { href: "/tools/security-headers", label: "Security Headers", description: "HTTP security header review." },
      { href: "/tools/ssl-checker", label: "SSL Certificate", description: "Chain, expiry and cipher notes." },
      { href: "/tools/ssl-checklist", label: "SSL Renewal Checklist", description: "Renewal comms and owners." },
      { href: "/tools/dns-security-checklist", label: "DNS Security Checklist", description: "DNSSEC and delegation hygiene." },
      { href: "/tools/incident-response", label: "Incident Response", description: "Generic IR runbook prompts." },
      { href: "/tools/port-scanner", label: "Port Scan (info)", description: "Educational port exposure notes." },
    ],
  },
  {
    label: "Automation Tools",
    index: "/automation-tools",
    tagline: "CI/CD, monitoring & API safety",
    maxFeaturedLinks: 7,
    links: [
      { href: "/automation-tools", label: "All automation tools", description: "Hub for pipelines and planners." },
      { href: "/tools/automated-monitoring", label: "Automated Monitoring Hub", description: "Uptime, forms, DNS & phone checks." },
      { href: "/tools/automation/daily-test-planner", label: "Daily Test Planner", description: "Recurring smoke and regression plan." },
      { href: "/tools/automation/github-actions", label: "GitHub Actions Schedule", description: "Cron and workflow hygiene." },
      { href: "/tools/automation/api-key-safety", label: "API Key Safety", description: "Secrets handling checklist." },
      { href: "/tools/automation/vercel-env-guide", label: "Vercel Env Vars", description: "Environment promotion guide." },
      { href: "/tools/automation/power-automate", label: "Power Automate Planner", description: "Connectors and guardrails." },
      { href: "/tools/automation/api-integration-planner", label: "API Integration Planner", description: "Contracts and failure modes." },
      { href: "/tools/api-tester", label: "API Tester", description: "Compose requests with saved presets." },
      { href: "/tools/keyforge", label: "KeyForge", description: "Secrets and random material helpers." },
    ],
  },
  {
    label: "Marketing Tools",
    index: "/marketing-tools",
    tagline: "SEO, content, paid & analytics",
    maxFeaturedLinks: 8,
    links: [
      { href: "/marketing-tools", label: "All marketing tools", description: "Searchable marketing toolkit hub." },
      { href: "/tools/marketing/utm-builder", label: "UTM Builder", description: "Tagged URLs for clean attribution." },
      { href: "/tools/marketing/blog-title-generator", label: "Blog Title Generator", description: "Angles and curiosity hooks." },
      { href: "/tools/marketing/subject-line-generator", label: "Subject Line Generator", description: "Inbox-aware subject lines." },
      { href: "/tools/marketing/linkedin-post-generator", label: "LinkedIn Post Generator", description: "Professional hooks and CTAs." },
      { href: "/tools/marketing/roas-calculator", label: "ROAS Calculator", description: "Return on ad spend math." },
      { href: "/tools/marketing/conversion-rate-calculator", label: "Conversion Rate Calculator", description: "Funnel conversion percentages." },
      { href: "/tools/meta-preview", label: "SERP / Meta Preview", description: "Title and description length tooling." },
    ],
  },
  {
    label: "Lead & CRM Tools",
    index: "/lead-tools",
    tagline: "Pipeline, comms & executive summaries",
    maxFeaturedLinks: 7,
    links: [
      { href: "/lead-tools", label: "All lead & CRM tools", description: "Phone, lead intel and CRM-adjacent flows." },
      { href: "/business-tools", label: "Business comms hub", description: "Email, SOPs, risk and vendor docs." },
      { href: "/reporting-tools", label: "Reporting hub", description: "Security, IT and automation reports." },
      { href: "/tools/lead-intelligence", label: "Lead Intelligence", description: "Signals and enrichment checklist." },
      { href: "/tools/business/email", label: "Email Generator", description: "Stakeholder-ready drafts." },
      { href: "/tools/business/meeting-notes", label: "Meeting Notes Generator", description: "Structured recap templates." },
      { href: "/tools/business/project-update", label: "Project Update Generator", description: "Exec-friendly status packs." },
      { href: "/tools/business/sop", label: "SOP Generator", description: "Repeatable procedure drafts." },
      { href: "/tools/business/risk-register", label: "Risk Register Builder", description: "Likelihood and impact grid." },
      { href: "/tools/business/ticket-priority", label: "Ticket Priority", description: "Triage rubric for service desks." },
      { href: "/tools/business/root-cause", label: "Root Cause Analysis", description: "Five-whys style RCA prompts." },
      { href: "/tools/business/change-request", label: "Change Request", description: "Controlled change narrative." },
      { href: "/tools/business/asset-handover", label: "Asset Handover", description: "Hardware and access transfers." },
      { href: "/tools/business/vendor-comparison", label: "Vendor Comparison", description: "Side-by-side evaluation grid." },
      { href: "/tools/reporting/security-report", label: "Security Report", description: "Monthly or ad-hoc sec summary." },
      { href: "/tools/reporting/monthly-it-summary", label: "Monthly IT Summary", description: "Ops KPI narrative." },
      { href: "/tools/reporting/qa-report", label: "QA Report", description: "Release quality rollup." },
      { href: "/tools/reporting/automation-roi", label: "Automation ROI", description: "Time saved and payback math." },
    ],
  },
  {
    label: "Phone & Form Testing",
    index: "/tools/phone-lookup",
    tagline: "Telephony, forms & message forensics",
    links: [
      { href: "/tools/phone-lookup", label: "Phone Validator", description: "E.164 validation and carrier hints." },
      { href: "/tools/form-tester", label: "Form Tester", description: "Field-level functional passes." },
      { href: "/tools/automation/lead-form-qa", label: "Lead Form QA", description: "Marketing form quality checklist." },
      { href: "/tools/email-headers", label: "Email Headers", description: "Authentication and routing forensics." },
    ],
  },
  {
    label: "Domain & Reputation Tools",
    index: "/domain-ip-tools",
    tagline: "WHOIS, DNS, blacklists & deliverability",
    links: [
      { href: "/domain-ip-tools", label: "All domain & IP tools", description: "WHOIS, DNS, geo and mail paths." },
      { href: "/tools/whois", label: "WHOIS / RDAP", description: "Registration and nameserver context." },
      { href: "/tools/dns-lookup", label: "DNS Lookup", description: "Record-level DNS inspection." },
      { href: "/tools/subdomains", label: "Subdomain Finder", description: "Enumeration-friendly checklist." },
      { href: "/tools/geo-lookup", label: "IP Geolocation", description: "Geo hints without invasive probes." },
      { href: "/tools/blacklist", label: "Blacklist Check", description: "DNSBL-style reputation signals." },
      { href: "/tools/blacklist-monitor", label: "Blacklist Monitor Plan", description: "Operational monitoring checklist." },
      { href: "/tools/email-deliverability", label: "Email Deliverability", description: "MX, SPF alignment and bounces." },
      { href: "/tools/domain-protection", label: "Domain Protection", description: "Transfers, locks and alerts." },
    ],
  },
  {
    label: "AI Tools",
    index: "/tools/ai-assistant",
    tagline: "Assistants and automated analysis",
    links: [
      { href: "/tools/ai-assistant", label: "AI Assistant", description: "Guided analysis chat for investigations." },
      { href: "/tools/ai-report", label: "AI Report", description: "Narrative summaries from scan context." },
      { href: "/tools/agent-scan", label: "Agent Scan", description: "Orchestrated multi-step scan flows." },
    ],
  },
  {
    label: "Dashboards",
    index: "/dashboard",
    tagline: "Workspace views (sign-in required)",
    links: [
      { href: "/dashboard", label: "Overview", description: "Primary dashboard landing." },
      { href: "/dashboard/monitoring", label: "Monitoring", description: "Targets and uptime-style views." },
      { href: "/dashboard/alerts", label: "Alerts", description: "Triggered findings inbox." },
      { href: "/dashboard/reports", label: "Reports", description: "Exported and saved summaries." },
      { href: "/dashboard/history", label: "History", description: "Past scans and lookups." },
      { href: "/dashboard/saved", label: "Saved", description: "Bookmarked assets and notes." },
      { href: "/dashboard/activity", label: "Activity", description: "Recent actions timeline." },
      { href: "/dashboard/cases", label: "Cases", description: "Investigation case files." },
      { href: "/dashboard/playbooks", label: "Playbooks", description: "Response procedure library." },
    ],
  },
  {
    label: "Settings / Utilities",
    index: "/coding-tools",
    tagline: "Developers, generators & account",
    maxFeaturedLinks: 8,
    links: [
      { href: "/settings", label: "Settings", description: "Account, workspace and preferences." },
      { href: "/pricing", label: "Pricing", description: "Plans and usage limits." },
      { href: "/enterprise", label: "Enterprise", description: "Teams, security review and pilots." },
      { href: "/coding-tools", label: "All coding utilities", description: "Generators and engineering helpers." },
      { href: "/tools/coding/snippet", label: "Code Snippet Generator", description: "Shareable snippets with language tags." },
      { href: "/tools/coding/regex", label: "Regex Builder", description: "Interactive pattern scaffolding." },
      { href: "/tools/coding/json-formatter", label: "JSON Formatter", description: "Pretty-print and minify JSON." },
      { href: "/tools/coding/api-builder", label: "API Request Builder", description: "cURL and fetch drafts." },
      { href: "/tools/coding/actions-generator", label: "GitHub Actions Generator", description: "Workflow YAML starters." },
      { href: "/tools/coding/readme-generator", label: "README Generator", description: "Repo readme skeletons." },
      { href: "/tools/coding/commit-message", label: "Commit Message Generator", description: "Conventional commit helper." },
      { href: "/tools/coding/bug-report", label: "Bug Report Generator", description: "Repro-ready bug templates." },
      { href: "/tools/coding/changelog", label: "Changelog Generator", description: "Release note scaffolding." },
      { href: "/tools/coding/code-review-checklist", label: "Code Review Checklist", description: "PR review prompts." },
    ],
  },
];

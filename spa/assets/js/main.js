const CATEGORIES = [
  {
    id: "web-tools",
    label: "Web Tools",
    icon: "WEB",
    summary: "Website QA, redirects, metadata, forms, speed, and responsive testing.",
    route: "#/web-tools",
  },
  {
    id: "cyber-tools",
    label: "Cyber Tools",
    icon: "SEC",
    summary: "Safe demo checks for reputation, phishing review, headers, SSL, DNS, and port exposure.",
    route: "#/cyber-tools",
  },
  {
    id: "microsoft-365-tools",
    label: "Microsoft 365 Tools",
    icon: "M365",
    summary: "Onboarding, leaver, MFA, Conditional Access, Teams Phone, Intune, and Defender checklists.",
    route: "#/microsoft-365-tools",
  },
  {
    id: "domain-ip-tools",
    label: "Domain/IP Tools",
    icon: "DNS",
    summary: "Domain ownership, DNS, SSL, IP reputation, geolocation, blacklist, and subdomain triage.",
    route: "#/domain-ip-tools",
  },
  {
    id: "automation-tools",
    label: "Automation Tools",
    icon: "AUTO",
    summary: "Repeatable QA planners, GitHub Actions schedules, API key safety, Vercel envs, and workflows.",
    route: "#/automation-tools",
  },
  {
    id: "phone-lead-tools",
    label: "Phone/Lead Testing Tools",
    icon: "QA",
    summary: "Phone number, lead form, call tracking, and lead quality testing workflows.",
    route: "#/phone-lead-tools",
  },
];

const TOOLS = [
  tool("website-status-checker", "Website status checker", "web-tools", "URL health", "Checks whether a website should be reachable and records a clean demo status summary.", "Useful for helpdesk triage, uptime checks, and first-response website troubleshooting.", "Demonstrates HTTP status awareness, incident notes, and user-friendly diagnostics.", "Connect later to HetrixTools, Cloudflare Health Checks, UptimeRobot, or a serverless fetch endpoint.", "url", "Run test", ["https://example.com", "https://github.com", "https://contoso.com"]),
  tool("url-redirect-checker", "URL redirect checker", "web-tools", "Redirect QA", "Maps a demo redirect chain and highlights HTTPS and final destination checks.", "Useful for campaign links, phishing triage, SEO changes, and migration testing.", "Demonstrates redirect analysis, URL normalization, and safe web testing.", "Connect later to a server-side redirect tracer with SSRF protection.", "url", "Run test", ["https://bit.ly/example", "https://example.com", "https://login.contoso.com"]),
  tool("broken-link-checker", "Broken link checker", "web-tools", "Crawler QA", "Builds a demo broken-link report from a page URL and key links to verify.", "Useful before publishing pages, knowledge articles, and landing pages.", "Demonstrates QA planning, link inventory, and website maintenance process.", "Connect later to a crawler worker, Playwright, or Screaming Frog export.", "textarea", "Run test", ["https://example.com\n/about\n/contact\n/pricing"]),
  tool("meta-preview", "Meta title/description preview", "web-tools", "SEO preview", "Generates a search-result style preview and length guidance for page metadata.", "Useful for marketing QA, portfolio pages, and client website reviews.", "Demonstrates attention to SEO basics and front-end content polish.", "Connect later to a metadata fetcher, Open Graph parser, or Search Console export.", "meta", "Generate preview", []),
  tool("page-speed-checklist", "Page speed checklist", "web-tools", "Checklist", "Creates a performance QA checklist for images, scripts, caching, and Core Web Vitals.", "Useful when preparing websites for launch or support handover.", "Demonstrates performance troubleshooting and repeatable QA process.", "Connect later to PageSpeed Insights, Lighthouse CI, or WebPageTest.", "checklist", "Generate checklist", ["Homepage", "Lead landing page", "Client portal"]),
  tool("mobile-responsiveness-checklist", "Mobile responsiveness checklist", "web-tools", "Checklist", "Creates a viewport and touch-target checklist for mobile, tablet, and desktop.", "Useful for catching layout issues before demos and interviews.", "Demonstrates responsive design QA and accessibility awareness.", "Connect later to Playwright visual tests or BrowserStack.", "checklist", "Generate checklist", ["Homepage", "Checkout form", "Dashboard"]),
  tool("form-testing-checklist", "Form testing checklist", "web-tools", "Checklist", "Creates a submission, validation, email notification, and CRM capture test plan.", "Useful for lead generation, support forms, and website launch QA.", "Demonstrates structured web testing and troubleshooting communication.", "Connect later to Playwright, webhook logs, CRM APIs, or email test inboxes.", "checklist", "Generate checklist", ["Contact form", "Newsletter signup", "Support request"]),

  tool("ip-reputation-checker", "IP reputation checker", "cyber-tools", "Demo result", "Produces a clearly labelled demo IP reputation review with safe risk indicators.", "Useful for SOC triage, firewall investigations, and abuse-report review.", "Demonstrates threat-intel thinking without pretending to query live feeds.", "Connect later to AbuseIPDB, VirusTotal, Shodan, or GreyNoise.", "ip", "Run test", ["8.8.8.8", "1.1.1.1", "185.220.101.47"], "domain-ip-tools"),
  tool("domain-reputation-checker", "Domain reputation checker", "cyber-tools", "Demo result", "Produces a demo domain reputation review with registrar, age, and phishing indicators.", "Useful for suspicious email links, vendor checks, and brand monitoring.", "Demonstrates domain triage and security communication.", "Connect later to VirusTotal, Cloudflare Radar, URLScan, or SecurityTrails.", "domain", "Run test", ["example.com", "github.com", "login-example-security.com"], "domain-ip-tools"),
  tool("email-security-checklist", "Email security checklist", "cyber-tools", "Checklist", "Creates a SPF, DKIM, DMARC, mailbox, and user-awareness review checklist.", "Useful for Microsoft 365 tenants, domain launches, and phishing prevention.", "Demonstrates email security fundamentals and DNS record review.", "Connect later to Microsoft Graph, DNS APIs, DMARC aggregate parsers, or MXToolbox.", "checklist", "Generate checklist", ["contoso.com", "new tenant", "client domain"]),
  tool("phishing-url-checklist", "Phishing URL checklist", "cyber-tools", "Checklist", "Creates a safe manual checklist for reviewing suspicious URLs before clicking.", "Useful for support desks and user-reported phishing investigations.", "Demonstrates safe handling, URL parsing, and user education.", "Connect later to VirusTotal, URLScan.io, Google Safe Browsing, or Cloudflare Radar.", "url", "Generate checklist", ["https://example.com/login", "https://bit.ly/example"]),
  tool("security-headers-checker", "Security headers checker", "cyber-tools", "Demo result", "Shows a demo security header grade for HSTS, CSP, X-Frame-Options, and related controls.", "Useful for web hardening, penetration-test prep, and launch readiness.", "Demonstrates OWASP-style header review and remediation notes.", "Connect later to SecurityHeaders.com-style scanning, Cloudflare, or server-side HEAD requests.", "domain", "Run test", ["example.com", "github.com"], "domain-ip-tools"),
  tool("ssl-certificate-checker", "SSL certificate checker", "cyber-tools", "Demo result", "Shows a demo TLS certificate review with expiry, issuer, SANs, and protocol notes.", "Useful for outage prevention, certificate renewals, and client support.", "Demonstrates TLS troubleshooting and operational risk awareness.", "Connect later to SSL Labs, crt.sh, or Cloudflare SSL APIs.", "domain", "Run test", ["example.com", "github.com"], "domain-ip-tools"),
  tool("dns-record-lookup", "DNS record lookup", "cyber-tools", "Demo result", "Shows demo A, MX, TXT, NS, SPF, and DMARC records with review notes.", "Useful for mail flow, website migrations, and domain troubleshooting.", "Demonstrates DNS literacy and clear support documentation.", "Connect later to DNS-over-HTTPS, SecurityTrails, Cloudflare, or Microsoft Graph domain APIs.", "domain", "Run test", ["example.com", "contoso.com"], "domain-ip-tools"),
  tool("port-scan-info-checker", "Port scan info checker", "cyber-tools", "Informational", "Explains common ports and creates an authorization-first exposure review plan.", "Useful for safe network conversations without running intrusive scans from a static site.", "Demonstrates responsible security testing boundaries.", "Connect later to Shodan, Censys, Nmap in a controlled worker, or an internal scanner.", "domain", "Generate info", ["example.com", "10.0.0.10"], "domain-ip-tools"),

  tool("whois-lookup", "WHOIS / RDAP lookup", "domain-ip-tools", "Demo result", "Creates a demo ownership and registration summary for a domain.", "Useful for vendor validation, abuse escalation, and domain lifecycle checks.", "Demonstrates registrar and ownership troubleshooting.", "Connect later to RDAP, WhoisXML API, or registrar APIs.", "domain", "Run test", ["example.com", "github.com"]),
  tool("geo-asn-lookup", "Geo / ASN lookup", "domain-ip-tools", "Demo result", "Shows a demo geolocation, ISP, and ASN profile for an IP address.", "Useful for firewall reviews, travel login checks, and network troubleshooting.", "Demonstrates IP enrichment and support-ready explanations.", "Connect later to IPinfo, MaxMind, IP-API, or AbuseIPDB.", "ip", "Run test", ["8.8.8.8", "1.1.1.1"]),
  tool("blacklist-check", "Blacklist check", "domain-ip-tools", "Demo result", "Creates a demo blacklist status summary across common email and web reputation sources.", "Useful for mail delivery issues and post-incident cleanup.", "Demonstrates reputation triage and remediation workflow.", "Connect later to MXToolbox, Spamhaus, Barracuda, or Microsoft Defender.", "domain", "Run test", ["example.com", "mail.contoso.com"]),
  tool("subdomain-inventory", "Subdomain inventory", "domain-ip-tools", "Demo result", "Creates a demo external subdomain inventory with ownership and risk notes.", "Useful for attack-surface review and forgotten asset discovery.", "Demonstrates OSINT-style inventory and asset hygiene.", "Connect later to SecurityTrails, crt.sh, Cloudflare, or Amass output.", "domain", "Run test", ["example.com", "contoso.com"]),

  tool("new-starter-checklist", "New starter checklist generator", "microsoft-365-tools", "Checklist", "Creates a Microsoft 365 onboarding checklist for accounts, licensing, groups, MFA, and device setup.", "Useful for IT support, HR handovers, and repeatable onboarding.", "Demonstrates Microsoft 365 administration process and documentation.", "Connect later to Microsoft Graph users, Entra ID, Intune, and Teams APIs.", "m365", "Generate checklist", ["Sales new starter", "IT admin", "Remote employee"]),
  tool("leaver-checklist", "Leaver checklist generator", "microsoft-365-tools", "Checklist", "Creates a leaver workflow for access removal, mailbox handling, device wipe, and audit evidence.", "Useful for offboarding, compliance, and reducing account risk.", "Demonstrates identity lifecycle and security-first operations.", "Connect later to Microsoft Graph, Entra audit logs, Exchange Online, and Intune.", "m365", "Generate checklist", ["Standard leaver", "Privileged admin", "Contractor"]),
  tool("mfa-readiness-checklist", "MFA readiness checklist", "microsoft-365-tools", "Checklist", "Creates a readiness plan for MFA rollout, exclusions, break-glass accounts, and user comms.", "Useful before enabling MFA or security defaults.", "Demonstrates Entra ID controls and change management.", "Connect later to Graph authentication methods and Conditional Access APIs.", "m365", "Generate checklist", ["All staff", "Admin accounts", "Pilot group"]),
  tool("conditional-access-checklist", "Conditional Access checklist", "microsoft-365-tools", "Checklist", "Creates a Conditional Access review for risk-based policies, device compliance, locations, and exclusions.", "Useful for tenant hardening and audit preparation.", "Demonstrates identity security planning and Microsoft 365 governance.", "Connect later to Microsoft Graph Conditional Access policy endpoints.", "m365", "Generate checklist", ["Baseline tenant", "Admin hardening", "BYOD rollout"]),
  tool("teams-phone-setup-checklist", "Teams Phone setup checklist", "microsoft-365-tools", "Checklist", "Creates a Teams Phone setup plan for numbers, emergency locations, policies, devices, and testing.", "Useful for voice projects and first-line support handover.", "Demonstrates Teams administration and telecom QA.", "Connect later to Teams PowerShell, Graph communications APIs, or carrier exports.", "m365", "Generate checklist", ["Small office", "Remote users", "Reception queue"]),
  tool("intune-onboarding-checklist", "Intune device onboarding checklist", "microsoft-365-tools", "Checklist", "Creates an Intune onboarding plan for enrollment, compliance, apps, configuration, and pilot testing.", "Useful for endpoint management and device rollout.", "Demonstrates modern device management and troubleshooting.", "Connect later to Intune Graph deviceManagement endpoints.", "m365", "Generate checklist", ["Windows laptops", "iOS phones", "BYOD"]),
  tool("defender-baseline-checklist", "Defender security baseline checklist", "microsoft-365-tools", "Checklist", "Creates a Defender baseline checklist for endpoint, email, identity, and alert tuning.", "Useful for Microsoft 365 security posture improvement.", "Demonstrates Defender administration and security operations awareness.", "Connect later to Microsoft Defender APIs, Secure Score, or Graph Security.", "m365", "Generate checklist", ["Business Premium", "E5 tenant", "New tenant"]),

  tool("daily-website-test-planner", "Daily website test planner", "automation-tools", "Planner", "Generates a daily website QA plan with pages, checks, owners, and evidence to capture.", "Useful for routine website support and SLA checks.", "Demonstrates automation thinking and operational discipline.", "Connect later to GitHub Actions, Playwright, Checkly, or cron-triggered jobs.", "planner", "Generate plan", ["Main website", "Client portal", "Lead funnel"]),
  tool("lead-form-qa-checklist", "Lead form QA checklist", "automation-tools", "Checklist", "Creates a lead form QA checklist covering validation, routing, CRM capture, and email alerts.", "Useful for marketing operations and website support.", "Demonstrates form testing and business-process awareness.", "Connect later to HubSpot, Salesforce, Zapier, Power Automate, or webhook logs.", "checklist", "Generate checklist", ["Demo request", "Contact sales", "Newsletter"], "phone-lead-tools"),
  tool("github-actions-schedule-generator", "GitHub Actions schedule generator", "automation-tools", "Generator", "Builds a safe GitHub Actions cron schedule snippet for recurring checks.", "Useful for scheduled website tests, link checks, and automation demos.", "Demonstrates CI/CD scheduling and YAML literacy.", "Connect later to workflow dispatch, repository secrets, and Playwright jobs.", "schedule", "Generate YAML", ["09:00 daily", "Every Monday", "Hourly smoke test"]),
  tool("api-key-safety-checklist", "API key safety checklist", "automation-tools", "Checklist", "Creates a checklist for storing, rotating, scoping, and reviewing API keys safely.", "Useful for cloud projects, automations, and client integrations.", "Demonstrates secure development and secrets hygiene.", "Connect later to GitHub secret scanning, Vercel envs, Doppler, or Azure Key Vault.", "checklist", "Generate checklist", ["New API integration", "Client project", "Rotation review"]),
  tool("vercel-env-variable-guide", "Vercel environment variable guide", "automation-tools", "Guide", "Creates an environment variable setup guide for local, preview, and production deployments.", "Useful for deployment handovers and troubleshooting missing config.", "Demonstrates practical cloud deployment knowledge.", "Connect later to Vercel API, GitHub Actions, or environment validation scripts.", "planner", "Generate guide", ["Next.js app", "Webhook service", "Static site"]),
  tool("power-automate-workflow-planner", "Power Automate workflow planner", "automation-tools", "Planner", "Creates a Power Automate plan with trigger, actions, approvals, error handling, and audit notes.", "Useful for Microsoft 365 automation and business-process improvement.", "Demonstrates workflow design, testing, and support documentation.", "Connect later to Power Platform connectors, Graph, SharePoint, Teams, or Planner APIs.", "planner", "Generate plan", ["New starter", "Leaver process", "Lead notification"]),

  tool("phone-number-validator", "Phone number validator", "phone-lead-tools", "Demo result", "Creates a demo phone QA result for country format, type, routing notes, and risk flags.", "Useful for lead quality checks and Teams Phone support.", "Demonstrates validation logic and telecom troubleshooting.", "Connect later to Twilio Lookup, Numverify, Teams Phone reports, or CRM data.", "phone", "Run test", ["+1 202 555 0199", "+44 20 7946 0958"]),
  tool("lead-intelligence-checker", "Lead intelligence checker", "phone-lead-tools", "Demo result", "Creates a demo lead quality report for email, domain, phone, and routing readiness.", "Useful for sales ops, marketing QA, and lead fraud review.", "Demonstrates enrichment thinking and practical business troubleshooting.", "Connect later to Hunter.io, Apollo, Clearbit, HubSpot, Salesforce, or Microsoft Graph.", "lead", "Run test", ["alex@example.com", "contoso.com", "+1 202 555 0199"]),
  tool("call-tracking-qa-planner", "Call tracking QA planner", "phone-lead-tools", "Planner", "Creates a call-tracking QA plan for numbers, campaigns, forwarding, voicemail, and attribution.", "Useful when testing marketing phone numbers and Teams Phone call queues.", "Demonstrates voice workflow QA and evidence gathering.", "Connect later to Twilio, Teams Phone, CallRail, or CRM call logs.", "planner", "Generate plan", ["Google Ads campaign", "Reception queue", "Out-of-hours routing"]),
];

function tool(slug, title, category, badge, description, usefulness, skill, api, kind, actionLabel, examples, secondaryCategory = null) {
  return { slug, title, category, secondaryCategory, badge, description, usefulness, skill, api, kind, actionLabel, examples };
}

const CHECKLISTS = {
  "page-speed-checklist": ["Compress hero and content images", "Lazy-load below-the-fold media", "Remove unused third-party scripts", "Set cache headers for static assets", "Check Core Web Vitals on mobile", "Document before and after screenshots"],
  "mobile-responsiveness-checklist": ["Test 360px, 390px, 768px, and desktop widths", "Confirm hamburger menu opens and closes", "Check tap targets are at least 44px", "Verify forms do not overflow", "Check sticky headers and modals", "Capture screenshots for evidence"],
  "form-testing-checklist": ["Submit valid data", "Submit empty required fields", "Test invalid email and phone values", "Confirm thank-you state or redirect", "Verify notification email arrives", "Confirm CRM or spreadsheet capture", "Check privacy and consent copy"],
  "email-security-checklist": ["Confirm MX records point to the right provider", "Publish SPF with only required senders", "Enable DKIM signing for each domain", "Set DMARC policy and reporting address", "Review anti-phishing policies", "Test external sender warnings", "Document user reporting process"],
  "phishing-url-checklist": ["Do not click the URL directly", "Expand shortened URLs in a safe tool", "Check spelling, punycode, and odd subdomains", "Review certificate and final destination", "Search reputation sources", "Capture evidence and report the message"],
  "lead-form-qa-checklist": ["Submit a test lead with consent checked", "Confirm CRM field mapping", "Verify autoresponder email", "Check sales notification routing", "Test duplicate submission handling", "Confirm spam protection is enabled", "Record evidence for handover"],
  "api-key-safety-checklist": ["Store keys in environment variables only", "Use least-privilege scopes", "Separate dev, preview, and production keys", "Rotate keys after demos and handovers", "Enable secret scanning", "Document owner and expiry date", "Never commit keys to Git"],
  "new-starter-checklist": ["Create Entra ID user with naming standard", "Assign license and department", "Add groups and Teams membership", "Require MFA registration", "Prepare device enrollment", "Confirm mailbox and OneDrive access", "Record completion evidence"],
  "leaver-checklist": ["Block sign-in", "Revoke sessions", "Convert or delegate mailbox", "Transfer OneDrive ownership", "Remove groups and admin roles", "Wipe or retire managed devices", "Export audit evidence"],
  "mfa-readiness-checklist": ["Identify pilot group", "Confirm break-glass accounts", "Review legacy authentication", "Prepare user comms", "Enable registration campaign", "Test recovery methods", "Monitor sign-in failures"],
  "conditional-access-checklist": ["Baseline admin protection", "Require MFA for risky sign-ins", "Review trusted locations", "Require compliant devices where needed", "Exclude break-glass accounts", "Run report-only mode first", "Document change approvals"],
  "teams-phone-setup-checklist": ["Confirm licensing", "Assign numbers", "Set emergency locations", "Create voice routing policies", "Configure call queues", "Test inbound and outbound calls", "Document support runbook"],
  "intune-onboarding-checklist": ["Confirm enrollment restrictions", "Create compliance policy", "Assign configuration profiles", "Deploy required apps", "Test Autopilot or Company Portal", "Review device health", "Document known fixes"],
  "defender-baseline-checklist": ["Enable Defender for Endpoint onboarding", "Review attack surface reduction rules", "Configure safe links and attachments", "Tune alert notifications", "Review Secure Score actions", "Test incident workflow", "Schedule monthly review"],
};

const app = document.querySelector("#app");
const menuToggle = document.querySelector("#menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const themeToggle = document.querySelector("#theme-toggle");
const toastRegion = document.querySelector("#toast-region");

boot();

function boot() {
  applyStoredTheme();
  window.addEventListener("hashchange", renderRoute);
  menuToggle?.addEventListener("click", toggleMenu);
  themeToggle?.addEventListener("click", toggleTheme);
  document.addEventListener("click", handleInlineCopy);
  mobileMenu?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });
  renderRoute();
}

function applyStoredTheme() {
  const stored = localStorage.getItem("securescope-theme");
  document.documentElement.dataset.theme = stored === "light" ? "light" : "dark";
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("securescope-theme", next);
  toast(`Switched to ${next} mode.`);
}

function toggleMenu() {
  const willOpen = mobileMenu?.hasAttribute("hidden") ?? false;
  if (willOpen) {
    mobileMenu?.removeAttribute("hidden");
  } else {
    mobileMenu?.setAttribute("hidden", "");
  }
  menuToggle?.setAttribute("aria-expanded", String(willOpen));
}

function closeMenu() {
  mobileMenu?.setAttribute("hidden", "");
  menuToggle?.setAttribute("aria-expanded", "false");
}

async function handleInlineCopy(event) {
  const button = event.target instanceof Element ? event.target.closest("[data-copy-inline]") : null;
  if (!(button instanceof HTMLElement)) return;
  const text = decodeURIComponent(button.dataset.copyInline ?? "");
  await copyTextToClipboard(text);
  toast("Result copied to clipboard.");
}

function renderRoute() {
  const path = getPath();
  const [segment, slug] = path.slice(1).split("/");
  closeMenu();
  updateActiveNav(segment || "home");

  if (!segment || segment === "home") return renderHome();
  if (segment === "tools" && slug) return renderTool(slug);
  if (segment === "tools") return renderCategory("all");
  if (segment === "about") return renderAbout();
  if (CATEGORIES.some((category) => category.id === segment)) return renderCategory(segment);
  return renderNotFound(path);
}

function getPath() {
  return window.location.hash.replace(/^#/, "") || "/home";
}

function updateActiveNav(segment) {
  const categorySegments = new Set(CATEGORIES.map((category) => category.id));
  const active = categorySegments.has(segment) ? segment : segment === "about" ? "about" : "home";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const isActive = link.getAttribute("data-nav") === active;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function renderHome() {
  const totalTools = TOOLS.length;
  app.innerHTML = `
    <section class="hero">
      <div class="hero__inner">
        <div>
          <p class="eyebrow"><span class="pulse-dot"></span> GitHub Pages-ready toolkit</p>
          <h1>Professional IT, cyber, web testing, Microsoft 365, and automation tools.</h1>
          <p>SecureScope is a portfolio dashboard of useful troubleshooting tools, demo outputs, checklists, and workflow planners. Everything runs client-side with relative paths, so it works cleanly on GitHub Pages.</p>
          <div class="hero-actions">
            <a class="button button--primary" href="#/web-tools">Explore tools</a>
            <a class="button button--secondary" href="#/cyber-tools">Run demo checks</a>
            <a class="button button--ghost" href="#/about">Why I built this</a>
          </div>
        </div>
        <div class="stat-grid" aria-label="Toolkit stats">
          ${stat(totalTools, "Tools available")}
          ${stat("80+", "Checks automated")}
          ${stat("6", "Security areas")}
          ${stat("7", "M365 workflows")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>Main tool categories</h2>
          <p class="text-muted">Each category routes to working cards and interactive pages.</p>
        </div>
        <a class="mini-link" href="#/tools">View all tools</a>
      </div>
      <div class="category-grid">
        ${CATEGORIES.map(categoryCard).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>Featured tools</h2>
          <p class="text-muted">Quick examples for interviews, support demos, and project walkthroughs.</p>
        </div>
      </div>
      <div class="tool-grid">
        ${["website-status-checker", "security-headers-checker", "new-starter-checklist", "github-actions-schedule-generator", "lead-form-qa-checklist", "phone-number-validator"].map((slug) => toolCard(findTool(slug))).join("")}
      </div>
    </section>

    <section class="section">
      <div class="cred-grid">
        <article class="panel">
          <h3>Why I built this</h3>
          <p>This project shows practical IT problem-solving: website QA, security triage, Microsoft 365 operations, automation planning, and clear reporting. The tools are useful even before live APIs are connected.</p>
        </article>
        <article class="panel">
          <h3>How it demonstrates skill</h3>
          <p>Every page turns a support or security task into a repeatable workflow with inputs, outputs, copy buttons, and notes that explain the business value.</p>
        </article>
        <article class="panel">
          <h3>API-ready design</h3>
          <p>Demo results are labelled clearly. Each tool explains which real APIs can replace the mock output later, such as VirusTotal, AbuseIPDB, Cloudflare, HetrixTools, Twilio, Vercel, and Microsoft Graph.</p>
        </article>
      </div>
    </section>
  `;
  focusApp();
}

function stat(value, label) {
  return `<article class="stat-card"><strong>${value}</strong><span>${escapeHtml(label)}</span></article>`;
}

function categoryCard(category) {
  const count = toolsForCategory(category.id).length;
  return `
    <a class="category-card" href="${category.route}">
      <span class="card-icon">${escapeHtml(category.icon)}</span>
      <h3>${escapeHtml(category.label)}</h3>
      <p>${escapeHtml(category.summary)}</p>
      <div class="meta-row"><span>${count} tools</span><span>Working route</span></div>
    </a>
  `;
}

function renderCategory(categoryId) {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  const tools = categoryId === "all" ? TOOLS : toolsForCategory(categoryId);
  const title = category?.label ?? "All Tools";
  const summary = category?.summary ?? "A complete catalogue of IT, cyber, Microsoft 365, automation, web QA, and phone/lead testing tools.";

  app.innerHTML = `
    <section class="page-heading">
      <div>
        <p class="eyebrow"><span class="pulse-dot"></span> ${categoryId === "all" ? "Complete catalogue" : "Tool category"}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(summary)}</p>
      </div>
      <div class="section-actions">
        <a class="button button--secondary" href="#/home">Home</a>
        <a class="button button--ghost" href="#/about">About</a>
      </div>
    </section>

    <section class="section">
      <div class="tool-grid">
        ${tools.map(toolCard).join("")}
      </div>
    </section>
  `;
  focusApp();
}

function toolCard(item) {
  if (!item) return "";
  const category = CATEGORIES.find((entry) => entry.id === item.category);
  return `
    <article class="tool-card">
      <div class="tool-card__top">
        <span class="card-icon">${escapeHtml(category?.icon ?? "TOOL")}</span>
        <span class="badge">${escapeHtml(item.badge)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="meta-row">
        <span>${escapeHtml(category?.label ?? "Tools")}</span>
        <span>${escapeHtml(item.kind)}</span>
      </div>
      <div class="tool-card__footer">
        <a class="mini-link" href="#/tools/${item.slug}">Open tool</a>
        <a class="button button--secondary" href="#/tools/${item.slug}">${escapeHtml(item.actionLabel)}</a>
      </div>
    </article>
  `;
}

function renderTool(slug) {
  const item = findTool(slug);
  if (!item) return renderNotFound(`/tools/${slug}`);
  const category = CATEGORIES.find((entry) => entry.id === item.category);
  const fields = fieldsForTool(item);

  app.innerHTML = `
    <section class="tool-detail">
      <div>
        <a class="mini-link" href="#/${item.category}">Back to tools</a>
        <p class="eyebrow"><span class="pulse-dot"></span> ${escapeHtml(item.badge)}</p>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="text-muted">${escapeHtml(item.description)}</p>
        <div class="meta-row">
          <span>${escapeHtml(category?.label ?? "Tools")}</span>
          <span>Demo-safe output</span>
          <span>GitHub Pages ready</span>
        </div>
      </div>

      <div class="tool-layout">
        <section class="form-card">
          <form id="tool-form">
            <div class="field-grid">
              ${fields.map(renderField).join("")}
            </div>
            ${renderExamples(item)}
            <div class="tool-actions">
              <button class="button button--primary" type="submit">${escapeHtml(item.actionLabel)}</button>
              <button class="button button--secondary" id="copy-result" type="button">Copy result</button>
              <button class="button button--ghost" id="reset-tool" type="button">Reset</button>
            </div>
            <span class="field-help">Results are labelled as demo or checklist output. This static version does not claim live API data.</span>
          </form>
        </section>

        <aside class="panel">
          <h3>Project credibility</h3>
          <ul>
            <li><strong>What it does:</strong> ${escapeHtml(item.description)}</li>
            <li><strong>Why useful:</strong> ${escapeHtml(item.usefulness)}</li>
            <li><strong>Skill shown:</strong> ${escapeHtml(item.skill)}</li>
            <li><strong>API later:</strong> ${escapeHtml(item.api)}</li>
          </ul>
        </aside>
      </div>

      <section id="tool-output" class="output" aria-live="polite">
        ${emptyOutput(item)}
      </section>
    </section>
  `;

  wireToolPage(item);
  focusApp();
}

function fieldsForTool(item) {
  if (item.kind === "meta") {
    return [
      { id: "page-title", label: "Meta title", type: "text", placeholder: "SecureScope - IT and Cyber Tools", wide: false },
      { id: "page-description", label: "Meta description", type: "textarea", placeholder: "A concise description of the page in 150-160 characters.", wide: true },
      { id: "page-url", label: "Page URL", type: "url", placeholder: "https://example.com/tools", wide: false },
    ];
  }
  if (item.kind === "schedule") {
    return [
      { id: "workflow-name", label: "Workflow name", type: "text", placeholder: "Daily website smoke test", wide: false },
      { id: "cron-time", label: "Schedule", type: "select", options: ["09:00 daily", "Every Monday 09:00", "Every 6 hours"], wide: false },
      { id: "command", label: "Command to run", type: "text", placeholder: "npm run test:smoke", wide: true },
    ];
  }
  if (item.kind === "textarea") {
    return [{ id: "target", label: "Page and links to test", type: "textarea", placeholder: "https://example.com\n/about\n/contact", wide: true }];
  }
  return [{ id: "target", label: inputLabel(item.kind), type: "text", placeholder: inputPlaceholder(item.kind), wide: true }];
}

function renderField(field) {
  const wide = field.wide ? " field--wide" : "";
  if (field.type === "select") {
    return `
      <div class="field${wide}">
        <label for="${field.id}">${escapeHtml(field.label)}</label>
        <select id="${field.id}" name="${field.id}">
          ${field.options.map((option) => `<option>${escapeHtml(option)}</option>`).join("")}
        </select>
      </div>
    `;
  }
  if (field.type === "textarea") {
    return `
      <div class="field${wide}">
        <label for="${field.id}">${escapeHtml(field.label)}</label>
        <textarea id="${field.id}" name="${field.id}" placeholder="${escapeHtml(field.placeholder)}"></textarea>
      </div>
    `;
  }
  return `
    <div class="field${wide}">
      <label for="${field.id}">${escapeHtml(field.label)}</label>
      <input id="${field.id}" name="${field.id}" type="${field.type}" placeholder="${escapeHtml(field.placeholder)}" />
    </div>
  `;
}

function renderExamples(item) {
  if (!item.examples.length) return "";
  return `
    <div class="examples" aria-label="Example inputs">
      ${item.examples.map((example) => `<button class="example-chip" type="button" data-example="${escapeHtml(example)}">${escapeHtml(example.split("\n")[0])}</button>`).join("")}
    </div>
  `;
}

function inputLabel(kind) {
  const labels = {
    url: "URL",
    domain: "Domain",
    ip: "IP address",
    phone: "Phone number",
    lead: "Lead, email, phone, or domain",
    m365: "Workflow or team",
    planner: "Project or workflow",
    checklist: "Site, process, or project",
  };
  return labels[kind] ?? "Target";
}

function inputPlaceholder(kind) {
  const placeholders = {
    url: "https://example.com",
    domain: "example.com",
    ip: "8.8.8.8",
    phone: "+1 202 555 0199",
    lead: "alex@example.com",
    m365: "Sales new starter",
    planner: "Daily website checks",
    checklist: "Client website launch",
  };
  return placeholders[kind] ?? "Enter a target";
}

function wireToolPage(item) {
  const form = document.querySelector("#tool-form");
  const output = document.querySelector("#tool-output");
  const copyButton = document.querySelector("#copy-result");
  const resetButton = document.querySelector("#reset-tool");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const result = buildOutput(item, data);
    output.innerHTML = result.html;
    output.dataset.copyText = result.copyText;
    toast(`${item.badge} created.`);
  });

  document.querySelectorAll("[data-example]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector("#target");
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        target.value = button.getAttribute("data-example") ?? "";
      }
    });
  });

  copyButton?.addEventListener("click", async () => {
    const copyText = output?.dataset.copyText || output?.innerText || "";
    await copyTextToClipboard(copyText.trim());
    toast("Result copied to clipboard.");
  });

  resetButton?.addEventListener("click", () => {
    form?.reset();
    if (output) {
      output.innerHTML = emptyOutput(item);
      output.dataset.copyText = "";
    }
    toast("Tool reset.");
  });
}

function emptyOutput(item) {
  return `
    <article class="result-card empty-state">
      <h3>Ready to ${escapeHtml(item.actionLabel.toLowerCase())}</h3>
      <p>Complete the form and run the tool. Output will appear here as a clearly labelled demo result or checklist output.</p>
    </article>
  `;
}

function buildOutput(item, data) {
  const target = clean(data.target || data["workflow-name"] || data["page-url"] || "Demo target");
  if (item.kind === "checklist" || CHECKLISTS[item.slug]) return checklistOutput(item, target);
  if (item.kind === "schedule") return scheduleOutput(data);
  if (item.kind === "meta") return metaOutput(data);
  if (item.slug === "port-scan-info-checker") return portInfoOutput(target, item);
  if (item.kind === "planner" || item.badge === "Planner" || item.badge === "Guide") return plannerOutput(item, target);
  return demoOutput(item, target);
}

function demoOutput(item, target) {
  const score = deterministicScore(`${item.slug}:${target}`);
  const status = score > 76 ? "Review recommended" : score > 42 ? "Looks normal with notes" : "Low concern demo result";
  const copyText = [
    `${item.badge}: ${item.title}`,
    `Target: ${target}`,
    `Status: ${status}`,
    "Label: Demo result - not live API data",
    `Next API: ${item.api}`,
  ].join("\n");

  return {
    copyText,
    html: `
      <article class="result-card">
        <div class="section-header">
          <div>
            <span class="badge">Demo result</span>
            <h3>${escapeHtml(status)}</h3>
          </div>
          <button class="button button--secondary" type="button" data-copy-inline="${encodeURIComponent(copyText)}">Copy result</button>
        </div>
        <div class="result-grid">
          ${stat(score, "Demo confidence")}
          ${stat(target.length, "Characters checked")}
          ${stat(item.kind.toUpperCase(), "Input type")}
          ${stat("0", "Live API calls")}
        </div>
        <pre>${escapeHtml(copyText)}</pre>
        <p>This output is intentionally local and deterministic. It is a placeholder for a real API integration, not a live reputation claim.</p>
      </article>
    `,
  };
}

function checklistOutput(item, target) {
  const entries = CHECKLISTS[item.slug] ?? defaultChecklist(item);
  const copyText = [`Checklist output: ${item.title}`, `Target/process: ${target}`, ...entries.map((entry, index) => `${index + 1}. ${entry}`), `API later: ${item.api}`].join("\n");
  return {
    copyText,
    html: `
      <article class="result-card">
        <div class="section-header">
          <div>
            <span class="badge">Checklist output</span>
            <h3>${escapeHtml(item.title)} for ${escapeHtml(target)}</h3>
          </div>
          <button class="button button--secondary" type="button" data-copy-inline="${encodeURIComponent(copyText)}">Copy result</button>
        </div>
        <ul class="checklist">
          ${entries.map((entry) => `<li><span class="checkmark">✓</span><span>${escapeHtml(entry)}</span></li>`).join("")}
        </ul>
      </article>
    `,
  };
}

function plannerOutput(item, target) {
  const steps = ["Define trigger and success criteria", "List systems and owners", "Create test data and rollback notes", "Run happy path and failure path", "Capture screenshots or logs", "Document handover and next improvements"];
  const copyText = [`Planner output: ${item.title}`, `Project: ${target}`, ...steps.map((step, index) => `${index + 1}. ${step}`), `API later: ${item.api}`].join("\n");
  return {
    copyText,
    html: `
      <article class="result-card">
        <div class="section-header">
          <div>
            <span class="badge">Checklist output</span>
            <h3>${escapeHtml(target)} plan</h3>
          </div>
          <button class="button button--secondary" type="button" data-copy-inline="${encodeURIComponent(copyText)}">Copy result</button>
        </div>
        <ul class="checklist">${steps.map((step) => `<li><span class="checkmark">✓</span><span>${escapeHtml(step)}</span></li>`).join("")}</ul>
      </article>
    `,
  };
}

function scheduleOutput(data) {
  const name = clean(data["workflow-name"] || "Daily website smoke test");
  const command = clean(data.command || "npm run test:smoke");
  const cron = cronFor(clean(data["cron-time"] || "09:00 daily"));
  const yaml = `name: ${name}\n\non:\n  schedule:\n    - cron: "${cron}"\n  workflow_dispatch:\n\njobs:\n  smoke-test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n      - run: npm ci\n      - run: ${command}`;
  return {
    copyText: yaml,
    html: `
      <article class="result-card">
        <span class="badge">Checklist output</span>
        <h3>GitHub Actions schedule</h3>
        <pre>${escapeHtml(yaml)}</pre>
        <p>Review GitHub Actions cron in UTC before committing. Store secrets in repository or environment secrets, not in YAML.</p>
      </article>
    `,
  };
}

function metaOutput(data) {
  const title = clean(data["page-title"] || "SecureScope - IT and Cyber Tools");
  const description = clean(data["page-description"] || "A professional IT and cyber toolkit with web testing, security, Microsoft 365, and automation workflows.");
  const url = clean(data["page-url"] || "https://example.com/tools");
  const copyText = [`Meta preview`, `URL: ${url}`, `Title (${title.length}): ${title}`, `Description (${description.length}): ${description}`].join("\n");
  return {
    copyText,
    html: `
      <article class="result-card">
        <span class="badge">Demo result</span>
        <h3>Search preview</h3>
        <div class="panel">
          <p class="mini-link">${escapeHtml(url)}</p>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(description)}</p>
        </div>
        <pre>${escapeHtml(copyText)}</pre>
      </article>
    `,
  };
}

function portInfoOutput(target, item) {
  const ports = ["22 SSH - admin access", "25 SMTP - mail relay", "53 DNS - name resolution", "80 HTTP - web traffic", "443 HTTPS - secure web", "3389 RDP - remote desktop"];
  const copyText = [`Informational port review for ${target}`, "No scan was run from this static page.", ...ports, `API later: ${item.api}`].join("\n");
  return {
    copyText,
    html: `
      <article class="result-card">
        <span class="badge">Demo result</span>
        <h3>Informational only - no port scan was run</h3>
        <ul class="checklist">${ports.map((entry) => `<li><span class="checkmark">i</span><span>${escapeHtml(entry)}</span></li>`).join("")}</ul>
        <pre>${escapeHtml(copyText)}</pre>
      </article>
    `,
  };
}

function defaultChecklist(item) {
  return [
    `Confirm the scope for ${item.title}`,
    "Run the check in a safe test window",
    "Capture evidence and screenshots",
    "Record risks, owners, and next actions",
    `Plan future API integration: ${item.api}`,
  ];
}

function cronFor(label) {
  if (label.includes("Monday")) return "0 9 * * 1";
  if (label.includes("6 hours")) return "0 */6 * * *";
  return "0 9 * * *";
}

function renderAbout() {
  app.innerHTML = `
    <section class="page-heading">
      <div>
        <p class="eyebrow"><span class="pulse-dot"></span> Portfolio credibility</p>
        <h1>Built to show practical IT and security skill.</h1>
        <p>This toolkit focuses on useful, interview-ready workflows: web QA, security checks, Microsoft 365 operations, automation planning, and lead testing. Static demo results are labelled honestly, and each tool has a future API path.</p>
      </div>
    </section>

    <section class="section">
      <div class="cred-grid">
        <article class="panel">
          <h3>What changed</h3>
          <p>The static GitHub Pages app now has real routes, working navigation, interactive forms, copy buttons, category pages, mobile menu support, and light/dark mode.</p>
        </article>
        <article class="panel">
          <h3>Why no fake live data</h3>
          <p>Tools without APIs return demo or checklist output only. That makes the project honest while still showing how the final integrations should behave.</p>
        </article>
        <article class="panel">
          <h3>Recommended API integrations</h3>
          <p>VirusTotal, AbuseIPDB, HetrixTools, Cloudflare, Microsoft Graph, Twilio, Vercel, GitHub Actions, PageSpeed Insights, URLScan.io, and SecurityTrails.</p>
        </article>
      </div>
    </section>
  `;
  focusApp();
}

function renderNotFound(path) {
  app.innerHTML = `
    <section class="result-card empty-state">
      <span class="badge">Route check</span>
      <h1>Page not found</h1>
      <p>The route <span class="code-box">${escapeHtml(path)}</span> is not registered.</p>
      <div class="hero-actions">
        <a class="button button--primary" href="#/home">Go home</a>
        <a class="button button--secondary" href="#/tools">View all tools</a>
      </div>
    </section>
  `;
  focusApp();
}

function toolsForCategory(categoryId) {
  return TOOLS.filter((item) => item.category === categoryId || item.secondaryCategory === categoryId);
}

function findTool(slug) {
  return TOOLS.find((item) => item.slug === slug);
}

function deterministicScore(value) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) % 101;
  return Math.max(12, hash);
}

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ") || "Demo target";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function copyTextToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function toast(message) {
  if (!toastRegion) return;
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  toastRegion.appendChild(item);
  setTimeout(() => item.remove(), 2800);
}

function focusApp() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  app?.focus({ preventScroll: true });
}

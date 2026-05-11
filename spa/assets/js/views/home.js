import { getAllTools, getDashboardStats, TOOL_CATEGORIES } from "../modules/tool-catalog.js";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statCard(label, value, hint, tone) {
  return `
    <article class="stat-card">
      <div class="stat-card__icon stat-card__icon--${tone}" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <circle cx="9" cy="9" r="7" />
        </svg>
      </div>
      <div class="stat-card__value">${value}</div>
      <div class="stat-card__label">${label}</div>
      <p class="stat-card__hint">${hint}</p>
    </article>
  `;
}

function featuredToolCard(tool) {
  return `
    <article class="mini-tool-card">
      <p class="mini-tool-card__category">${escapeHtml(tool.categoryLabel)}</p>
      <h3 class="mini-tool-card__title">${escapeHtml(tool.title)}</h3>
      <p class="mini-tool-card__desc">${escapeHtml(tool.cardDescription)}</p>
      <a class="btn btn--secondary btn--sm" href="#${tool.categoryRoute}?tool=${tool.id}">Open tool</a>
    </article>
  `;
}

export function renderHome() {
  const view = document.getElementById("view");
  if (!view) return;

  const stats = getDashboardStats();
  const allTools = getAllTools();
  const featuredIds = [
    "website-status-checker",
    "ip-reputation-checker",
    "mfa-readiness-checklist",
    "daily-website-test-planner",
    "phone-number-risk-review",
    "lead-form-qa-checklist",
  ];
  const featuredTools = featuredIds
    .map((id) => allTools.find((tool) => tool.id === id))
    .filter(Boolean);

  view.innerHTML = `
    <div class="page-container animate-fade-in">
      <section class="hero-home">
        <p class="hero-home__kicker">IT / CYBER / AUTOMATION TOOLKIT</p>
        <h1 class="hero-home__title">Professional IT &amp; Cyber tools dashboard</h1>
        <p class="hero-home__sub">
          A portfolio-ready toolkit for web testing, security checks, Microsoft 365 operations,
          troubleshooting workflows, and automation planning.
        </p>
        <div class="hero-home__actions">
          <a href="#/web-tools" class="btn btn--primary">Explore Web Tools</a>
          <a href="#/cyber-tools" class="btn btn--secondary">Open Cyber Tools</a>
        </div>
      </section>

      <section class="stats-grid" aria-label="Dashboard stats">
        ${statCard("Tools available", stats.toolsAvailable, "Across all categories", "cyan")}
        ${statCard("Checks automated", stats.checksAutomated, "Demo/checklist actions implemented", "green")}
        ${statCard("Security areas covered", stats.securityAreasCovered, "Web, infra, email, identity, endpoint, process", "red")}
        ${statCard("Microsoft 365 workflows", stats.microsoft365Workflows, "Operational checklist generators", "purple")}
      </section>

      <section class="card card--panel">
        <div class="card__body">
          <div class="section-header">
            <h2 class="section-title">Featured tools</h2>
            <p class="section-sub">Each card opens a working tool section with interactive output.</p>
          </div>
          <div class="featured-grid">
            ${featuredTools.map((tool) => featuredToolCard(tool)).join("")}
          </div>
        </div>
      </section>

      <section class="card card--panel">
        <div class="card__body">
          <div class="section-header">
            <h2 class="section-title">Why I built this</h2>
          </div>
          <div class="why-grid">
            <article class="why-card">
              <h3>Real-world IT troubleshooting</h3>
              <p>Tool outputs model practical triage steps used in support, operations, and security workflows.</p>
            </article>
            <article class="why-card">
              <h3>Security-first process</h3>
              <p>Every cyber tool clearly marks demo output and includes a safe path to real API integrations later.</p>
            </article>
            <article class="why-card">
              <h3>Interview-ready portfolio</h3>
              <p>Shows my strengths in IT automation, Microsoft 365 operations, web QA, and structured incident thinking.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="card card--panel">
        <div class="card__body">
          <div class="section-header">
            <h2 class="section-title">Tool categories</h2>
            <p class="section-sub">Jump straight into the category you want to demo.</p>
          </div>
          <div class="cta-grid">
            ${TOOL_CATEGORIES.map(
              (category) => `
                <a href="#${category.route}" class="cta-card">
                  <h3>${escapeHtml(category.navLabel)}</h3>
                  <p>${escapeHtml(category.description)}</p>
                </a>
              `,
            ).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderAbout() {
  const view = document.getElementById("view");
  if (!view) return;

  view.innerHTML = `
    <div class="page-container animate-fade-in">
      <section class="card card--panel">
        <div class="card__body">
          <div class="section-header">
            <h1 class="page-title">About this toolkit project</h1>
            <p class="page-sub">A portfolio dashboard for IT, cyber security, automation, and Microsoft 365 operations.</p>
          </div>
          <div class="why-grid">
            <article class="why-card">
              <h2>Project purpose</h2>
              <p>
                This toolkit demonstrates practical troubleshooting and security workflows in a format suitable
                for interviews, portfolio reviews, and technical discussions.
              </p>
            </article>
            <article class="why-card">
              <h2>How demo tools work</h2>
              <p>
                Every tool is interactive and returns either <strong>Demo result</strong> or <strong>Checklist output</strong>.
                No live API results are faked.
              </p>
            </article>
            <article class="why-card">
              <h2>Future integrations</h2>
              <p>
                Each tool card includes a direct API integration path so services like VirusTotal, AbuseIPDB,
                Cloudflare, Microsoft Graph, or Twilio can be connected later.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="card card--panel">
        <div class="card__body">
          <div class="section-header">
            <h2 class="section-title">Technical notes</h2>
          </div>
          <ul class="about-list">
            <li>Hash routing keeps links compatible with GitHub Pages static hosting.</li>
            <li>All scripts and styles use relative paths for portable deployment.</li>
            <li>Dark/light theme preference is persisted locally.</li>
            <li>Navigation supports desktop and mobile hamburger menu interactions.</li>
            <li>Every card and button has a working action or route.</li>
          </ul>
          <div class="category-hero__actions">
            <a href="#/home" class="btn btn--primary btn--sm">Back to home</a>
            <a href="#/cyber-tools" class="btn btn--secondary btn--sm">Open cyber tools</a>
          </div>
        </div>
      </section>
    </div>
  `;
}

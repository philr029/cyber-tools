/**
 * placeholder.js — "Coming soon" stub view.
 *
 * Reused for /tools, /ai, and /reports pages.
 * Pass an options object to customise the icon, title and description.
 */

const CONFIGS = {
  '/tools': {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M2 0L0 2l4.4 6.162a2 2 0 0 0 1.63.838h.14a2 2 0 0 1 1.415.586l5.35 5.35-5.234
        5.308A6.006 6.006 0 0 0 0 26a6 6 0 1 0 11.756-1.702l5.308-5.234 1.936 1.936-.61 1.828a2
        2 0 0 0 .484 2.046l6.54 6.54a1.994 1.994 0 0 0 2.828 0l3.172-3.172a1.994 1.994 0 0 0
        0-2.828l-6.54-6.54a2 2 0 0 0-2.046-.484l-1.828.61-1.92-1.92 5.36-5.286A6.01 6.01 0 0 0
        32 6c0-.538-.07-1.06-.204-1.554l-4.28 4.282L26 8l-.728-3.514 4.282-4.282A6.01 6.01 0 0 0
        24 0a6.01 6.01 0 0 0-6 6c0 .704.12 1.38.338 2.008L12.97 13.37l-5.35-5.35a2 2 0 0
        1-.586-1.416v-.142a2 2 0 0 0-.838-1.63L2 0z"/>
    </svg>`,
    badge:    'Phase 2',
    title:    'Tools – Coming in Phase 2',
    desc:     'Domain intelligence, IP analysis, email header parsing, phone validation, and port scanning — all arriving in the next build phase.',
    features: [
      'Domain WHOIS & DNS lookup',
      'IP geolocation & reputation',
      'Email header analysis',
      'Phone number validator',
      'Simulated port scanner',
    ],
  },

  '/ai': {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M12 25a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2h-6a1 1 0 0 1-1-1zM6 16.124C6 13.52 8.47
        11.53 11.06 11.772a53.16 53.16 0 0 0 9.88 0C23.53 11.53 26 13.52 26 16.124v2.314a1.866
        1.866 0 0 1-1.53 1.87c-1.69.294-4.68.692-8.47.692s-6.78-.4-8.47-.692A1.866 1.866 0 0 1
        6 18.438v-2.314zm9.084-1.654a.5.5 0 0 0-.434.136l-1.84 1.8a49.534 49.534 0 0
        1-3.742-.366.5.5 0 0 0-.136.99c1.1.152 2.464.298 4.04.386a.5.5 0 0 0 .378-.142l1.508-1.472
        1.694 3.42a.5.5 0 0 0 .808.124l1.864-1.94a50.572 50.572 0 0 0 3.844-.376.5.5 0 0
        0-.136-.99c-1.076.148-2.414.29-3.96.378a.5.5 0 0 0-.332.152l-1.508 1.57-1.684-3.4a.5.5
        0 0 0-.364-.27zM16 3C9.373 3 4 8.373 4 15a.5.5 0 0 0 1 0C5 8.925 9.925 4 16 4s11 4.925
        11 11a.5.5 0 0 0 1 0c0-6.627-5.373-12-12-12z"/>
    </svg>`,
    badge:    'Phase 3',
    title:    'AI Assistant – Coming in Phase 3',
    desc:     'Intelligent threat analysis powered by AI. Get natural-language explanations of scan results, recommended actions, and automated risk scoring.',
    features: [
      'Natural-language threat explanations',
      'Automated risk scoring engine',
      'Recommended remediation steps',
      'Historical trend analysis',
      'Export AI-generated reports',
    ],
  },

  '/reports': {
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M6 2a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h20a3 3 0 0 0 3-3V9.243a3 3 0 0
        0-.879-2.122l-5.242-5.242A3 3 0 0 0 20.757 1H6zm1.5 13h9a1 1 0 0 1 0 2h-9a1 1 0 0 1
        0-2zm0 4h9a1 1 0 0 1 0 2h-9a1 1 0 0 1 0-2zm0-8h5a1 1 0 0 1 0 2h-5a1 1 0 0 1 0-2z"/>
    </svg>`,
    badge:    'Soon',
    title:    'Reports',
    desc:     'Export detailed PDF and CSV reports of all your scans. Filter by date, threat level, or tool type. Share securely with your team.',
    features: [
      'Full scan history export',
      'PDF & CSV download',
      'Filter by date range or severity',
      'Per-tool summary reports',
      'Team sharing links',
    ],
  },
};

/* ── Render ─────────────────────────────────────────────────────── */
export function renderPlaceholder(route) {
  const view = document.getElementById('view');
  if (!view) return;

  const cfg = CONFIGS[route] ?? CONFIGS['/tools'];

  view.innerHTML = `
    <div class="page-container">
      <div class="placeholder-page animate-fade-in">

        <span class="placeholder-page__badge" aria-label="Status: ${cfg.badge}">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm-.5 2.5a.5.5 0 0 1
              1 0v3a.5.5 0 0 1-.147.354L4.5 8.707a.5.5 0 0 1-.707-.707L5.5 6.293V3.5z"
              clip-rule="evenodd"/>
          </svg>
          ${cfg.badge}
        </span>

        <div class="placeholder-page__icon" aria-hidden="true">
          ${cfg.icon}
        </div>

        <h1 class="placeholder-page__title">${cfg.title}</h1>
        <p class="placeholder-page__sub">${cfg.desc}</p>

        <ul style="display:flex;flex-direction:column;gap:var(--sp-2);text-align:left;
                   max-width:320px;width:100%;">
          ${cfg.features.map(f => `
            <li style="display:flex;align-items:center;gap:var(--sp-2);
                       font-size:0.8125rem;color:var(--text-muted);">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
                   aria-hidden="true" style="color:var(--accent);flex-shrink:0;">
                <path fill-rule="evenodd" d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1zm2.78 4.22a.75.75
                  0 0 0-1.06 0L6.5 7.44 5.28 6.22a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0
                  1.06 0l2.5-2.5a.75.75 0 0 0 0-1.06z" clip-rule="evenodd"/>
              </svg>
              ${f}
            </li>
          `).join('')}
        </ul>

        <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;justify-content:center;">
          <a href="#/dashboard" class="btn btn--secondary">← Back to Dashboard</a>
          <a href="#/pricing"   class="btn btn--primary">View Plans</a>
        </div>

      </div>
    </div>
  `;
}

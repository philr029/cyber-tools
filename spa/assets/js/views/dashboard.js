/**
 * dashboard.js — Dashboard view.
 *
 * Renders: welcome header, stat cards, threat breakdown,
 * recent scan history, tool cards, upgrade banner.
 */

import { state, history } from '../modules/state.js';
import { toast } from '../modules/toast.js';

/* ── Date helpers ───────────────────────────────────────────────── */
function relativeTime(iso) {
  if (!iso) return 'Never';
  const delta = Date.now() - new Date(iso).getTime();
  if (delta < 60_000)         return 'Just now';
  if (delta < 3_600_000)      return `${Math.floor(delta / 60_000)}m ago`;
  if (delta < 86_400_000)     return `${Math.floor(delta / 3_600_000)}h ago`;
  if (delta < 604_800_000)    return `${Math.floor(delta / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Tool catalogue (Phase 2+ items) ───────────────────────────── */
const TOOLS = [
  {
    name:  'Domain Intelligence',
    desc:  'WHOIS, DNS records, registrar info',
    phase: 'Phase 2',
    icon:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M9 1a8 8 0 100 16A8 8 0 009 1zm0 2a6.002 6.002 0 0 1 5.916 5H3.084A6.002 6.002 0 0 1 9
        3zm0 12a6.002 6.002 0 0 1-5.916-5h11.832A6.002 6.002 0 0 1 9 15zm-3.5-7h7l-1.25 2h-4.5L5.5 8z"/>
    </svg>`,
  },
  {
    name:  'IP Analyzer',
    desc:  'Geolocation, ASN, reputation checks',
    phase: 'Phase 2',
    icon:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path fill-rule="evenodd" d="M9 1a8 8 0 100 16A8 8 0 009 1zm0 2a6 6 0 0 1 4.2 10.2L7 7h4l-1.5-3H9
        l-1 2H5.3A6 6 0 0 1 9 3z" clip-rule="evenodd"/>
    </svg>`,
  },
  {
    name:  'Email Headers',
    desc:  'SPF, DKIM, DMARC validation',
    phase: 'Phase 2',
    icon:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M2 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v.217L9 10.383 2 4.217V4zm0 2.383V14a2 2 0 0 0 2
        2h10a2 2 0 0 0 2-2V6.383l-7 5.25-7-5.25z"/>
    </svg>`,
  },
  {
    name:  'Phone Validator',
    desc:  'Carrier lookup, country, risk score',
    phase: 'Phase 2',
    icon:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M3 2a1 1 0 0 1 1-1h2.172a1 1 0 0 1 .97.757l.537 2.149a1 1 0 0 1-.547 1.145l-1.116.558a10.003
        10.003 0 0 0 4.375 4.375l.558-1.116a1 1 0 0 1 1.145-.547l2.149.537A1 1 0 0 1 15 9.828V12a1 1 0 0 1-1
        1h-1C7.373 13 3 8.627 3 3V2z"/>
    </svg>`,
  },
  {
    name:  'Port Scanner',
    desc:  'Safe simulated open-port analysis',
    phase: 'Phase 2',
    icon:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h12.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2
        4.75zm0 4A.75.75 0 0 1 2.75 8h12.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8.75zm0 4A.75.75 0 0 1
        2.75 12h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 2 12.75z" clip-rule="evenodd"/>
    </svg>`,
  },
  {
    name:  'AI Risk Engine',
    desc:  'Unified threat scoring + guidance',
    phase: 'Phase 3',
    icon:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path fill-rule="evenodd" d="M9 1a8 8 0 100 16A8 8 0 009 1zm0 2a6 6 0 0 1 5.196 9H3.804A6 6 0 0 1 9
        3zm-1 4a1 1 0 0 1 2 0v3.586l1.707 1.707a1 1 0 0 1-1.414 1.414l-2-2A1 1 0 0 1 8 11V7z"
        clip-rule="evenodd"/>
    </svg>`,
  },
];

/* ── History list HTML ──────────────────────────────────────────── */
function renderHistory(entries) {
  if (entries.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor" opacity="0.4">
            <path d="M18 3a15 15 0 1 0 0 30A15 15 0 0 0 18 3zm0 2a13 13 0 1 1 0 26A13 13 0 0 1 18
              5zm-1 4v7.586l-3.707 3.707 1.414 1.414L18.414 18H19V9h-2z"/>
          </svg>
        </div>
        <p class="empty-state__title">No scan history yet</p>
        <p class="empty-state__sub">Scan a domain, IP, or email to start building your history.</p>
        <a href="#/tools" class="btn btn--primary btn--sm">Explore Tools</a>
      </div>
    `;
  }

  const DOT = { safe: 'safe', warning: 'warning', risk: 'danger', unknown: 'muted' };

  return entries.slice(0, 7).map(e => `
    <div class="history-row">
      <span class="status-dot status-dot--${DOT[e.status] ?? 'muted'}"
            aria-label="Status: ${e.status ?? 'unknown'}"></span>
      <span class="history-row__query">${escapeHtml(e.query ?? '—')}</span>
      <span class="history-row__type">${escapeHtml(e.type ?? 'scan')}</span>
      <span class="history-row__time">${relativeTime(e.timestamp)}</span>
    </div>
  `).join('');
}

/* ── Safe HTML escape ───────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Main render ────────────────────────────────────────────────── */
export function renderDashboard() {
  const view   = document.getElementById('view');
  if (!view) return;

  const appState    = state.get();
  const user        = appState.user ?? {};
  const allHistory  = history.getAll();
  const firstName   = (user.name ?? 'there').split(' ')[0];

  const total   = allHistory.length;
  const safe    = allHistory.filter(e => e.status === 'safe').length;
  const warns   = allHistory.filter(e => e.status === 'warning').length;
  const risks   = allHistory.filter(e => e.status === 'risk').length;
  const threats = warns + risks;
  const lastScan = allHistory[0]?.timestamp ?? null;
  const safeP    = total ? ((safe   / total) * 100).toFixed(1) : 0;
  const warnP    = total ? ((warns  / total) * 100).toFixed(1) : 0;
  const riskP    = total ? ((risks  / total) * 100).toFixed(1) : 0;
  const isPro    = user.plan === 'pro';

  view.innerHTML = `
    <div class="page-container animate-fade-in">

      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Welcome back, ${escapeHtml(firstName)}</h1>
          <p class="page-sub">Your security intelligence overview</p>
        </div>
        <a href="#/tools" class="btn btn--primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7 1a.75.75 0 0 1 .75.75V6.25h4.5a.75.75 0 0 1 0 1.5H7.75v4.5a.75.75
              0 0 1-1.5 0V7.75H1.75a.75.75 0 0 1 0-1.5h4.5V1.75A.75.75 0 0 1 7 1z"
              clip-rule="evenodd"/>
          </svg>
          New Scan
        </a>
      </div>

      <!-- Stats grid -->
      <div class="stats-grid stagger-children" role="list" aria-label="Security statistics">

        <div class="stat-card" role="listitem">
          <div class="stat-card__icon stat-card__icon--cyan" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M9 1a8 8 0 100 16A8 8 0 009 1zm-1 4.5a1 1 0 0 1 2 0v4.25l2.5 2.5a1 1 0
                0 1-1.414 1.414l-2.793-2.793A1 1 0 0 1 8 10V5.5z"/>
            </svg>
          </div>
          <div class="stat-card__value">${total}</div>
          <div class="stat-card__label">Total Scans</div>
        </div>

        <div class="stat-card" role="listitem">
          <div class="stat-card__icon stat-card__icon--green" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path fill-rule="evenodd" d="M9 1a8 8 0 100 16A8 8 0 009 1zm3.707 5.293a1 1 0 0
                0-1.414 0L8 9.586 6.707 8.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1
                1 0 0 0 0-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-card__value">${safe}</div>
          <div class="stat-card__label">Clean Results</div>
        </div>

        <div class="stat-card" role="listitem">
          <div class="stat-card__icon stat-card__icon--red" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path fill-rule="evenodd" d="M9 1a8 8 0 100 16A8 8 0 009 1zm-.25 4a.75.75 0 0 1
                1.5 0v4.25a.75.75 0 0 1-1.5 0V5zm.75 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-card__value">${threats}</div>
          <div class="stat-card__label">Threats Found</div>
        </div>

        <div class="stat-card" role="listitem">
          <div class="stat-card__icon stat-card__icon--purple" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M9 1a8 8 0 100 16A8 8 0 009 1zm-1 4a1 1 0 0 1 1.75-.661l.5.5A.75.75 0 0 1 10
                5.75v3.69l2.22 2.22a.75.75 0 0 1-1.06 1.06l-2.5-2.5A.75.75 0 0 1 8.5 9.5v-4.5z"/>
            </svg>
          </div>
          <div class="stat-card__value">${relativeTime(lastScan)}</div>
          <div class="stat-card__label">Last Scan</div>
        </div>

      </div><!-- /stats-grid -->

      <!-- Two-column: history + threat breakdown -->
      <div class="dashboard-grid">

        <!-- Recent scan history (wide) -->
        <div class="card card--wide">
          <div class="card__header">
            <h2 class="card__title">Recent Activity</h2>
            <a href="#/reports" class="card__link">View all →</a>
          </div>
          <div class="card__body history-list" id="history-list">
            ${renderHistory(allHistory)}
          </div>
        </div>

        <!-- Threat breakdown -->
        <div class="card">
          <div class="card__header">
            <h2 class="card__title">Threat Breakdown</h2>
          </div>
          <div class="card__body">
            ${total === 0
              ? `<p class="text-sm text-muted" style="padding:var(--sp-4) 0">
                   Run your first scan to see threat data here.
                 </p>`
              : `<div class="threat-bar-group">
                   <div class="threat-bar-item">
                     <div class="threat-bar-item__label">
                       <span class="text-success">Safe</span>
                       <span class="text-muted">${safe}</span>
                     </div>
                     <div class="threat-bar">
                       <div class="threat-bar__fill threat-bar__fill--safe"
                            style="width: ${safeP}%"></div>
                     </div>
                   </div>
                   <div class="threat-bar-item">
                     <div class="threat-bar-item__label">
                       <span class="text-warning">Warning</span>
                       <span class="text-muted">${warns}</span>
                     </div>
                     <div class="threat-bar">
                       <div class="threat-bar__fill threat-bar__fill--warning"
                            style="width: ${warnP}%"></div>
                     </div>
                   </div>
                   <div class="threat-bar-item">
                     <div class="threat-bar-item__label">
                       <span class="text-danger">High Risk</span>
                       <span class="text-muted">${risks}</span>
                     </div>
                     <div class="threat-bar">
                       <div class="threat-bar__fill threat-bar__fill--danger"
                            style="width: ${riskP}%"></div>
                     </div>
                   </div>
                 </div>`
            }
          </div>
        </div>

      </div><!-- /dashboard-grid -->

      <!-- Tools section -->
      <div class="section-header">
        <h2 class="section-title">Intelligence Modules</h2>
        <p class="section-sub">Cyber analysis tools — expanding with each phase</p>
      </div>

      <div class="tools-grid">
        ${TOOLS.map(t => `
          <div class="tool-card">
            <div class="tool-card__icon" aria-hidden="true">${t.icon}</div>
            <div class="tool-card__body">
              <div class="tool-card__name">${t.name}</div>
              <div class="tool-card__desc">${t.desc}</div>
            </div>
            <span class="tag">${t.phase}</span>
          </div>
        `).join('')}
      </div>

      ${!isPro ? `
        <!-- Upgrade banner -->
        <div class="upgrade-banner" role="complementary" aria-label="Upgrade offer">
          <div class="upgrade-banner__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83
                4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691
                1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637
                3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="upgrade-banner__text">
            <strong>Unlock Pro</strong>
            <span>Unlimited scans, AI analysis, monitoring &amp; export reports.</span>
          </div>
          <a href="#/pricing" class="btn btn--amber btn--sm">View Plans</a>
        </div>
      ` : ''}

    </div><!-- /page-container -->
  `;

  // Demo button: seed a fake scan into history
  const newScanBtn = view.querySelector('a.btn--primary[href="#/tools"]');
  if (newScanBtn) {
    newScanBtn.addEventListener('click', () => {
      toast.info('Tools arrive in Phase 2 — check back soon!');
    });
  }
}

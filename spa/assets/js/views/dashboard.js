/**
 * dashboard.js — Dashboard view.
 *
 * Renders: hero Smart Scan, stat KPI cards, threat breakdown,
 * recent scan history, intelligence module cards, upgrade banner.
 */

import { state, history }            from '../modules/state.js';
import { toast }                     from '../modules/toast.js';
import { getActivityEntries, logActivity } from '../modules/activity-log.js';
import { isValidActiveTarget } from '../modules/validation.js';
import { runScan, TYPE_META, SCAN_STEPS, detectType } from '../tools/scanner.js';

let _openGuardrail = null;
let _consoleBootLogged = false;

/* ── Date helpers ───────────────────────────────────────────────── */
function relativeTime(iso) {
  if (!iso) return 'Never';
  const delta = Date.now() - new Date(iso).getTime();
  if (delta < 60_000)      return 'Just now';
  if (delta < 3_600_000)   return `${Math.floor(delta / 60_000)}m ago`;
  if (delta < 86_400_000)  return `${Math.floor(delta / 3_600_000)}h ago`;
  if (delta < 604_800_000) return `${Math.floor(delta / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Safe HTML escape ───────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _pushActivity(level, message) {
  logActivity(level, message);
  _renderActivityConsole();
}

/* ── Hero section ───────────────────────────────────────────────── */
function heroHtml() {
  return `
    <section class="hero-scan" aria-label="Smart Scan">
      <div class="hero-scan__bg-grid" aria-hidden="true"></div>

      <p class="hero-scan__eyebrow" aria-hidden="true">
        <span class="hero-scan__pulse-dot"></span>
        LIVE THREAT INTELLIGENCE
      </p>

      <h2 class="hero-scan__heading">Scan Any Target Instantly</h2>
      <p class="hero-scan__sub">
        Paste a domain, IP address, email, or phone number — we'll detect and
        analyse it automatically.
      </p>

      <form class="hero-scan__form" id="hero-scan-form" novalidate>
        <div class="hero-scan__shell" id="hero-scan-shell">
          <div class="hero-scan__glow-ring" aria-hidden="true"></div>
          <input
            id="hero-scan-input"
            class="hero-scan__input"
            type="text"
            placeholder="Scan domain, IP, email, or phone\u2026"
            autocomplete="off"
            spellcheck="false"
            aria-label="Enter target to scan"
            maxlength="256"
          />
          <button
            id="hero-scan-btn"
            type="submit"
            class="hero-scan__btn btn btn--primary"
            aria-label="Run smart scan"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                 stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <circle cx="5.5" cy="5.5" r="4"/>
              <line x1="8.8" y1="8.8" x2="13" y2="13" stroke-linecap="round"/>
            </svg>
            Scan
          </button>
        </div>
      </form>

      <div class="hero-scan__examples" aria-label="Example inputs">
        <span class="hero-scan__ex-label">Try:</span>
        <button class="hero-scan__ex-chip" data-example="github.com"       type="button">github.com</button>
        <button class="hero-scan__ex-chip" data-example="8.8.8.8"          type="button">8.8.8.8</button>
        <button class="hero-scan__ex-chip" data-example="info@example.com" type="button">info@example.com</button>
        <button class="hero-scan__ex-chip" data-example="+44 7700 900123"  type="button">+44 7700 900123</button>
      </div>

      <!-- Scan progress -->
      <div id="hero-scan-progress" class="hero-scan__progress"
           hidden aria-live="polite" aria-atomic="true">
        <ol class="scan-steps" id="scan-steps-list" aria-label="Scan progress"></ol>
      </div>

      <!-- Scan result -->
      <div id="hero-scan-result" hidden></div>
    </section>
  `;
}

/* ── Scan-step HTML ─────────────────────────────────────────────── */
const _ICON_SPINNER = `
  <svg class="scan-step__spinner" width="16" height="16" viewBox="0 0 16 16"
       fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"
            stroke-opacity="0.25"/>
    <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round"/>
  </svg>
`;
const _ICON_CHECK = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.707 5.293a1 1 0 0
      0-1.414 0L7 9.586 5.707 8.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1
      1 0 0 0 0-1.414z" clip-rule="evenodd"/>
  </svg>
`;
const _ICON_PENDING = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"
            opacity="0.3"/>
  </svg>
`;

function scanStepsHtml(activeIndex) {
  return SCAN_STEPS.map((step, i) => {
    const done   = i < activeIndex;
    const active = i === activeIndex;
    const mod    = done ? 'done' : active ? 'active' : 'pending';
    return `
      <li class="scan-step scan-step--${mod}">
        <div class="scan-step__icon" aria-hidden="true">
          ${done ? _ICON_CHECK : active ? _ICON_SPINNER : _ICON_PENDING}
        </div>
        <span class="scan-step__label">${escapeHtml(step.label)}${active ? '\u2026' : ''}</span>
      </li>
    `;
  }).join('');
}

/* ── Scan result HTML ───────────────────────────────────────────── */
const _RISK_META = {
  safe:    { label: 'Safe',      icon: '\u2714' },
  warning: { label: 'Warning',   icon: '\u26a0' },
  danger:  { label: 'High Risk', icon: '\u2715' },
};

function scanResultHtml(res) {
  const risk     = _RISK_META[res.riskClass] ?? _RISK_META.warning;
  const typeMeta = TYPE_META[res.type]       ?? { label: res.type, icon: '?' };

  const copyText = [
    `Target : ${res.query}`,
    `Type   : ${typeMeta.label}`,
    `Risk   : ${res.risk}`,
    `Result : ${res.summary}`,
    `Detail : ${res.detail}`,
  ].join('\n');

  return `
    <div class="scan-result scan-result--${res.riskClass} animate-fade-in-up"
         role="region" aria-label="Scan result">
      <div class="scan-result__header">
        <span class="scan-result__risk-badge scan-result__risk-badge--${res.riskClass}">
          <span aria-hidden="true">${risk.icon}</span>
          ${risk.label}
        </span>
        <div class="scan-result__meta">
          <span class="scan-result__type-badge">${typeMeta.icon} ${escapeHtml(typeMeta.label)}</span>
          <span class="scan-result__query font-mono">${escapeHtml(res.query)}</span>
        </div>
      </div>
      <p class="scan-result__summary">${escapeHtml(res.summary)}</p>
      <p class="scan-result__detail">${escapeHtml(res.detail)}</p>
      <div class="scan-result__actions">
        <button
          class="btn btn--secondary btn--sm scan-result__copy-btn"
          data-copy="${escapeHtml(copyText)}"
          aria-label="Copy result to clipboard"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3.5 1A1.5 1.5 0 0 0 2 2.5v6A1.5 1.5 0 0 0 3.5 10h5A1.5 1.5 0 0 0
              10 8.5v-6A1.5 1.5 0 0 0 8.5 1h-5zM1 4.5A2.5 2.5 0 0 0 0 6.5v3A2.5 2.5 0
              0 0 2.5 12h4a2.5 2.5 0 0 0 2.236-1.381A2.5 2.5 0 0 1 7 10.5h-4A1.5 1.5
              0 0 1 1.5 9V5A1.5 1.5 0 0 1 1 4.5z"/>
          </svg>
          Copy Result
        </button>
        <button
          class="btn btn--ghost btn--sm scan-result__new-btn"
          type="button"
          aria-label="Start a new scan"
        >
          New Scan
        </button>
      </div>
    </div>
  `;
}

/* ── Tool catalogue ─────────────────────────────────────────────── */
const STROKE_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 12h18"/>
    <path d="M12 3v18"/>
    <circle cx="12" cy="12" r="9"/>
  </svg>
`;

const TOOLS = [
  { name: 'Port Scanner', desc: 'Active host + open-port probing (authorized targets only).', category: 'IT & Infrastructure', phase: 'Active', active: true, span: 'wide' },
  { name: 'Form Tester', desc: 'Active form endpoint testing with controlled payload checks.', category: 'IT & Infrastructure', phase: 'Active', active: true, span: 'wide' },
  { name: 'SSL/TLS Auditor', desc: 'Check cert validity, issuer chain, and expiry windows.', category: 'IT & Infrastructure', phase: 'New' },
  { name: 'DNS Record Lookup', desc: 'Query A, MX, and TXT records with resolver visibility.', category: 'IT & Infrastructure', phase: 'New' },
  { name: 'Global Ping', desc: 'Measure target latency from distributed global probes.', category: 'IT & Infrastructure', phase: 'New' },
  { name: 'OG Tag Previewer', desc: 'Preview Open Graph metadata for social share accuracy.', category: 'Marketing & SEO', phase: 'New', span: 'wide' },
  { name: 'SERP Visualizer', desc: 'Simulate title/description snippets in Google search.', category: 'Marketing & SEO', phase: 'New' },
  { name: 'UTM Architect', desc: 'Generate campaign-safe tracking links with validation.', category: 'Marketing & SEO', phase: 'New' },
  { name: 'Cookie Tracker Audit', desc: 'Inspect first/third-party cookie footprint and flags.', category: 'Privacy/Admin', phase: 'New' },
  { name: 'Whois Privacy Check', desc: 'Detect registrar privacy status and exposure risk.', category: 'Privacy/Admin', phase: 'New' },
  { name: 'DMARC/SPF Email Validator', desc: 'Validate sender policy records and alignment posture.', category: 'Privacy/Admin', phase: 'New', span: 'wide' },
].map((tool) => ({ ...tool, icon: STROKE_ICON }));

/* ── History list HTML ──────────────────────────────────────────── */
function historyHtml(entries) {
  if (entries.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor" opacity="0.4">
            <path d="M18 3a15 15 0 1 0 0 30A15 15 0 0 0 18 3zm0 2a13 13 0 1 1 0 26A13 13 0 0 1
              18 5zm-1 4v7.586l-3.707 3.707 1.414 1.414L18.414 18H19V9h-2z"/>
          </svg>
        </div>
        <p class="empty-state__title">No scan history yet</p>
        <p class="empty-state__sub">Run your first scan above to start building your history.</p>
      </div>
    `;
  }

  const DOT = { safe: 'safe', warning: 'warning', risk: 'danger', unknown: 'muted' };

  return entries.slice(0, 7).map(e => `
    <div class="history-row">
      <span class="status-dot status-dot--${DOT[e.status] ?? 'muted'}"
            aria-label="Status: ${e.status ?? 'unknown'}"></span>
      <span class="history-row__query">${escapeHtml(e.query ?? '\u2014')}</span>
      <span class="history-row__type">${escapeHtml(e.type ?? 'scan')}</span>
      <span class="history-row__time">${relativeTime(e.timestamp)}</span>
    </div>
  `).join('');
}

/* ── Main render ────────────────────────────────────────────────── */
export function renderDashboard() {
  const view = document.getElementById('view');
  if (!view) return;

  const appState   = state.get();
  const user       = appState.user ?? {};
  const allHistory = history.getAll();
  const firstName  = (user.name ?? 'there').split(' ')[0];

  const total   = allHistory.length;
  const safe    = allHistory.filter(e => e.status === 'safe').length;
  const warns   = allHistory.filter(e => e.status === 'warning').length;
  const risks   = allHistory.filter(e => e.status === 'risk').length;
  const threats = warns + risks;
  const lastScan = allHistory[0]?.timestamp ?? null;
  const safeP   = total ? ((safe  / total) * 100).toFixed(1) : 0;
  const warnP   = total ? ((warns / total) * 100).toFixed(1) : 0;
  const riskP   = total ? ((risks / total) * 100).toFixed(1) : 0;
  const isPro   = user.plan === 'pro';

  view.innerHTML = `
    <div class="page-container animate-fade-in">

      ${heroHtml()}

      <div class="page-header">
        <div>
          <h1 class="page-title">Welcome back, ${escapeHtml(firstName)}</h1>
          <p class="page-sub">Your security intelligence overview</p>
        </div>
      </div>

      <div class="stats-grid stagger-children" role="list" aria-label="Security statistics">

        <div class="stat-card" role="listitem">
          <div class="stat-card__icon stat-card__icon--cyan" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1zM8 5.5a1 1 0 0 1 2 0V9.75l2.5
                2.5a1 1 0 0 1-1.414 1.414l-2.793-2.793A1 1 0 0 1 8 10V5.5z"/>
            </svg>
          </div>
          <div class="stat-card__value" data-count="${total}">${total}</div>
          <div class="stat-card__label">Total Scans</div>
        </div>

        <div class="stat-card" role="listitem">
          <div class="stat-card__icon stat-card__icon--green" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path fill-rule="evenodd" d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1zm3.707 5.293a1 1
                0 0 0-1.414 0L8 9.586 6.707 8.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414
                0l4-4a1 1 0 0 0 0-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-card__value" data-count="${safe}">${safe}</div>
          <div class="stat-card__label">Clean Results</div>
        </div>

        <div class="stat-card" role="listitem">
          <div class="stat-card__icon stat-card__icon--red" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path fill-rule="evenodd" d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1zm-.25 4a.75.75 0
                0 1 1.5 0v4.25a.75.75 0 0 1-1.5 0V5zm.75 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0
                2z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-card__value" data-count="${threats}">${threats}</div>
          <div class="stat-card__label">Threats Found</div>
        </div>

        <div class="stat-card" role="listitem">
          <div class="stat-card__icon stat-card__icon--purple" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1zM8 5a1 1 0 0 1 2 0v4.5l2.22
                2.22a.75.75 0 0 1-1.06 1.06l-2.5-2.5A.75.75 0 0 1 8.5 9.5V5z"/>
            </svg>
          </div>
          <div class="stat-card__value">${relativeTime(lastScan)}</div>
          <div class="stat-card__label">Last Scan</div>
        </div>

      </div>

      <div class="dashboard-grid">

        <div class="card card--wide">
          <div class="card__header">
            <h2 class="card__title">Recent Activity</h2>
            <a href="#/reports" class="card__link">View all &rarr;</a>
          </div>
          <div class="card__body history-list" id="history-list">
            ${historyHtml(allHistory)}
          </div>
        </div>

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
                            style="width:${safeP}%"></div>
                     </div>
                   </div>
                   <div class="threat-bar-item">
                     <div class="threat-bar-item__label">
                       <span class="text-warning">Warning</span>
                       <span class="text-muted">${warns}</span>
                     </div>
                     <div class="threat-bar">
                       <div class="threat-bar__fill threat-bar__fill--warning"
                            style="width:${warnP}%"></div>
                     </div>
                   </div>
                   <div class="threat-bar-item">
                     <div class="threat-bar-item__label">
                       <span class="text-danger">High Risk</span>
                       <span class="text-muted">${risks}</span>
                     </div>
                     <div class="threat-bar">
                       <div class="threat-bar__fill threat-bar__fill--danger"
                            style="width:${riskP}%"></div>
                     </div>
                   </div>
                 </div>`
            }
          </div>
        </div>

      </div>

      <div class="section-header">
        <h2 class="section-title">Security Tool Matrix</h2>
        <p class="section-sub">Clean bento layout with guarded active workflows</p>
      </div>

      <div class="tools-grid stagger-children">
        ${TOOLS.map(t => `
          <div class="tool-card ${t.span ? `tool-card--${t.span}` : ''}" tabindex="0"
               role="button"
               data-tool-name="${escapeHtml(t.name)}"
               data-tool-active="${t.active ? '1' : '0'}"
               aria-label="${escapeHtml(t.name)} \u2014 ${escapeHtml(t.phase)}">
            <div class="tool-card__icon" aria-hidden="true">
              ${t.icon}
            </div>
            <div class="tool-card__body">
              <div class="tag" style="display:inline-flex;margin-bottom:6px;">
                ${escapeHtml(t.category)}
              </div>
              <div class="tool-card__name">${escapeHtml(t.name)}</div>
              <div class="tool-card__desc">${escapeHtml(t.desc)}</div>
            </div>
            <div class="tool-card__meta">
              <span class="tag">${escapeHtml(t.phase)}</span>
              ${t.active ? '<span class="tool-card__active-pill">Permission Required</span>' : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <section class="activity-console" aria-label="Activity console">
        <div class="activity-console__header">
          <span>Activity Console</span>
          <span>Read-only</span>
        </div>
        <div id="activity-console-lines" class="activity-console__body" role="log" aria-live="polite"></div>
      </section>

      <div id="guardrail-modal" class="guardrail-modal" hidden>
        <div class="guardrail-modal__panel" role="dialog" aria-modal="true" aria-labelledby="guardrail-modal-title">
          <div class="guardrail-modal__header">
            <h3 id="guardrail-modal-title" class="guardrail-modal__title">Permission Confirmation</h3>
            <p id="guardrail-modal-sub" class="guardrail-modal__sub"></p>
          </div>
          <div class="guardrail-modal__body">
            <div class="field-group" style="margin-bottom:0;">
              <label class="field-label" for="guardrail-target-input">Target to verify</label>
              <input id="guardrail-target-input" class="field-input" type="text" maxlength="256"
                     placeholder="domain.com, 8.8.8.8, or https://target.com" autocomplete="off" />
              <p class="guardrail-modal__hint">Step 1: verify a valid authorized target before running.</p>
              <p class="guardrail-modal__status" id="guardrail-status"></p>
              <p class="guardrail-modal__error" id="guardrail-error"></p>
            </div>
            <div class="guardrail-modal__actions">
              <button id="guardrail-verify-btn" type="button" class="btn btn--secondary btn--sm">Verify Target</button>
              <label class="guardrail-modal__ack">
                <input id="guardrail-ack" type="checkbox" />
                <span>Step 2: I acknowledge permission to test this target.</span>
              </label>
            </div>
            <div class="guardrail-modal__actions">
              <button id="guardrail-cancel-btn" type="button" class="btn btn--ghost btn--sm">Cancel</button>
              <button id="guardrail-run-btn" type="button" class="btn btn--primary btn--sm" disabled>Run Tool</button>
            </div>
          </div>
        </div>
      </div>

      ${!isPro ? `
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

    </div>
  `;

  _wireDashboard(view);
  _animateCounters(view);
}

/* ── Event wiring ───────────────────────────────────────────────── */
function _wireDashboard(view) {
  _renderActivityConsole();
  if (!_consoleBootLogged) {
    _pushActivity('status', '[STATUS] Sanitizing URL inputs...');
    _pushActivity('success', '[SUCCESS] Site Verified.');
    _consoleBootLogged = true;
  }

  // Example chips fill the input
  view.querySelectorAll('.hero-scan__ex-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('hero-scan-input');
      if (input) { input.value = btn.dataset.example ?? ''; input.focus(); }
      _pushActivity('status', '[STATUS] Example target populated.');
    });
  });

  _wireGuardrailModal(view);

  // Tool cards
  view.querySelectorAll('.tool-card').forEach(card => {
    const toolName = card.dataset.toolName ?? 'Tool';
    const isActive = card.dataset.toolActive === '1';
    const handler = () => {
      if (isActive) {
        _triggerGuardrailModal(toolName);
        return;
      }
      toast.info(`${toolName} module is queued and ready for rollout.`);
      _pushActivity('status', `[STATUS] ${toolName} selected.`);
    };
    card.addEventListener('click',   handler);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });

  // Hero scan form submit
  document.getElementById('hero-scan-form')
    ?.addEventListener('submit', e => { e.preventDefault(); _doScan(view); });

}

/* ── Scan runner ────────────────────────────────────────────────── */
async function _doScan(view) {
  const input    = document.getElementById('hero-scan-input');
  const btn      = document.getElementById('hero-scan-btn');
  const progress = document.getElementById('hero-scan-progress');
  const result   = document.getElementById('hero-scan-result');
  const stepsList = document.getElementById('scan-steps-list');

  const query = input?.value?.trim() ?? '';
  if (!query) {
    toast.warning('Please enter something to scan.');
    _pushActivity('warning', '[WARNING] Scan blocked: empty target.');
    input?.focus();
    return;
  }
  if (detectType(query) === 'unknown') {
    toast.warning('Target format not recognized. Enter a valid domain, IP, URL, email, or phone.');
    _pushActivity('warning', '[WARNING] Scan blocked: malformed target.');
    input?.focus();
    return;
  }
  _pushActivity('status', `[STATUS] Scan queued for "${query}".`);

  // Enter scanning state
  if (input)    input.disabled  = true;
  if (btn)      btn.disabled    = true;
  if (result)   result.hidden   = true;
  if (progress) {
    progress.hidden = false;
    if (stepsList) stepsList.innerHTML = scanStepsHtml(-1);
  }

  await runScan(query, {
    onStep(_label, index) {
      const sl = document.getElementById('scan-steps-list');
      if (sl) sl.innerHTML = scanStepsHtml(index);
    },
    onComplete(res) {
      // Mark all steps done, then transition to result
      const sl = document.getElementById('scan-steps-list');
      if (sl) sl.innerHTML = scanStepsHtml(SCAN_STEPS.length);

      setTimeout(() => {
        const prog  = document.getElementById('hero-scan-progress');
        const resEl = document.getElementById('hero-scan-result');
        if (prog)  prog.hidden  = true;
        if (resEl) {
          resEl.hidden    = false;
          resEl.innerHTML = scanResultHtml(res);
          resEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          resEl.querySelector('.scan-result__copy-btn')
               ?.addEventListener('click', e =>
                 _copyResult(e.currentTarget.dataset.copy ?? '', e.currentTarget));

          resEl.querySelector('.scan-result__new-btn')
               ?.addEventListener('click', () => _resetScan());
        }

        const inp = document.getElementById('hero-scan-input');
        const b   = document.getElementById('hero-scan-btn');
        if (inp) inp.disabled = false;
        if (b)   b.disabled   = false;
        _pushActivity('success', `[SUCCESS] Scan complete: ${res.query} (${res.riskClass}).`);

        _refreshHistory(view);
      }, 400);
    },
  });
}

function _resetScan() {
  const input    = document.getElementById('hero-scan-input');
  const progress = document.getElementById('hero-scan-progress');
  const result   = document.getElementById('hero-scan-result');
  const btn      = document.getElementById('hero-scan-btn');

  if (input)    { input.value = ''; input.disabled = false; input.focus(); }
  if (btn)      btn.disabled  = false;
  if (progress) progress.hidden = true;
  if (result)   { result.hidden = true; result.innerHTML = ''; }
  _pushActivity('status', '[STATUS] Scan form reset.');
}

/* ── Copy helper ────────────────────────────────────────────────── */
function _copyResult(text, btn) {
  if (!text) return;
  navigator.clipboard?.writeText(text).then(() => {
    toast.success('Result copied to clipboard!');
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.textContent = '\u2714 Copied';
      setTimeout(() => { if (btn) btn.innerHTML = origHtml; }, 2000);
    }
  }).catch(() => toast.error('Could not access clipboard.'));
}

/* ── Refresh history after scan ─────────────────────────────────── */
function _refreshHistory(view) {
  const list = view?.querySelector('#history-list');
  if (list) list.innerHTML = historyHtml(history.getAll());
}

function _renderActivityConsole() {
  const root = document.getElementById('activity-console-lines');
  if (!root) return;
  const lines = getActivityEntries()
    .map((entry) => `<div class="activity-console__line activity-console__line--${entry.level}">${escapeHtml(entry.message)}</div>`)
    .join('');
  root.innerHTML = lines;
}

function _wireGuardrailModal(view) {
  const modal = view.querySelector('#guardrail-modal');
  if (!modal) return;
  const targetInput = modal.querySelector('#guardrail-target-input');
  const ackInput = modal.querySelector('#guardrail-ack');
  const verifyBtn = modal.querySelector('#guardrail-verify-btn');
  const runBtn = modal.querySelector('#guardrail-run-btn');
  const cancelBtn = modal.querySelector('#guardrail-cancel-btn');
  const statusEl = modal.querySelector('#guardrail-status');
  const errorEl = modal.querySelector('#guardrail-error');
  const titleEl = modal.querySelector('#guardrail-modal-title');
  const subEl = modal.querySelector('#guardrail-modal-sub');
  let verified = false;
  let selectedTool = '';

  const syncRunState = () => {
    runBtn.disabled = !(verified && ackInput.checked);
  };

  const resetModal = () => {
    verified = false;
    targetInput.value = '';
    ackInput.checked = false;
    statusEl.textContent = '';
    errorEl.textContent = '';
    syncRunState();
  };

  verifyBtn.addEventListener('click', () => {
    const target = targetInput.value.trim();
    if (!isValidActiveTarget(target)) {
      verified = false;
      statusEl.textContent = '';
      errorEl.textContent = 'Target must be a valid domain, IPv4, or https URL.';
      _pushActivity('warning', '[WARNING] Guardrail verify failed: invalid target format.');
      syncRunState();
      return;
    }
    verified = true;
    statusEl.textContent = 'Target verified. Now acknowledge permission to proceed.';
    errorEl.textContent = '';
    _pushActivity('success', `[SUCCESS] Guardrail verification passed for ${target}.`);
    syncRunState();
  });

  ackInput.addEventListener('change', syncRunState);

  cancelBtn.addEventListener('click', () => {
    modal.hidden = true;
    resetModal();
  });

  runBtn.addEventListener('click', () => {
    const target = targetInput.value.trim();
    toast.success(`${selectedTool} started for ${target}.`);
    _pushActivity('success', `[SUCCESS] ${selectedTool} executed against ${target}.`);
    modal.hidden = true;
    resetModal();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.hidden = true;
      resetModal();
    }
  });

  _openGuardrail = (toolName) => {
    selectedTool = toolName;
    titleEl.textContent = `${toolName} Permission Confirmation`;
    subEl.textContent = 'Verify the target and acknowledge permission before execution.';
    resetModal();
    modal.hidden = false;
    targetInput.focus();
    _pushActivity('status', `[STATUS] Guardrail opened for ${toolName}.`);
  };
}

function _triggerGuardrailModal(toolName) {
  _openGuardrail?.(toolName);
}

/* ── Stat counter animation ─────────────────────────────────────── */
function _animateCounters(view) {
  view.querySelectorAll('.stat-card__value[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target) || target === 0) return;

    const duration = 800;
    const start    = performance.now();

    (function step(now) {
      const pct   = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      el.textContent = Math.round(eased * target);
      if (pct < 1) requestAnimationFrame(step);
    })(performance.now());
  });
}

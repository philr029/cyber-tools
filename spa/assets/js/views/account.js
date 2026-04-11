/**
 * account.js — Account & Settings view.
 *
 * Renders: profile card, plan info, display preferences (theme,
 * notifications, compact mode), account actions (sign out, clear data).
 */

import { state, prefs, history } from '../modules/state.js';
import { toast }  from '../modules/toast.js';
import { setTheme, getTheme } from '../modules/theme.js';

/* ── Safe HTML escape ───────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Toggle HTML helper ─────────────────────────────────────────── */
function toggle(id, checked) {
  return `
    <label class="toggle" aria-label="Toggle">
      <input type="checkbox" class="toggle__input" id="${id}" ${checked ? 'checked' : ''}>
      <span class="toggle__track" aria-hidden="true"></span>
      <span class="toggle__thumb" aria-hidden="true"></span>
    </label>
  `;
}

/* ── Main render ────────────────────────────────────────────────── */
export function renderAccount() {
  const view = document.getElementById('view');
  if (!view) return;

  const appState = state.get();
  const user     = appState.user ?? {};
  const p        = prefs.get();
  const isPro    = user.plan === 'pro';
  const scanCount = history.getAll().length;

  view.innerHTML = `
    <div class="page-container animate-fade-in">

      <div class="page-header">
        <div>
          <h1 class="page-title">Account</h1>
          <p class="page-sub">Manage your profile, plan, and preferences</p>
        </div>
      </div>

      <!-- Profile section -->
      <div class="settings-section">
        <p class="settings-section__title">Profile</p>

        <div class="profile-card">
          <div class="profile-card__avatar" id="acct-avatar" aria-hidden="true">
            ${escapeHtml(user.initials ?? 'U')}
          </div>
          <div class="profile-card__info">
            <div class="profile-card__name" id="acct-name">
              ${escapeHtml(user.name ?? '—')}
            </div>
            <div class="profile-card__email" id="acct-email">
              ${escapeHtml(user.email ?? '—')}
            </div>
          </div>
          <div class="profile-card__actions">
            <span class="plan-badge ${isPro ? 'plan-badge--pro' : 'plan-badge--free'}">
              ${isPro ? 'Pro' : 'Free'}
            </span>
          </div>
        </div>

        <!-- Editable name / email -->
        <div class="card">
          <div class="card__body">
            <div class="field-group">
              <label class="field-label" for="field-name">Display Name</label>
              <input class="field-input" type="text" id="field-name"
                     value="${escapeHtml(user.name ?? '')}"
                     autocomplete="name" spellcheck="false" />
            </div>
            <div class="field-group">
              <label class="field-label" for="field-email">Email Address</label>
              <input class="field-input" type="email" id="field-email"
                     value="${escapeHtml(user.email ?? '')}"
                     autocomplete="email" spellcheck="false" />
            </div>
            <button class="btn btn--primary btn--sm" id="save-profile-btn" type="button">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Plan section -->
      <div class="settings-section">
        <p class="settings-section__title">Plan &amp; Usage</p>
        <div class="card">
          <div class="card__body">
            <div class="info-row">
              <span class="info-row__key">Current plan</span>
              <span class="info-row__val">${isPro ? 'Pro' : 'Free'}</span>
            </div>
            <div class="info-row">
              <span class="info-row__key">Total scans run</span>
              <span class="info-row__val">${scanCount}</span>
            </div>
            <div class="info-row">
              <span class="info-row__key">Daily scan limit</span>
              <span class="info-row__val">${isPro ? 'Unlimited' : '20 / day'}</span>
            </div>
            <div class="info-row">
              <span class="info-row__key">Member since</span>
              <span class="info-row__val">
                ${new Date(user.joinDate ?? Date.now())
                  .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          ${!isPro ? `
            <div class="card__footer" style="display:flex;gap:var(--sp-3);align-items:center;flex-wrap:wrap;">
              <p class="text-sm text-muted" style="flex:1">
                Upgrade for unlimited scans, AI reports &amp; priority support.
              </p>
              <a href="#/pricing" class="btn btn--amber btn--sm">Upgrade to Pro</a>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Preferences section -->
      <div class="settings-section">
        <p class="settings-section__title">Preferences</p>
        <div class="card">
          <div class="card__body" style="padding-top:0;padding-bottom:0;">

            <!-- Theme -->
            <div class="toggle-row">
              <div class="toggle-row__info">
                <div class="toggle-row__label">Dark Mode</div>
                <div class="toggle-row__desc">Switch between dark and light themes</div>
              </div>
              ${toggle('pref-dark-mode', getTheme() === 'dark')}
            </div>

            <!-- Notifications -->
            <div class="toggle-row">
              <div class="toggle-row__info">
                <div class="toggle-row__label">Toast Notifications</div>
                <div class="toggle-row__desc">Show in-app alerts and confirmations</div>
              </div>
              ${toggle('pref-notifications', p.notifications !== false)}
            </div>

            <!-- Compact mode -->
            <div class="toggle-row">
              <div class="toggle-row__info">
                <div class="toggle-row__label">Compact Mode</div>
                <div class="toggle-row__desc">Reduce spacing for denser information display</div>
              </div>
              ${toggle('pref-compact', p.compactMode === true)}
            </div>

          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="settings-section">
        <p class="settings-section__title">Data</p>
        <div class="card">
          <div class="card__body" style="display:flex;gap:var(--sp-3);flex-wrap:wrap;align-items:center;">
            <div style="flex:1;">
              <div class="toggle-row__label">Clear Scan History</div>
              <div class="toggle-row__desc" style="font-size:0.78rem;color:var(--text-muted);">
                Permanently removes all ${scanCount} stored scans from this browser.
              </div>
            </div>
            <button class="btn btn--danger btn--sm" id="clear-history-btn" type="button">
              Clear History
            </button>
          </div>
        </div>
      </div>

    </div><!-- /page-container -->
  `;

  // ── Wire up interactions ─────────────────────────────────────── //

  // Save profile
  view.querySelector('#save-profile-btn').addEventListener('click', () => {
    const name  = view.querySelector('#field-name').value.trim();
    const email = view.querySelector('#field-email').value.trim();

    if (!name)  { toast.error('Name cannot be empty.');  return; }
    if (!email) { toast.error('Email cannot be empty.'); return; }

    const initials = name.split(' ').map(w => w[0].toUpperCase()).join('').slice(0, 2);

    state.set('user', { ...state.get('user'), name, email, initials });

    // Update sidebar live
    const sidebarName    = document.getElementById('sidebar-user-name');
    const sidebarEmail   = document.getElementById('sidebar-user-email');
    const sidebarAvatar  = document.getElementById('sidebar-user-avatar');
    if (sidebarName)   sidebarName.textContent   = name;
    if (sidebarEmail)  sidebarEmail.textContent  = email;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;

    // Update profile card header
    const acctName   = view.querySelector('#acct-name');
    const acctEmail  = view.querySelector('#acct-email');
    const acctAvatar = view.querySelector('#acct-avatar');
    if (acctName)   acctName.textContent   = name;
    if (acctEmail)  acctEmail.textContent  = email;
    if (acctAvatar) acctAvatar.textContent = initials;

    toast.success('Profile saved successfully.');
  });

  // Dark-mode toggle
  view.querySelector('#pref-dark-mode').addEventListener('change', e => {
    const theme = e.target.checked ? 'dark' : 'light';
    setTheme(theme);
    toast.info(`Switched to ${theme} theme.`);
  });

  // Notifications toggle
  view.querySelector('#pref-notifications').addEventListener('change', e => {
    prefs.set('notifications', e.target.checked);
    if (e.target.checked) {
      toast.success('Notifications enabled.');
    }
  });

  // Compact mode toggle
  view.querySelector('#pref-compact').addEventListener('change', e => {
    prefs.set('compactMode', e.target.checked);
    document.body.classList.toggle('compact', e.target.checked);
    toast.info(e.target.checked ? 'Compact mode on.' : 'Compact mode off.');
  });

  // Clear history
  view.querySelector('#clear-history-btn').addEventListener('click', () => {
    if (history.getAll().length === 0) {
      toast.warning('History is already empty.');
      return;
    }
    history.clear();
    toast.success('Scan history cleared.');
    renderAccount(); // re-render to update count
  });
}

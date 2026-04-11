/**
 * main.js — App entry point.
 *
 * Initialises all modules and registers routes.
 * This file is loaded as an ES module via <script type="module">.
 */

import { initState, state }   from './modules/state.js';
import { initTheme }          from './modules/theme.js';
import { initSidebar }        from './modules/sidebar.js';
import { router }             from './modules/router.js';
import { toast }              from './modules/toast.js';

import { renderDashboard }    from './views/dashboard.js';
import { renderAccount }      from './views/account.js';
import { renderPlaceholder }  from './views/placeholder.js';
import { renderPricing }      from './views/pricing.js';

/* ── Boot ───────────────────────────────────────────────────────── */
(function boot() {

  // 1. Initialise localStorage state (writes defaults if absent)
  initState();

  // 2. Apply saved theme before anything is painted
  initTheme();

  // 3. Wire the mobile sidebar
  initSidebar();

  // 4. Register routes
  router.register('/dashboard', renderDashboard);
  router.register('/tools',     () => renderPlaceholder('/tools'));
  router.register('/ai',        () => renderPlaceholder('/ai'));
  router.register('/reports',   () => renderPlaceholder('/reports'));
  router.register('/pricing',   renderPricing);
  router.register('/account',   renderAccount);
  router.register('/settings',  renderAccount); // settings reuses account view

  // 5. Start the router (reads current hash and renders initial view)
  router.init();

  // 6. Wire the sidebar sign-out button
  document.getElementById('sign-out-btn')?.addEventListener('click', () => {
    state.reset();
    toast.info('You have been signed out.');

    // Reset sidebar user card to defaults
    const defaultUser = state.get('user');
    const nameEl   = document.getElementById('sidebar-user-name');
    const emailEl  = document.getElementById('sidebar-user-email');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const badgeEl  = document.getElementById('sidebar-plan-badge');

    if (nameEl)   nameEl.textContent   = defaultUser.name;
    if (emailEl)  emailEl.textContent  = defaultUser.email;
    if (avatarEl) avatarEl.textContent = defaultUser.initials;
    if (badgeEl)  { badgeEl.textContent = 'Free'; badgeEl.className = 'plan-badge plan-badge--free'; }

    // Navigate to dashboard
    router.navigate('/dashboard');
  });

  // 7. Notification bell — demo toast
  document.getElementById('notif-btn')?.addEventListener('click', () => {
    toast.info('No new notifications.');
  });

  // 8. Populate sidebar user card from stored state
  _updateSidebarUser();

  // Re-sync sidebar whenever user state changes
  state.on('change:user', () => _updateSidebarUser());

})();

/* ── Internal ───────────────────────────────────────────────────── */
function _updateSidebarUser() {
  const user = state.get('user') ?? {};

  const nameEl   = document.getElementById('sidebar-user-name');
  const emailEl  = document.getElementById('sidebar-user-email');
  const avatarEl = document.getElementById('sidebar-user-avatar');
  const badgeEl  = document.getElementById('sidebar-plan-badge');

  if (nameEl)   nameEl.textContent   = user.name  ?? '—';
  if (emailEl)  emailEl.textContent  = user.email ?? '—';
  if (avatarEl) avatarEl.textContent = user.initials ?? '?';

  if (badgeEl) {
    const isPro = user.plan === 'pro';
    badgeEl.textContent = isPro ? 'Pro' : 'Free';
    badgeEl.className   = `plan-badge ${isPro ? 'plan-badge--pro' : 'plan-badge--free'}`;
  }
}

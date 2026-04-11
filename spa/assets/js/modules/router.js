/**
 * router.js — Hash-based client-side router.
 *
 * Usage:
 *   import { router } from './router.js';
 *   router.register('/dashboard', () => renderDashboard());
 *   router.navigate('/account');
 *   router.init();
 */

const _routes   = new Map();
let   _current  = null;

/* ── Public API ─────────────────────────────────────────────────── */
export const router = {
  /**
   * Register a route handler.
   * @param {string}   path     e.g. '/dashboard'
   * @param {Function} handler  called when this route is active
   */
  register(path, handler) {
    _routes.set(path, handler);
  },

  /** Navigate to a path (writes to location.hash). */
  navigate(path) {
    window.location.hash = path;
  },

  /** Return the currently-active route path. */
  current() {
    return _current;
  },

  /** Attach event listeners — call once at app startup. */
  init() {
    window.addEventListener('hashchange', _resolve);
    _resolve();
  },
};

/* ── Internal ───────────────────────────────────────────────────── */
function _resolve() {
  // Strip the leading '#' from the hash, fall back to /dashboard
  const hash = window.location.hash.slice(1);
  const path = hash.split('?')[0] || '/dashboard';

  // Avoid re-rendering the same view
  if (_current === path && document.getElementById('view')?.children.length) return;

  // Retrieve only from the explicit allow-list of registered routes;
  // validate as a function before calling to prevent unexpected dispatch.
  const handler = _routes.get(path) ?? _routes.get('/dashboard');
  if (typeof handler !== 'function') return;

  _current = path;
  handler();
  _updateActiveLinks(path);
  _updateBreadcrumb(path);
}

function _updateActiveLinks(activePath) {
  document.querySelectorAll('[data-nav]').forEach(link => {
    // Map route '/dashboard' → data-nav="dashboard"
    const navKey  = link.getAttribute('data-nav');
    const segment = activePath.replace('/', '');
    const active  = segment === navKey;
    link.classList.toggle('sidebar__nav-link--active', active);
    link.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

function _updateBreadcrumb(path) {
  const crumb = document.getElementById('topbar-breadcrumb');
  if (!crumb) return;

  const LABELS = {
    '/dashboard': 'Dashboard',
    '/tools':     'Tools',
    '/ai':        'AI Assistant',
    '/reports':   'Reports',
    '/pricing':   'Pricing',
    '/account':   'Account',
    '/settings':  'Settings',
  };
  crumb.textContent = LABELS[path] ?? 'Dashboard';
}

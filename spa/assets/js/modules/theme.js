/**
 * theme.js — Dark / light theme management.
 *
 * Reads from localStorage (via prefs), applies to <html data-theme>,
 * wires the toggle button, and respects prefers-color-scheme.
 */

import { prefs } from './state.js';

const ATTR = 'data-theme';

/** Return the currently-active theme name. */
export function getTheme() {
  return document.documentElement.getAttribute(ATTR) || 'dark';
}

/** Apply a theme by name and persist. */
export function setTheme(name) {
  if (name !== 'dark' && name !== 'light') return;
  document.documentElement.setAttribute(ATTR, name);
  prefs.set('theme', name);
  _updateAriaLabel(name);
}

/** Toggle and return the new theme name. */
export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/** Wire up the toggle button and apply the saved (or system) theme. */
export function initTheme() {
  // Determine starting theme: saved > system > dark
  let initial = prefs.get('theme');
  if (!initial) {
    initial = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  setTheme(initial);

  // Wire the topbar toggle button
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      toggleTheme();
      // Brief rotation feedback
      btn.style.transition = 'transform 0.2s ease';
      btn.style.transform  = 'rotate(18deg) scale(0.88)';
      setTimeout(() => {
        btn.style.transform  = '';
        btn.style.transition = '';
      }, 200);
    });
  }

  // Follow system preference changes when no manual choice is stored
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // Only auto-switch if user hasn't manually chosen
    if (!localStorage.getItem('ss_prefs')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ── Internal ───────────────────────────────────────────────────── */
function _updateAriaLabel(theme) {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const next = theme === 'dark' ? 'light' : 'dark';
  btn.setAttribute('aria-label', `Switch to ${next} theme`);
  btn.title = `Switch to ${next} theme`;
}

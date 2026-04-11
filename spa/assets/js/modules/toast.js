/**
 * toast.js — Reusable toast notification system.
 *
 * Usage:
 *   import { toast } from './toast.js';
 *   toast.success('Scan complete');
 *   toast.error('Failed to load data', 6000);
 *   toast.warning('Usage limit approaching');
 *   toast.info('Settings saved');
 */

const DURATION   = 4500;  // ms before auto-dismiss
const MAX_TOASTS = 5;

/* SVG icons keyed by type */
const ICONS = {
  success: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477
      9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75
      0 0 0-.01-1.05z"/>
  </svg>`,

  error: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293
      8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707
      8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
  </svg>`,

  warning: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889
      0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0
      1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>`,

  info: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194
      0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381
      2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
  </svg>`,
};

/* ── Internal helpers ───────────────────────────────────────────── */
function getContainer() {
  return document.getElementById('toast-container');
}

function buildToast(message, type) {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'assertive');

  // Build structure with trusted icon HTML; set message via textContent to prevent XSS
  el.innerHTML = `
    <div class="toast__icon">${ICONS[type] ?? ICONS.info}</div>
    <div class="toast__message"></div>
    <button class="toast__close" type="button" aria-label="Dismiss">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06
          6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6
          2.22 3.28a.75.75 0 0 1 0-1.06z"/>
      </svg>
    </button>
  `;

  // Set message as plain text to prevent any HTML injection
  el.querySelector('.toast__message').textContent = message;

  return el;
}

function dismiss(el) {
  if (el.dataset.dismissed) return;
  el.dataset.dismissed = '1';
  el.classList.add('toast--leaving');
  el.addEventListener('animationend', () => el.remove(), { once: true });
  // Fallback removal in case animationend never fires
  setTimeout(() => el.remove(), 500);
}

/* ── Public API ─────────────────────────────────────────────────── */
function showToast(message, type = 'info', duration = DURATION) {
  const container = getContainer();
  if (!container) return null;

  // Remove oldest if at limit
  const visible = container.querySelectorAll('.toast:not([data-dismissed])');
  if (visible.length >= MAX_TOASTS) dismiss(visible[0]);

  const el = buildToast(message, type);
  container.appendChild(el);

  // Close button
  el.querySelector('.toast__close').addEventListener('click', () => dismiss(el));

  // Auto-dismiss
  let timer = setTimeout(() => dismiss(el), duration);

  // Pause on hover
  el.addEventListener('mouseenter', () => clearTimeout(timer));
  el.addEventListener('mouseleave', () => {
    timer = setTimeout(() => dismiss(el), Math.min(duration, 2000));
  });

  return el;
}

export const toast = {
  success: (msg, ms) => showToast(msg, 'success', ms),
  error:   (msg, ms) => showToast(msg, 'error',   ms),
  warning: (msg, ms) => showToast(msg, 'warning', ms),
  info:    (msg, ms) => showToast(msg, 'info',    ms),
};

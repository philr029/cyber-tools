/**
 * sidebar.js — Mobile sidebar open/close behaviour.
 *
 * On desktop (≥1024 px) the sidebar is always visible in the flow;
 * on mobile it slides in as an overlay.
 */

let _open = false;

export function initSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const menuBtn  = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');

  if (!sidebar) return;

  menuBtn?.addEventListener('click',  () => openSidebar());
  closeBtn?.addEventListener('click', () => closeSidebar());
  overlay?.addEventListener('click',  () => closeSidebar());

  // Close when a nav link is tapped on mobile
  sidebar.querySelectorAll('.sidebar__nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) closeSidebar();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _open) closeSidebar();
  });

  // Ensure clean state on desktop resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) _cleanupOverlay();
  });
}

export function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuBtn = document.getElementById('menu-btn');

  _open = true;
  sidebar?.classList.add('sidebar--open');
  overlay?.classList.add('sidebar-overlay--visible');
  menuBtn?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

export function closeSidebar() {
  _cleanupOverlay();
}

/* ── Internal ───────────────────────────────────────────────────── */
function _cleanupOverlay() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuBtn = document.getElementById('menu-btn');

  _open = false;
  sidebar?.classList.remove('sidebar--open');
  overlay?.classList.remove('sidebar-overlay--visible');
  menuBtn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

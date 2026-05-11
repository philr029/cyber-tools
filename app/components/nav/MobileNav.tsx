"use client";

// =============================================================================
// MobileNav (mobile drawer)
// -----------------------------------------------------------------------------
// Slide-down drawer that mirrors the desktop mega menu. Each tool category is
// collapsible (accordion), only one section is open at a time. Closes on:
//   - Tapping a link
//   - Tapping the overlay
//   - Pressing Escape
//   - Route change
// The page body scroll is locked while the drawer is open to prevent the
// double-scroll feeling on iOS Safari.
// =============================================================================

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav-data";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  /** Auth section content rendered above the categories. */
  authSlot?: React.ReactNode;
  /** Extra utility links (Settings, Dashboard, etc.) rendered at the bottom. */
  utilitySlot?: React.ReactNode;
}

export default function MobileNav({ open, onClose, authSlot, utilitySlot }: MobileNavProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelId = useId();

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll while the drawer is open. We preserve the prior
  // overflow value rather than hard-coding "auto" so we don't clobber the
  // page's own scroll styles.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Auto-expand the section that contains the current route when the drawer
  // opens, so the user can see where they are. We only fire on the closed→open
  // transition (tracked via a ref) which avoids a cascading-render loop and
  // satisfies the react-hooks/set-state-in-effect rule.
  const prevOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (!open || wasOpen) return;
    const active = NAV_GROUPS.find(
      (g) => pathname === g.index || g.links.some((l) => pathname === l.href),
    );
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot update on open transition
      setExpanded(active.label);
    }
  }, [open, pathname]);

  // Move focus into the panel when it opens so screen readers and keyboard
  // users land in the right place.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => closeRef.current?.focus());
    }
  }, [open]);

  // Note: route-change closing is handled by each link's `onClick={onClose}`.
  // We avoid a pathname-watching effect because synchronous setState in an
  // effect cascades renders (react-hooks/set-state-in-effect).

  return (
    <>
      {/* Overlay — sits behind the panel, taps to close.
          z-[55] places it above other fixed UI (the ChatWidget FAB lives at
          z-50) so taps on the overlay strip actually hit our handler rather
          than getting absorbed by floating widgets. The drawer itself uses
          z-[60] to stay above the overlay. */}
      <div
        className={`xl:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer — anchored under the sticky header (h-14 = 3.5rem).
          We cap the height to ~82vh so there's always a visible overlay
          strip at the bottom for tap-to-close. The drawer itself scrolls
          internally if its content overflows. */}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`xl:hidden fixed inset-x-0 top-14 z-[60] max-h-[calc(82dvh-3.5rem)] overflow-y-auto rounded-b-2xl border-x border-b border-[#1e2d4a] bg-[#0b0f1a]/98 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] transition-transform duration-200 ease-out ${
          open ? "translate-y-0" : "-translate-y-2 pointer-events-none opacity-0"
        }`}
      >
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#1e2d4a]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <nav className="px-4 pb-6 pt-3" aria-label="Mobile navigation">
          {/* Top-level shortcuts */}
          <ul className="flex flex-col gap-0.5 mb-3">
            <MobileLink href="/" pathname={pathname} onNav={onClose}>
              Home
            </MobileLink>
            <MobileLink href="/tools" pathname={pathname} onNav={onClose}>
              All Tools
            </MobileLink>
            <MobileLink href="/pricing" pathname={pathname} onNav={onClose}>
              Pricing
            </MobileLink>
            <MobileLink href="/enterprise" pathname={pathname} onNav={onClose}>
              Enterprise
            </MobileLink>
            <MobileLink href="/about" pathname={pathname} onNav={onClose}>
              About
            </MobileLink>
          </ul>

          {/* Accordion sections — one expanded at a time */}
          <p className="px-2 py-1 mt-2 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Tool categories
          </p>
          <ul className="flex flex-col gap-1">
            {NAV_GROUPS.map((group) => {
              const isOpen = expanded === group.label;
              const isActive =
                pathname === group.index ||
                group.links.some((l) => pathname === l.href);
              return (
                <li key={group.label}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : group.label)}
                    aria-expanded={isOpen}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "text-cyan-400 bg-cyan-400/10"
                        : "text-slate-300 hover:text-slate-100 hover:bg-white/5"
                    }`}
                  >
                    <span>{group.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <ul className="mt-0.5 ml-2 pl-3 border-l border-[#1e2d4a] flex flex-col gap-0.5">
                      {group.links.map((link) => {
                        const linkActive = pathname === link.href;
                        if (link.comingSoon) {
                          return (
                            <li key={link.href}>
                              <span
                                className="flex items-center justify-between px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                                aria-disabled="true"
                              >
                                <span>{link.label}</span>
                                <span className="text-[10px] uppercase rounded bg-slate-700/40 px-1.5 py-0.5">
                                  Soon
                                </span>
                              </span>
                            </li>
                          );
                        }
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                linkActive
                                  ? "text-cyan-400 bg-cyan-400/10"
                                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                              }`}
                              aria-current={linkActive ? "page" : undefined}
                            >
                              {link.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {(authSlot || utilitySlot) && (
            <div className="mt-4 pt-4 border-t border-[#1e2d4a] flex flex-col gap-2">
              {utilitySlot}
              {authSlot}
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

function MobileLink({
  href,
  pathname,
  onNav,
  children,
}: {
  href: string;
  pathname: string;
  onNav: () => void;
  children: React.ReactNode;
}) {
  const active = pathname === href;
  return (
    <li>
      <Link
        href={href}
        onClick={onNav}
        className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
          active
            ? "text-cyan-400 bg-cyan-400/10"
            : "text-slate-300 hover:text-slate-100 hover:bg-white/5"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {children}
      </Link>
    </li>
  );
}

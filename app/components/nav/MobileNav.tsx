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
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, TOP_BAR_LINKS } from "./nav-data";
import SearchHotkeyText from "@/app/components/SearchHotkeyText";
import { navGroupContainsPath, navLinkMatchesPath } from "@/lib/navigation/path-match";

export const PRIMARY_MOBILE_NAV_ID = "primary-mobile-nav";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  /** Auth section content rendered above the categories. */
  authSlot?: React.ReactNode;
  /** Extra utility links (Settings, Dashboard, etc.) rendered at the bottom. */
  utilitySlot?: React.ReactNode;
  /** Opens the global search modal (header lifts state). */
  onOpenSearch?: () => void;
}

export default function MobileNav({ open, onClose, authSlot, utilitySlot, onOpenSearch }: MobileNavProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // We render through a portal at document.body to escape the header's
  // stacking context. Without this the dim overlay gets trapped behind
  // sibling fixed elements that paint above the header (e.g. the
  // floating ChatWidget FAB), which prevents tap-to-close from firing.
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

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
    const active = NAV_GROUPS.find((g) => navGroupContainsPath(g, pathname));
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

  if (!mounted) return null;
  if (!open) return null;
  if (typeof document === "undefined" || !document.body) return null;

  return createPortal(
    <>
      {/* Overlay — sits behind the panel, taps to close.
          z-[55] places it above other fixed UI (the ChatWidget FAB lives at
          z-50) so taps on the overlay strip actually hit our handler rather
          than getting absorbed by floating widgets. The drawer itself uses
          z-[60] to stay above the overlay. */}
      <div
        className={`lg:hidden fixed inset-0 z-[55] bg-[color-mix(in_srgb,var(--ss-page)_45%,#000)] backdrop-blur-md motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
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
        id={PRIMARY_MOBILE_NAV_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`lg:hidden fixed inset-x-0 top-14 z-[72] max-h-[calc(82dvh-3.5rem)] overflow-y-auto rounded-b-[1.35rem] border-x border-b border-[var(--ss-border)] glass-surface shadow-[0_20px_60px_rgba(0,0,0,0.38)] motion-safe:transition-[transform,opacity] motion-safe:duration-[220ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-y-0 opacity-100" : "-translate-y-2 pointer-events-none opacity-0"
        }`}
      >
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--ss-border)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)]">
            Menu
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="text-xs text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] px-2 py-1 rounded-full hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] transition-colors"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <nav className="px-4 pb-6 pt-3" aria-label="Mobile navigation">
          {onOpenSearch && (
            <button
              type="button"
              onClick={() => {
                onOpenSearch();
                onClose();
              }}
              className="mb-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border border-[var(--ss-border)] bg-[var(--ss-accent-soft)] text-sm font-semibold text-[var(--ss-text)] hover:border-[color-mix(in_srgb,var(--ss-accent)_45%,transparent)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.517 3.516a1 1 0 01-1.414 1.414l-3.516-3.517A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              Search site
              <span className="ml-auto text-[10px] text-[var(--ss-text-secondary)] font-normal">
                <SearchHotkeyText />
              </span>
            </button>
          )}

          {/* Top-level routes */}
          <ul className="flex flex-col gap-0.5 mb-3">
            {TOP_BAR_LINKS.map((link) => (
              <MobileLink
                key={link.href}
                href={link.href}
                pathname={pathname}
                onNav={onClose}
                active={
                  link.href === "/dashboard"
                    ? pathname.startsWith("/dashboard")
                    : link.href === "/automation-tools"
                      ? pathname === "/automation-tools" || pathname.startsWith("/tools/automation")
                      : link.href === "/tools/browse"
                        ? pathname.startsWith("/tools") ||
                          pathname.endsWith("-tools") ||
                          pathname === "/web-tools" ||
                          pathname === "/marketing-tools"
                        : link.href === "/docs"
                          ? pathname.startsWith("/docs")
                          : link.href === "/blog"
                            ? pathname.startsWith("/blog")
                            : undefined
                }
              >
                {link.label}
              </MobileLink>
            ))}
          </ul>

          <p className="px-2 py-1 mt-2 mb-1 text-[10px] font-semibold text-[var(--ss-text-secondary)] uppercase tracking-wider">
            Tools & categories
          </p>
          <ul className="flex flex-col gap-1">
            {NAV_GROUPS.map((group) => {
              const isOpen = expanded === group.label;
              const isActive = navGroupContainsPath(group, pathname);
              const sectionId = `${PRIMARY_MOBILE_NAV_ID}-cat-${group.label.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <li key={group.label}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : group.label)}
                    aria-expanded={isOpen}
                    aria-controls={sectionId}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                      isActive
                        ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)]"
                        : "text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
                    }`}
                  >
                    <span>
                      {group.emoji ? (
                        <span className="mr-1.5" aria-hidden>
                          {group.emoji}
                        </span>
                      ) : null}
                      {group.label}
                    </span>
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
                    <ul
                      id={sectionId}
                      role="region"
                      aria-label={group.label}
                      className="mt-0.5 ml-2 pl-3 border-l border-[var(--ss-border)] flex flex-col gap-0.5"
                    >
                      {group.links.map((link) => {
                        const linkActive = navLinkMatchesPath(pathname, link.href);
                        if (link.comingSoon) {
                          return (
                            <li key={`${link.href}-soon`}>
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
                          <li key={`${link.href}-${link.label}`}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                linkActive
                                  ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)]"
                                  : "text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
                              }`}
                              aria-current={linkActive ? "page" : undefined}
                            >
                              <span className="font-medium text-[var(--ss-text)]">{link.label}</span>
                              {link.description ? (
                                <span className="block text-xs text-[var(--ss-text-secondary)] mt-0.5">{link.description}</span>
                              ) : null}
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
            <div className="mt-4 pt-4 border-t border-[var(--ss-border)] flex flex-col gap-2">
              {utilitySlot}
              {authSlot}
            </div>
          )}
        </nav>
      </div>
    </>,
    document.body,
  );
}

function MobileLink({
  href,
  pathname,
  onNav,
  children,
  active: activeOverride,
}: {
  href: string;
  pathname: string;
  onNav: () => void;
  children: React.ReactNode;
  /** When set, overrides the default `pathname === href` active check. */
  active?: boolean;
}) {
  const active = activeOverride ?? pathname === href;
  return (
    <li>
      <Link
        href={href}
        onClick={onNav}
        className={`block px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
          active
            ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)]"
            : "text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {children}
      </Link>
    </li>
  );
}

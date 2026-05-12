"use client";

// =============================================================================
// MegaMenu (desktop)
// -----------------------------------------------------------------------------
// A single header-attached panel that lists every tool category in columns.
// Opens and closes via click/tap on the trigger, or via keyboard (Enter,
// Space, ArrowDown). Closes on Escape, outside pointer/touch, or when focus
// leaves the menu (blur). Mobile uses `MobileNav` instead — this component is
// hidden below the `xl` breakpoint.
//
// Note: We intentionally do not open on :hover / mouseenter. Combining hover
// open with a click toggle caused the menu to open on pointer enter and then
// immediately close on the following click (common on touch and many desktop
// browsers), which looked like a dead control on production.
// =============================================================================

import Link from "next/link";
import { useEffect, useId, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, type NavGroup } from "./nav-data";

// One accent colour per group — keeps the panel visually scannable without
// pulling in an icon library. Using Tailwind arbitrary classes inline so each
// colour stays in source for tree-shaking.
const GROUP_ACCENTS: Record<string, string> = {
  Coding: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  "IT Admin": "bg-sky-500/10 text-sky-300 ring-sky-500/20",
  "Web Tools": "bg-indigo-500/10 text-indigo-300 ring-indigo-500/20",
  Cyber: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
  "Microsoft 365": "bg-blue-500/10 text-blue-300 ring-blue-500/20",
  "Domain / IP": "bg-purple-500/10 text-purple-300 ring-purple-500/20",
  Automation: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  Business: "bg-teal-500/10 text-teal-300 ring-teal-500/20",
  Reporting: "bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-500/20",
  "Phone / Lead": "bg-orange-500/10 text-orange-300 ring-orange-500/20",
};

// Cap the number of links per column so the panel stays a comfortable height.
// Categories with more tools surface a "View all" link to the index page.
const MAX_LINKS_PER_GROUP = 6;

export default function MegaMenu({ label = "Tools" }: { label?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const triggerId = useId();

  const isAnyGroupActive = NAV_GROUPS.some(
    (g) => pathname === g.index || g.links.some((l) => pathname === l.href),
  );

  const handleLinkClick = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  // Close on Escape, returning focus to the trigger so keyboard users keep
  // their place in the tab order.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    if (typeof document === "undefined") return;
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Close on outside click/touch (pointerdown covers mouse, pen, and touch).
  useEffect(() => {
    if (!open) return;
    if (typeof document === "undefined") return;

    function handlePointerDown(e: PointerEvent) {
      const root = wrapperRef.current;
      if (!root) return;
      const t = e.target;
      if (!t || !(t instanceof Node)) return;
      if (!root.contains(t)) {
        setOpen(false);
      }
    }

    // Capture phase so we still see events that are stopped lower in the tree.
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  // Close when focus leaves the trigger + panel (Tab / programmatic focus moves).
  useEffect(() => {
    if (!open) return;
    const root = wrapperRef.current;
    if (!root) return;

    function onFocusOut(e: FocusEvent) {
      const el = wrapperRef.current;
      if (!el) return;
      const rt = e.relatedTarget;
      if (rt instanceof Node && el.contains(rt)) return;
      setOpen(false);
    }

    root.addEventListener("focusout", onFocusOut);
    return () => root.removeEventListener("focusout", onFocusOut);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown" && e.key !== " " && e.key !== "Enter") return;
          e.preventDefault();
          setOpen(true);
          requestAnimationFrame(() => {
            const root = wrapperRef.current;
            if (!root) return;
            const first = root.querySelector<HTMLAnchorElement>("[data-mega-link]");
            first?.focus();
          });
        }}
        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          isAnyGroupActive || open
            ? "text-cyan-400 bg-cyan-400/10"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={panelId}
      >
        {label}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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

      {/* Mega panel — fixed in viewport so it can be full-width without
          pushing the trigger. z-[70] keeps it above sticky header (z-50) and
          typical page overlays. pointer-events-none while closed keeps hit
          targets accurate. */}
      <div
        id={panelId}
        role="menu"
        aria-label={`${label} categories`}
        aria-labelledby={triggerId}
        className={`fixed left-1/2 -translate-x-1/2 top-[3.5rem] z-[70] w-[min(1200px,calc(100vw-2rem))] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-[#1e2d4a] bg-[#0b0f1a]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-150 ease-out ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
        hidden={!open}
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5 p-6">
          {NAV_GROUPS.map((group) => (
            <MegaColumn
              key={group.label}
              group={group}
              pathname={pathname}
              onLinkClick={handleLinkClick}
            />
          ))}
        </div>
        <div className="border-t border-[#1e2d4a] px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">Looking for something specific?</span>
          <Link
            href="/tools"
            data-mega-link
            onClick={handleLinkClick}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Browse all tools →
          </Link>
        </div>
      </div>
    </div>
  );
}

function MegaColumn({
  group,
  pathname,
  onLinkClick,
}: {
  group: NavGroup;
  pathname: string;
  onLinkClick: () => void;
}) {
  const accent = GROUP_ACCENTS[group.label] ?? "bg-slate-500/10 text-slate-300 ring-slate-500/20";
  // Skip the "All <category> tools" entry — we already link to it via the
  // group heading and the "View all" footer link.
  const featuredLinks = group.links
    .filter((l) => l.href !== group.index)
    .slice(0, MAX_LINKS_PER_GROUP);
  const hasMore = group.links.filter((l) => l.href !== group.index).length > MAX_LINKS_PER_GROUP;

  return (
    <div>
      <Link
        href={group.index}
        data-mega-link
        onClick={onLinkClick}
        className={`group flex items-start gap-2 mb-2.5 rounded-lg px-2 py-1.5 -mx-2 hover:bg-white/5 transition-colors`}
      >
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ring-1 text-[10px] font-bold uppercase ${accent}`}
        >
          {group.label.slice(0, 2)}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
            {group.label}
          </span>
          {group.tagline && (
            <span className="block text-[11px] text-slate-500 leading-tight">{group.tagline}</span>
          )}
        </span>
      </Link>
      <ul className="flex flex-col gap-0.5">
        {featuredLinks.map((link) => {
          const active = pathname === link.href;
          if (link.comingSoon) {
            return (
              <li key={link.href}>
                <span
                  className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded-md text-slate-500 cursor-not-allowed"
                  aria-disabled="true"
                  title="Coming soon"
                >
                  <span>{link.label}</span>
                  <span className="text-[9px] uppercase tracking-wider rounded bg-slate-700/40 px-1.5 py-0.5 text-slate-400">
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
                data-mega-link
                role="menuitem"
                onClick={onLinkClick}
                className={`block px-2 py-1.5 text-xs rounded-md transition-colors ${
                  active
                    ? "text-cyan-400 bg-cyan-400/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        {hasMore && (
          <li>
            <Link
              href={group.index}
              data-mega-link
              onClick={onLinkClick}
              className="block px-2 py-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all {group.label.toLowerCase()} tools →
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

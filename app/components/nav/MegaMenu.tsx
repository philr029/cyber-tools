"use client";

// =============================================================================
// MegaMenu (desktop, lg+)
// -----------------------------------------------------------------------------
// Curated category columns, popular / new strips, then recently opened tools.
// =============================================================================

import Link from "next/link";
import { useEffect, useId, useRef, useState, useCallback, useMemo, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { Browser, ChartBar, GearSix, Megaphone, ShieldCheck, TreeStructure, UserGear, type IconProps } from "@phosphor-icons/react";
import { MEGA_MENU_POPULAR, NAV_GROUPS, type NavGroup } from "./nav-data";
import SearchHotkeyText from "@/app/components/SearchHotkeyText";
import MegaMenuRecentStrip from "@/app/components/nav/MegaMenuRecentStrip";
import { navGroupContainsPath, navLinkMatchesPath } from "@/lib/navigation/path-match";
import { recentlyAddedToolsList } from "@/lib/tools/site-catalog";

const GROUP_ICONS: Record<string, ComponentType<IconProps>> = {
  security: ShieldCheck,
  domain: TreeStructure,
  marketing: Megaphone,
  automation: GearSix,
  webqa: Browser,
  admin: UserGear,
  reports: ChartBar,
};

const GROUP_ACCENTS: Record<string, string> = {
  security: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
  domain: "bg-teal-500/10 text-teal-300 ring-teal-500/20",
  marketing: "bg-pink-500/10 text-pink-300 ring-pink-500/20",
  automation: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  webqa: "bg-orange-500/10 text-orange-200 ring-orange-500/20",
  admin: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
  reports: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
};

const DEFAULT_MAX_LINKS = 6;

export default function MegaMenu({
  label = "Tools",
  open,
  onOpenChange,
}: {
  label?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const panelId = useId();
  const triggerId = useId();

  const recentAddedTools = useMemo(() => (open ? recentlyAddedToolsList(6) : []), [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    function sync() {
      setFinePointer(mq.matches);
    }
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const clearTimers = useCallback(() => {
    if (typeof window === "undefined") return;
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const isAnyGroupActive =
    NAV_GROUPS.some((g) => navGroupContainsPath(g, pathname)) ||
    pathname.startsWith("/marketing-tools") ||
    pathname.startsWith("/tools/browse") ||
    pathname.startsWith("/tools/preview") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/day-to-day-tools");

  const handleLinkClick = useCallback(() => onOpenChange(false), [onOpenChange]);

  const scheduleOpen = useCallback(() => {
    if (!finePointer) return;
    clearTimers();
    openTimer.current = window.setTimeout(() => onOpenChange(true), 90);
  }, [clearTimers, finePointer, onOpenChange]);

  const scheduleClose = useCallback(() => {
    if (!finePointer) return;
    clearTimers();
    closeTimer.current = window.setTimeout(() => onOpenChange(false), 340);
  }, [clearTimers, finePointer, onOpenChange]);

  const cancelCloseAndKeepOpen = useCallback(() => {
    clearTimers();
    onOpenChange(true);
  }, [clearTimers, onOpenChange]);

  const toggle = useCallback(() => {
    clearTimers();
    onOpenChange(!open);
  }, [clearTimers, onOpenChange, open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      onOpenChange(false);
      triggerRef.current?.focus();
    }
    if (typeof document === "undefined") return;
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    if (typeof document === "undefined") return;

    function handlePointerDown(e: PointerEvent) {
      const root = wrapperRef.current;
      if (!root) return;
      const t = e.target;
      if (!t || !(t instanceof Node)) return;
      if (!root.contains(t)) {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const root = wrapperRef.current;
    if (!root) return;

    function onFocusOut(e: FocusEvent) {
      const el = wrapperRef.current;
      if (!el) return;
      const rt = e.relatedTarget;
      if (rt instanceof Node && el.contains(rt)) return;
      onOpenChange(false);
    }

    root.addEventListener("focusout", onFocusOut);
    return () => root.removeEventListener("focusout", onFocusOut);
  }, [open, onOpenChange]);

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        onClick={toggle}
        onMouseDown={clearTimers}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown" && e.key !== " " && e.key !== "Enter") return;
          e.preventDefault();
          clearTimers();
          onOpenChange(true);
          requestAnimationFrame(() => {
            const root = wrapperRef.current;
            if (!root) return;
            const first = root.querySelector<HTMLAnchorElement>("[data-mega-link]");
            first?.focus();
          });
        }}
        className={`ss-pill flex items-center gap-1 px-3 py-1.5 text-xs font-semibold motion-safe:transition-colors motion-safe:duration-200 ${
          isAnyGroupActive || open
            ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)]"
            : "text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
        }`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={open ? "Close tools menu" : "Open tools menu"}
      >
        {label}
        <svg
          className={`w-3 h-3 motion-safe:transition-transform motion-safe:duration-200 ${open ? "rotate-180" : ""}`}
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

      {open && finePointer ? (
        <div
          aria-hidden
          className="fixed left-1/2 -translate-x-1/2 top-14 z-[69] h-5 w-[min(1200px,calc(100vw-1.25rem))]"
          onMouseEnter={cancelCloseAndKeepOpen}
          onMouseLeave={scheduleClose}
        />
      ) : null}

      <div
        id={panelId}
        role="navigation"
        aria-label={`${label} categories`}
        aria-labelledby={triggerId}
        onMouseEnter={cancelCloseAndKeepOpen}
        onMouseLeave={scheduleClose}
        className={`fixed left-1/2 -translate-x-1/2 top-[3.5rem] z-[70] w-[min(1200px,calc(100vw-1.25rem))] max-h-[calc(100vh-4.5rem)] overflow-y-auto rounded-[1.375rem] border border-[var(--ss-border)] glass-surface shadow-[0_22px_72px_rgba(0,0,0,0.42)] motion-safe:transition-[opacity,transform,filter] motion-safe:duration-[220ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
            : "opacity-0 -translate-y-2 pointer-events-none scale-[0.99] motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-0"
        }`}
        hidden={!open}
        inert={!open}
      >
        <div className="border-b border-[var(--ss-border)] px-6 sm:px-7 py-4 space-y-4 bg-[color-mix(in_srgb,var(--ss-text)_2%,transparent)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)] mb-2">
              🔍 Popular tools
            </p>
            <ul className="flex flex-wrap gap-2">
              {MEGA_MENU_POPULAR.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-mega-link
                    onClick={handleLinkClick}
                    className="inline-flex max-w-[14rem] truncate rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-1 text-[11px] font-medium text-[var(--ss-text)] motion-safe:transition-[border-color,transform,background-color] motion-safe:duration-200 hover:border-[color-mix(in_srgb,var(--ss-accent)_40%,transparent)] hover:text-[var(--ss-accent)] motion-safe:hover:-translate-y-px"
                    title={link.description}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)] mb-2">
              ✨ Recently added
            </p>
            <ul className="flex flex-wrap gap-2">
              {recentAddedTools.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    data-mega-link
                    onClick={handleLinkClick}
                    className="inline-flex max-w-[14rem] truncate rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-accent-soft)_40%,transparent)] px-3 py-1 text-[11px] font-medium text-[var(--ss-text)] motion-safe:transition-[border-color,transform] motion-safe:duration-200 hover:border-[color-mix(in_srgb,var(--ss-accent)_45%,transparent)] hover:text-[var(--ss-accent)] motion-safe:hover:-translate-y-px"
                    title={t.description}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <MegaMenuRecentStrip onNavigate={handleLinkClick} menuOpen={open} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-6 p-6 sm:p-7">
          {NAV_GROUPS.map((group) => (
            <MegaColumn key={group.label} group={group} pathname={pathname} onLinkClick={handleLinkClick} />
          ))}
        </div>

        <div className="border-t border-[var(--ss-border)] px-6 sm:px-7 py-3.5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs bg-[color-mix(in_srgb,var(--ss-text)_2%,transparent)]">
          <span className="text-[var(--ss-text-secondary)] flex flex-wrap items-center gap-1">
            Press <SearchHotkeyText className="font-mono text-[var(--ss-text)]" /> for instant search, or{" "}
            <Link href="/search" data-mega-link onClick={handleLinkClick} className="text-[var(--ss-accent)] hover:underline font-semibold">
              open the search page
            </Link>
            .
          </span>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              data-mega-link
              onClick={handleLinkClick}
              className="text-[var(--ss-accent)] hover:underline font-semibold transition-colors"
            >
              Help & docs
            </Link>
            <Link
              href="/blog"
              data-mega-link
              onClick={handleLinkClick}
              className="text-[var(--ss-text-secondary)] hover:text-[var(--ss-accent)] font-medium transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/projects"
              data-mega-link
              onClick={handleLinkClick}
              className="text-[var(--ss-text-secondary)] hover:text-[var(--ss-accent)] font-medium transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/about"
              data-mega-link
              onClick={handleLinkClick}
              className="text-[var(--ss-text-secondary)] hover:text-[var(--ss-accent)] font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              data-mega-link
              onClick={handleLinkClick}
              className="text-[var(--ss-text-secondary)] hover:text-[var(--ss-accent)] font-medium transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/pricing"
              data-mega-link
              onClick={handleLinkClick}
              className="text-[var(--ss-text-secondary)] hover:text-[var(--ss-accent)] font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/enterprise"
              data-mega-link
              onClick={handleLinkClick}
              className="text-[var(--ss-text-secondary)] hover:text-[var(--ss-accent)] font-medium transition-colors"
            >
              Enterprise
            </Link>
            <Link
              href="/tools"
              data-mega-link
              onClick={handleLinkClick}
              className="text-[var(--ss-accent)] hover:underline font-semibold transition-colors"
            >
              Browse all tools →
            </Link>
          </div>
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
  const iconKey = group.iconKey ?? "security";
  const accent = GROUP_ACCENTS[iconKey] ?? "bg-slate-500/10 text-slate-300 ring-slate-500/20";
  const Icon = GROUP_ICONS[iconKey] ?? TreeStructure;
  const max = group.maxFeaturedLinks ?? DEFAULT_MAX_LINKS;
  const featuredLinks = group.links.filter((l) => l.href !== group.index).slice(0, max);
  const hasMore = group.links.filter((l) => l.href !== group.index).length > max;

  return (
    <div>
      <Link
        href={group.index}
        data-mega-link
        onClick={onLinkClick}
        aria-current={navLinkMatchesPath(pathname, group.index) ? "page" : undefined}
        className={`group flex items-start gap-2 mb-2.5 rounded-xl px-2 py-1.5 -mx-2 hover:bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] motion-safe:transition-colors ${
          navLinkMatchesPath(pathname, group.index) ? "bg-[var(--ss-accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_28%,transparent)]" : ""
        }`}
      >
        <span aria-hidden="true" className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${accent}`}>
          <Icon className="h-5 w-5" weight="duotone" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[var(--ss-text)] group-hover:text-[var(--ss-accent)] motion-safe:transition-colors">
            {group.emoji ? (
              <span className="mr-1 inline-block" aria-hidden>
                {group.emoji}
              </span>
            ) : null}
            {group.label}
          </span>
          {group.tagline && (
            <span className="block text-[11px] text-[var(--ss-text-secondary)] leading-tight">{group.tagline}</span>
          )}
        </span>
      </Link>
      <ul className="flex flex-col gap-1">
        {featuredLinks.map((link) => {
          const active = navLinkMatchesPath(pathname, link.href);
          if (link.comingSoon) {
            return (
              <li key={link.href}>
                <span
                  className="flex flex-col gap-0.5 px-2 py-1.5 text-xs rounded-md text-slate-500 cursor-not-allowed"
                  aria-disabled="true"
                  title="Coming soon"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{link.label}</span>
                    <span className="text-[9px] uppercase tracking-wider rounded bg-slate-700/40 px-1.5 py-0.5 text-slate-400">
                      Soon
                    </span>
                  </span>
                </span>
              </li>
            );
          }
          return (
            <li key={`${link.href}-${link.label}`}>
              <Link
                href={link.href}
                data-mega-link
                onClick={onLinkClick}
                className={`block px-2 py-1.5 text-xs rounded-lg motion-safe:transition-colors ${
                  active
                    ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)]"
                    : "text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="font-medium text-[var(--ss-text)]">{link.label}</span>
                {link.description ? (
                  <span className="block text-[11px] text-[var(--ss-text-secondary)] leading-snug mt-0.5">{link.description}</span>
                ) : null}
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
              className="block px-2 py-1.5 text-[11px] font-semibold text-[var(--ss-accent)] hover:underline transition-colors"
            >
              View all in {group.label} →
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

"use client";

// =============================================================================
// MegaMenu (desktop, xl+)
// -----------------------------------------------------------------------------
// Category panel for all tools. Opens on click, fine-pointer hover (with short
// delays), and ArrowDown / Enter on the trigger. Closes on Escape, outside
// pointer, or focus leaving the menu surface.
// =============================================================================

import Link from "next/link";
import { useEffect, useId, useRef, useState, useCallback, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Code,
  GearSix,
  Globe,
  Megaphone,
  ShieldCheck,
  Sparkle,
  TreeStructure,
  type IconProps,
} from "@phosphor-icons/react";
import { NAV_GROUPS, type NavGroup } from "./nav-data";
import SearchHotkeyText from "@/app/components/SearchHotkeyText";

const GROUP_ICONS: Record<string, ComponentType<IconProps>> = {
  "Website Testing Tools": Globe,
  "Domain & DNS Tools": TreeStructure,
  "Security Tools": ShieldCheck,
  "Marketing Tools": Megaphone,
  "Automation Tools": GearSix,
  "Coding/Developer Tools": Code,
  "AI Tools": Sparkle,
  "Business/Productivity Tools": Briefcase,
};

const GROUP_ACCENTS: Record<string, string> = {
  "Website Testing Tools": "bg-indigo-500/10 text-indigo-300 ring-indigo-500/20",
  "Domain & DNS Tools": "bg-teal-500/10 text-teal-300 ring-teal-500/20",
  "Security Tools": "bg-rose-500/10 text-rose-300 ring-rose-500/20",
  "Automation Tools": "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  "Marketing Tools": "bg-pink-500/10 text-pink-300 ring-pink-500/20",
  "AI Tools": "bg-violet-500/10 text-violet-300 ring-violet-500/20",
  "Coding/Developer Tools": "bg-sky-500/10 text-sky-300 ring-sky-500/20",
  "Business/Productivity Tools": "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
};

const DEFAULT_MAX_LINKS = 6;

export default function MegaMenu({ label = "Tools" }: { label?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const panelId = useId();
  const triggerId = useId();

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
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const isAnyGroupActive =
    NAV_GROUPS.some((g) => pathname === g.index || g.links.some((l) => pathname === l.href)) ||
    pathname.startsWith("/marketing-tools") ||
    pathname.startsWith("/tools/browse") ||
    pathname.startsWith("/tools/preview") ||
    pathname.startsWith("/search");

  const handleLinkClick = useCallback(() => setOpen(false), []);

  const scheduleOpen = useCallback(() => {
    if (!finePointer) return;
    clearTimers();
    openTimer.current = window.setTimeout(() => setOpen(true), 90);
  }, [clearTimers, finePointer]);

  const scheduleClose = useCallback(() => {
    if (!finePointer) return;
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpen(false), 220);
  }, [clearTimers, finePointer]);

  const cancelCloseAndKeepOpen = useCallback(() => {
    clearTimers();
    setOpen(true);
  }, [clearTimers]);

  const toggle = useCallback(() => {
    clearTimers();
    setOpen((v) => !v);
  }, [clearTimers]);

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
        onMouseDown={clearTimers}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown" && e.key !== " " && e.key !== "Enter") return;
          e.preventDefault();
          clearTimers();
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
        aria-haspopup="dialog"
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

      {/* Invisible hover bridge: the Tools trigger is narrow while the panel is wide; without
          this strip, moving the pointer from the button toward the panel leaves the trigger
          hit area and fires a delayed close before the cursor reaches the menu. */}
      {open && finePointer ? (
        <div
          aria-hidden
          className="fixed left-1/2 -translate-x-1/2 top-14 z-[69] h-5 w-[min(1200px,calc(100vw-1.25rem))]"
          onMouseEnter={cancelCloseAndKeepOpen}
          onMouseLeave={scheduleClose}
        />
      ) : null}

      {/* Mega panel — fixed under header */}
      <div
        id={panelId}
        role="navigation"
        aria-label={`${label} categories`}
        aria-labelledby={triggerId}
        onMouseEnter={cancelCloseAndKeepOpen}
        onMouseLeave={scheduleClose}
        className={`fixed left-1/2 -translate-x-1/2 top-[3.5rem] z-[70] w-[min(1200px,calc(100vw-1.25rem))] max-h-[calc(100vh-4.5rem)] overflow-y-auto rounded-2xl border border-[#1e2d4a] bg-[#0b0f1a]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1.5 pointer-events-none motion-reduce:translate-y-0 motion-reduce:opacity-0"
        }`}
        hidden={!open}
        inert={!open}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-5 p-6">
          {NAV_GROUPS.map((group) => (
            <MegaColumn
              key={group.label}
              group={group}
              pathname={pathname}
              onLinkClick={handleLinkClick}
            />
          ))}
        </div>
        <div className="border-t border-[#1e2d4a] px-6 py-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs">
          <span className="text-slate-500 flex flex-wrap items-center gap-1">
            Press <SearchHotkeyText className="font-mono text-slate-400" /> for instant search, or{" "}
            <Link href="/search" data-mega-link onClick={handleLinkClick} className="text-cyan-400 hover:text-cyan-300 font-medium">
              open the search page
            </Link>
            .
          </span>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              data-mega-link
              onClick={handleLinkClick}
              className="text-slate-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/about"
              data-mega-link
              onClick={handleLinkClick}
              className="text-slate-400 hover:text-cyan-300 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              data-mega-link
              onClick={handleLinkClick}
              className="text-slate-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/pricing"
              data-mega-link
              onClick={handleLinkClick}
              className="text-slate-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/enterprise"
              data-mega-link
              onClick={handleLinkClick}
              className="text-slate-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Enterprise
            </Link>
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
  const Icon = GROUP_ICONS[group.label] ?? Globe;
  const max = group.maxFeaturedLinks ?? DEFAULT_MAX_LINKS;
  const featuredLinks = group.links.filter((l) => l.href !== group.index).slice(0, max);
  const hasMore = group.links.filter((l) => l.href !== group.index).length > max;

  return (
    <div>
      <Link
        href={group.index}
        data-mega-link
        onClick={onLinkClick}
        className="group flex items-start gap-2 mb-2.5 rounded-lg px-2 py-1.5 -mx-2 hover:bg-white/5 transition-colors"
      >
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${accent}`}
        >
          <Icon className="h-5 w-5" weight="duotone" aria-hidden />
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
      <ul className="flex flex-col gap-1">
        {featuredLinks.map((link) => {
          const active = pathname === link.href;
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
                className={`block px-2 py-1.5 text-xs rounded-md transition-colors ${
                  active ? "text-cyan-400 bg-cyan-400/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="font-medium text-slate-200/95">{link.label}</span>
                {link.description ? (
                  <span className="block text-[11px] text-slate-500 leading-snug mt-0.5">{link.description}</span>
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
              className="block px-2 py-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all in {group.label} →
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

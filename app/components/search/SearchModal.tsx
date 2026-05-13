"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Briefcase,
  Bug,
  Certificate,
  GithubLogo,
  Lock,
  MagnifyingGlass,
  Plugs,
  ShieldCheck,
  Student,
  UserGear,
  type IconProps,
} from "@phosphor-icons/react";
import {
  SEARCH_CATEGORIES,
  SEARCH_TOOL_TYPES,
  SEARCH_TOOLKIT_AREA_FILTERS,
  escapeRegExp,
  entriesForUrls,
  popularEntries,
  readRecentSearches,
  rememberSearchVisit,
  searchSite,
  type SearchCategoryFilter,
  type SearchToolkitAreaFilter,
  type SearchToolType,
  type SiteSearchEntry,
} from "@/lib/search/site-search";
import SearchHotkeyText from "@/app/components/SearchHotkeyText";

const SEARCH_ENTRY_ICONS: Record<string, ComponentType<IconProps>> = {
  BookOpen,
  Certificate,
  ShieldCheck,
  GithubLogo,
  Briefcase,
  Student,
  Bug,
  Lock,
  UserGear,
  Plugs,
  MagnifyingGlass,
};

function highlightText(text: string, query: string): ReactNode {
  try {
    const q = query.trim();
    if (!q) return text;
    const parts = q.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return text;
    const pattern = new RegExp(`(${parts.map(escapeRegExp).join("|")})`, "gi");
    const segments = text.split(pattern);
    return segments.map((seg, i) => {
      const isHit = parts.some((p) => seg.toLowerCase() === p.toLowerCase());
      if (isHit && seg) {
        return (
          <mark key={i} className="rounded-md bg-[var(--ss-accent-soft)] text-[var(--ss-accent)] px-0.5">
            {seg}
          </mark>
        );
      }
      return <span key={i}>{seg}</span>;
    });
  } catch {
    return text;
  }
}

const TYPE_LABELS: Record<SearchToolType | "all", string> = {
  all: "All types",
  hub: "Hub / landing",
  tool: "Tool",
  page: "Page",
  dashboard: "Dashboard",
  marketing: "Marketing",
  auth: "Auth",
};

/** Stable id for `aria-controls` on the header search trigger (dialog may be unmounted when closed). */
export const GLOBAL_SEARCH_DIALOG_ID = "ss-global-search-dialog";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const dialogId = useId();
  const titleId = `${dialogId}-heading`;
  const inputId = `${dialogId}-input`;
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategoryFilter>("all");
  const [toolType, setToolType] = useState<SearchToolType | "all">("all");
  const [toolkitArea, setToolkitArea] = useState<SearchToolkitAreaFilter>("all");
  const [activeIndex, setActiveIndex] = useState(-1);
  const recentUrls = useMemo(() => (open ? readRecentSearches() : []), [open]);
  const [portalReady, setPortalReady] = useState(false);

  useLayoutEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
    }
  }, [open]);

  const results = useMemo(
    () => searchSite({ query, category, toolType, toolkitArea, limit: 50 }),
    [query, category, toolType, toolkitArea],
  );

  const spotlight = useMemo(() => {
    if (query.trim()) return [];
    const recent = entriesForUrls(recentUrls);
    if (recent.length) return recent;
    return popularEntries();
  }, [query, recentUrls]);

  const filtersActive = category !== "all" || toolType !== "all" || toolkitArea !== "all";
  const filterBrowse = useMemo(() => {
    if (query.trim()) return [];
    if (!filtersActive) return [];
    return searchSite({ query: "", category, toolType, toolkitArea, limit: 50 });
  }, [query, category, toolType, toolkitArea, filtersActive]);

  const keyboardTargets = useMemo(() => {
    if (query.trim()) return results;
    if (filtersActive) return filterBrowse;
    return spotlight;
  }, [query, results, spotlight, filterBrowse, filtersActive]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, category, toolType, toolkitArea, filtersActive, keyboardTargets]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target;
      if (!t || !(t instanceof Node)) return;
      if (panelRef.current && !panelRef.current.contains(t)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, onClose]);

  const goToEntry = useCallback(
    (entry: SiteSearchEntry) => {
      rememberSearchVisit(entry.url);
      onClose();
      router.push(entry.url);
    },
    [onClose, router],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const isK = e.key === "k" || e.key === "K";
      if ((e.metaKey || e.ctrlKey) && isK && !e.altKey) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      const max = keyboardTargets.length - 1;
      if (max < 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < max ? i + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : max));
        return;
      }
      if (e.key === "Enter") {
        const target = e.target as HTMLElement | null;
        if (target && target.closest("select")) return;
        // While typing in the search field, Enter should not jump to the first hit unless
        // the user explicitly moved highlight with arrow keys (avoids surprise navigation).
        if (target?.closest("input")) {
          if (activeIndex < 0) return;
        }
        const pick =
          activeIndex >= 0 && activeIndex <= max
            ? keyboardTargets[activeIndex]
            : (keyboardTargets[0] ?? null);
        if (!pick) return;
        e.preventDefault();
        goToEntry(pick);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, keyboardTargets, activeIndex, goToEntry]);

  useEffect(() => {
    if (activeIndex < 0 || !panelRef.current) return;
    const row = panelRef.current.querySelector<HTMLElement>(`[data-search-hit="${activeIndex}"]`);
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const reset = useCallback(() => {
    setQuery("");
    setCategory("all");
    setToolType("all");
    setToolkitArea("all");
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handlePick = useCallback(
    (url: string) => {
      rememberSearchVisit(url);
      onClose();
    },
    [onClose],
  );

  if (!open || !portalReady || typeof document === "undefined" || !document.body) return null;

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-start justify-center sm:pt-[10vh] pt-5 px-4 sm:px-5 motion-safe:animate-search-backdrop pointer-events-auto">
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--ss-page)_52%,#000)] backdrop-blur-xl motion-safe:transition-opacity motion-safe:duration-200 cursor-default"
        aria-hidden
        onClick={onClose}
      />

      <div
        ref={panelRef}
        id={GLOBAL_SEARCH_DIALOG_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-xl max-h-[min(560px,86dvh)] flex flex-col rounded-[1.375rem] sm:rounded-[1.5rem] border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_94%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--ss-text)_4%,transparent),0_22px_72px_rgba(0,0,0,0.36)] overflow-hidden motion-safe:animate-search-panel ring-1 ring-[color-mix(in_srgb,var(--ss-text)_5%,transparent)]"
      >
        <h2 id={titleId} className="sr-only">
          Site search
        </h2>
        <div className="border-b border-[color-mix(in_srgb,var(--ss-border)_80%,transparent)] px-4 sm:px-5 py-4 flex items-center gap-3 bg-[color-mix(in_srgb,var(--ss-elevated-solid)_35%,transparent)]">
          <svg
            className="w-5 h-5 text-[var(--ss-accent)] shrink-0 motion-safe:transition-transform motion-safe:duration-200 hover:scale-105"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.517 3.516a1 1 0 01-1.414 1.414l-3.516-3.517A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tools, categories, routes…"
            autoComplete="off"
            className="flex-1 min-w-0 bg-transparent text-[15px] sm:text-base text-[var(--ss-text)] caret-[var(--ss-accent)] placeholder:text-[color-mix(in_srgb,var(--ss-text-secondary)_72%,transparent)] focus:outline-none tracking-tight"
            aria-label="Search query"
          />
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--ss-text-secondary)] shrink-0">
            <SearchHotkeyText className="font-mono border border-[var(--ss-border)] rounded-full px-1.5 py-0.5 bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)]" />
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-accent)] px-2.5 py-1.5 rounded-full hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-elevated-solid)]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] px-2.5 py-1.5 rounded-full hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-elevated-solid)]"
          >
            Close
          </button>
        </div>

        <div className="px-4 sm:px-5 py-3 flex flex-wrap gap-2 border-b border-[color-mix(in_srgb,var(--ss-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_50%,transparent)]">
          <label className="sr-only" htmlFor={`${dialogId}-cat`}>
            Category
          </label>
          <select
            id={`${dialogId}-cat`}
            value={category}
            onChange={(e) => setCategory(e.target.value as SearchCategoryFilter)}
            className="text-xs rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_90%,transparent)] text-[var(--ss-text)] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ss-ring)]"
          >
            {SEARCH_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${dialogId}-area`}>
            Portfolio area
          </label>
          <select
            id={`${dialogId}-area`}
            value={toolkitArea}
            onChange={(e) => setToolkitArea(e.target.value as SearchToolkitAreaFilter)}
            className="text-xs rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_90%,transparent)] text-[var(--ss-text)] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ss-ring)]"
          >
            {SEARCH_TOOLKIT_AREA_FILTERS.map((a) => (
              <option key={a} value={a}>
                {a === "all" ? "All portfolio areas" : a}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${dialogId}-type`}>
            Type
          </label>
          <select
            id={`${dialogId}-type`}
            value={toolType}
            onChange={(e) => setToolType(e.target.value as SearchToolType | "all")}
            className="text-xs rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_90%,transparent)] text-[var(--ss-text)] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ss-ring)]"
          >
            {(["all", ...SEARCH_TOOL_TYPES] as const).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 motion-safe:transition-[opacity] motion-safe:duration-150">
          {!query.trim() && !filtersActive && spotlight.length > 0 && (
            <div className="mb-3 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)] mb-2">
                {recentUrls.length ? "Recent" : "Popular"}
              </p>
              <ul className="flex flex-col gap-0.5">
                {spotlight.map((e, i) => (
                  <ResultRow
                    key={`spot-${e.url}`}
                    entry={e}
                    query={query}
                    onPick={handlePick}
                    subtle
                    selected={activeIndex === i}
                    hitIndex={i}
                  />
                ))}
              </ul>
            </div>
          )}

          {!query.trim() && filterBrowse.length > 0 && (
            <div className="mb-3 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)] mb-2">
                Matches current filters
              </p>
              <ul className="flex flex-col gap-0.5">
                {filterBrowse.map((e, i) => (
                  <ResultRow
                    key={`fb-${e.url}`}
                    entry={e}
                    query={query}
                    onPick={handlePick}
                    subtle
                    selected={activeIndex === i}
                    hitIndex={i}
                  />
                ))}
              </ul>
            </div>
          )}

          {!query.trim() && filtersActive && filterBrowse.length === 0 && (
            <p className="mx-2 my-2 rounded-2xl border border-dashed border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)] px-4 py-8 text-center text-sm text-[var(--ss-text-secondary)] leading-relaxed">
              Nothing matches these filters.
            </p>
          )}

          {query.trim() && (
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)]">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
          )}

          <ul className="flex flex-col gap-0.5">
            {(query.trim() ? results : []).map((e, i) => (
              <ResultRow
                key={e.url}
                entry={e}
                query={query}
                onPick={handlePick}
                selected={activeIndex === i}
                hitIndex={i}
              />
            ))}
          </ul>

          {query.trim() && results.length === 0 && (
            <div className="mx-2 my-2 rounded-2xl border border-dashed border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)] px-4 py-10 text-center space-y-3">
              <p className="text-sm font-medium tracking-tight text-[var(--ss-text)]">No results found</p>
              <p className="text-xs text-[var(--ss-text-secondary)] max-w-xs mx-auto leading-relaxed">
                Try a shorter keyword, switch category, or browse the full toolkit.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <Link
                  href="/pricing"
                  onClick={() => handlePick("/pricing")}
                  className="text-xs font-semibold rounded-full border border-[var(--ss-border)] text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] px-3.5 py-2 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-elevated-solid)]"
                >
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  onClick={() => handlePick("/blog")}
                  className="text-xs font-semibold rounded-full border border-[var(--ss-border)] text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] px-3.5 py-2 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-elevated-solid)]"
                >
                  Blog
                </Link>
                <Link
                  href="/tools/browse"
                  onClick={() => handlePick("/tools/browse")}
                  className="text-xs font-semibold rounded-full bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] hover:opacity-95 text-white px-3.5 py-2 motion-safe:transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-elevated-solid)]"
                >
                  Open toolkit index
                </Link>
                <Link
                  href="/tools"
                  onClick={() => handlePick("/tools")}
                  className="text-xs font-semibold rounded-full border border-[var(--ss-border)] text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] px-3.5 py-2 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-elevated-solid)]"
                >
                  Security suite
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-semibold rounded-full border border-[var(--ss-border)] text-[var(--ss-text-secondary)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] px-3.5 py-2 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-elevated-solid)]"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function ResultRow({
  entry,
  query,
  onPick,
  subtle,
  selected,
  hitIndex,
}: {
  entry: SiteSearchEntry;
  query: string;
  onPick: (url: string) => void;
  subtle?: boolean;
  selected?: boolean;
  hitIndex?: number;
}) {
  const href = entry.url;
  const IconCmp = entry.icon && SEARCH_ENTRY_ICONS[entry.icon] ? SEARCH_ENTRY_ICONS[entry.icon]! : MagnifyingGlass;
  return (
    <li data-search-hit={hitIndex}>
      <Link
        href={href}
        onClick={() => onPick(entry.url)}
        className={`flex flex-col gap-0.5 rounded-xl px-3 py-2.5 border motion-safe:transition-[background-color,border-color,transform] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${
          selected
            ? "bg-[var(--ss-accent-soft)] border-[color-mix(in_srgb,var(--ss-accent)_45%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_25%,transparent)]"
            : subtle
              ? "border-transparent hover:bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] hover:border-[var(--ss-border)] motion-safe:hover:-translate-y-px"
              : "border-transparent hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] hover:border-[color-mix(in_srgb,var(--ss-accent)_25%,transparent)] motion-safe:hover:-translate-y-px"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <span className="mt-0.5 shrink-0 text-[var(--ss-accent)] opacity-90" aria-hidden>
              <IconCmp className="w-4 h-4" weight="duotone" />
            </span>
            <span className="text-sm font-semibold text-[var(--ss-text)] leading-snug min-w-0">
              {highlightText(entry.title, query)}
            </span>
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-wide text-[var(--ss-text-secondary)]">
            {entry.toolType}
          </span>
        </div>
        <span className="text-[11px] text-[var(--ss-text-secondary)]">{entry.category}</span>
        {entry.toolkitAreas.length > 0 ? (
          <span className="text-[10px] text-[color-mix(in_srgb,var(--ss-text-secondary)_85%,transparent)] line-clamp-1">
            {entry.toolkitAreas.slice(0, 3).join(" · ")}
          </span>
        ) : null}
        {entry.description ? (
          <span className="text-xs text-[var(--ss-text-secondary)] line-clamp-2">{highlightText(entry.description, query)}</span>
        ) : null}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {entry.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="text-[10px] rounded-md bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] text-[var(--ss-text-secondary)] px-1.5 py-0.5 ring-1 ring-[var(--ss-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </li>
  );
}

export function useSearchHotkey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      const isK = e.key === "k" || e.key === "K";
      if (!isK) return;
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      e.preventDefault();
      handler();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handler, enabled]);
}

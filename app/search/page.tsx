"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import SectionReveal from "@/app/components/ui/SectionReveal";
import {
  SEARCH_CATEGORIES,
  SEARCH_TOOL_TYPES,
  SEARCH_TOOLKIT_AREA_FILTERS,
  escapeRegExp,
  rememberSearchVisit,
  searchSite,
  type SearchCategoryFilter,
  type SearchToolkitAreaFilter,
  type SearchToolType,
  type SiteSearchEntry,
} from "@/lib/search/site-search";

const TYPE_LABELS: Record<SearchToolType | "all", string> = {
  all: "All types",
  hub: "Hub / landing",
  tool: "Tool",
  page: "Page",
  dashboard: "Dashboard",
  marketing: "Marketing",
  auth: "Auth",
};

function highlight(text: string, query: string): ReactNode {
  try {
    const q = query.trim();
    if (!q) return text;
    const parts = q.split(/\s+/).filter(Boolean);
    if (!parts.length) return text;
    const pattern = new RegExp(`(${parts.map(escapeRegExp).join("|")})`, "gi");
    const segments = text.split(pattern);
    return segments.map((seg, i) => {
      const isHit = parts.some((p) => seg.toLowerCase() === p.toLowerCase());
      if (isHit && seg) {
        return (
          <mark key={i} className="rounded bg-cyan-500/25 text-cyan-100 px-0.5">
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

export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [query, setQuery] = useState(() => sp.get("q") ?? "");
  const [category, setCategory] = useState<SearchCategoryFilter>("all");
  const [toolType, setToolType] = useState<SearchToolType | "all">("all");
  const [toolkitArea, setToolkitArea] = useState<SearchToolkitAreaFilter>("all");

  useEffect(() => {
    const q = sp.get("q");
    if (q != null) setQuery(q);
  }, [sp]);

  const results = useMemo(
    () => searchSite({ query, category, toolType, toolkitArea, limit: 80 }),
    [query, category, toolType, toolkitArea],
  );

  const go = useCallback(
    (e: SiteSearchEntry) => {
      rememberSearchVisit(e.url);
      router.push(e.url);
    },
    [router],
  );

  return (
    <main className="flex-1 bg-[#050505]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionReveal>
          <header className="mb-8 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_40%),rgba(255,255,255,0.03)] p-8 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/90">Advanced search</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Find any tool or page</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              Indexes titles, descriptions, curated keywords, and categories. Filters work together with your query.
            </p>
          </header>

          <div className="space-y-4 rounded-2xl border border-[#1e2d4a] bg-[#0b0f1a]/80 p-5">
            <label className="block text-xs font-medium text-slate-400 mb-1" htmlFor="site-search-input">
              Query
            </label>
            <input
              id="site-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “ssl”, “m365”, “utm”, “dashboard”…"
              className="w-full rounded-xl border border-[#1e2d4a] bg-[#0d1321] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/35"
            />

            <div className="flex flex-wrap gap-3 pt-1">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SearchCategoryFilter)}
                  className="text-xs rounded-lg border border-[#1e2d4a] bg-[#0d1321] text-slate-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  {SEARCH_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All categories" : c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Portfolio area</span>
                <select
                  value={toolkitArea}
                  onChange={(e) => setToolkitArea(e.target.value as SearchToolkitAreaFilter)}
                  className="text-xs rounded-lg border border-[#1e2d4a] bg-[#0d1321] text-slate-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  {SEARCH_TOOLKIT_AREA_FILTERS.map((a) => (
                    <option key={a} value={a}>
                      {a === "all" ? "All portfolio areas" : a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Type</span>
                <select
                  value={toolType}
                  onChange={(e) => setToolType(e.target.value as SearchToolType | "all")}
                  className="text-xs rounded-lg border border-[#1e2d4a] bg-[#0d1321] text-slate-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  {(["all", ...SEARCH_TOOL_TYPES] as const).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <section className="mt-8" aria-label="Search results">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Browse matches"}
              </p>
              <Link href="/tools/browse" className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
                Toolkit index →
              </Link>
            </div>

            {query.trim() && results.length === 0 ? (
              <div className="rounded-2xl border border-[#1e2d4a] bg-[#0f1629] px-6 py-12 text-center">
                <p className="text-sm text-slate-200 mb-2">No results found.</p>
                <p className="text-xs text-slate-500 mb-4">Try a shorter keyword or reset filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                    setToolType("all");
                    setToolkitArea("all");
                  }}
                  className="text-xs font-medium rounded-lg border border-[#1e2d4a] text-slate-300 hover:bg-white/5 px-4 py-2"
                >
                  Reset
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {results.map((e) => (
                  <li key={e.url}>
                    <button
                      type="button"
                      onClick={() => go(e)}
                      className="w-full text-left rounded-xl border border-transparent bg-[#0f1629] px-4 py-3 motion-safe:transition-[transform,background-color,border-color] motion-safe:duration-200 hover:border-cyan-500/20 hover:bg-[#121a2e] motion-safe:hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-100">{highlight(e.title, query)}</span>
                        <span className="text-[10px] uppercase tracking-wide text-slate-500 shrink-0">{e.toolType}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{e.category}</span>
                      {e.description ? (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{highlight(e.description, query)}</p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </SectionReveal>
      </div>
    </main>
  );
}

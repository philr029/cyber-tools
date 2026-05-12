"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import UniversalToolCard from "@/app/components/UniversalToolCard";
import {
  SITE_SEARCH_TOOLKIT_FILTERS,
  uniqueSiteTools,
  type MegaGroupLabel,
  type SiteTool,
  type ToolkitSearchFilter,
} from "@/lib/tools/site-catalog";
import {
  Briefcase,
  Browser,
  Code,
  GearSix,
  Megaphone,
  Package,
  ShieldCheck,
  Sparkle,
  TreeStructure,
  type IconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

const TAG_ICONS: Record<string, ComponentType<IconProps>> = {
  "Web QA": Browser,
  DNS: TreeStructure,
  Security: ShieldCheck,
  Marketing: Megaphone,
  Automation: GearSix,
  Developer: Code,
  AI: Sparkle,
  Productivity: Briefcase,
};

function iconForTool(t: SiteTool) {
  return TAG_ICONS[t.categoryTag] ?? Package;
}

function toolMatchesFilter(t: SiteTool, filter: ToolkitSearchFilter): boolean {
  if (filter === "all") return true;
  return t.toolkitFilters.includes(filter);
}

export default function ToolkitBrowseClient() {
  const all = useMemo(() => uniqueSiteTools().sort((a, b) => a.label.localeCompare(b.label)), []);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ToolkitSearchFilter>("all");
  const [mega, setMega] = useState<MegaGroupLabel | "all">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((t) => {
      if (!toolMatchesFilter(t, filter)) return false;
      if (mega !== "all" && t.megaGroup !== mega) return false;
      if (!needle) return true;
      const hay = `${t.label} ${t.description} ${t.keywords.join(" ")} ${t.megaGroup}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [all, q, filter, mega]);

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_45%),rgba(255,255,255,0.03)] p-6 sm:p-8 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/90">Toolkit browser</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Dashboard-style catalogue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
          Every module pulls from the same <code className="text-cyan-200/90">site-catalog</code> source as navigation and search. Filter by portfolio area or mega category, then jump in.
        </p>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 relative">
            <label htmlFor="toolkit-q" className="sr-only">
              Search tools
            </label>
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400/80"
              aria-hidden
              weight="bold"
            />
            <input
              id="toolkit-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name, tag, or keyword…"
              className="w-full rounded-xl border border-[#1e2d4a] bg-[#0d1321] py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/35"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            ) : null}
          </div>
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/15 transition-colors whitespace-nowrap"
          >
            Advanced site search
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex flex-col gap-1 min-w-[160px]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Portfolio area</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ToolkitSearchFilter)}
              className="text-xs rounded-lg border border-[#1e2d4a] bg-[#0d1321] text-slate-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              {SITE_SEARCH_TOOLKIT_FILTERS.map((f) => (
                <option key={f} value={f}>
                  {f === "all" ? "All areas" : f}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Mega category</span>
            <select
              value={mega}
              onChange={(e) => setMega(e.target.value as MegaGroupLabel | "all")}
              className="text-xs rounded-lg border border-[#1e2d4a] bg-[#0d1321] text-slate-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              <option value="all">All mega groups</option>
              <option value="Website Testing Tools">Website testing</option>
              <option value="Domain & DNS Tools">Domain &amp; DNS</option>
              <option value="Security Tools">Security</option>
              <option value="Marketing Tools">Marketing</option>
              <option value="Automation Tools">Automation</option>
              <option value="Coding/Developer Tools">Coding / developer</option>
              <option value="AI Tools">AI</option>
              <option value="Business/Productivity Tools">Business / productivity</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
        Showing {filtered.length} of {all.length} entries
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0f1629] px-6 py-14 text-center">
          <p className="text-sm text-slate-200 mb-2">No tools match these filters.</p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setFilter("all");
              setMega("all");
            }}
            className="text-xs font-medium rounded-lg border border-[#1e2d4a] text-slate-300 hover:bg-white/5 px-4 py-2"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <UniversalToolCard
              key={t.href}
              href={t.href}
              title={t.label}
              description={t.description}
              categoryTag={t.categoryTag}
              icon={iconForTool(t)}
              status={t.status}
              tags={t.displayTags}
              ctaLabel={t.comingSoon ? "View details" : "Open tool"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

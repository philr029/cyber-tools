"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import UniversalToolCard from "@/app/components/UniversalToolCard";
import {
  DASHBOARD_SECTION_META,
  DASHBOARD_SECTIONS_ORDER,
  SITE_SEARCH_TOOLKIT_FILTERS,
  uniqueSiteTools,
  type DashboardSectionId,
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
  const [sectionFilter, setSectionFilter] = useState<DashboardSectionId | "all">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((t) => {
      if (!toolMatchesFilter(t, filter)) return false;
      if (mega !== "all" && t.megaGroup !== mega) return false;
      if (sectionFilter !== "all" && t.dashboardSection !== sectionFilter) return false;
      if (!needle) return true;
      const sectionLabel = DASHBOARD_SECTION_META[t.dashboardSection]?.label ?? "";
      const hay = `${t.label} ${t.description} ${t.keywords.join(" ")} ${t.megaGroup} ${sectionLabel}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [all, q, filter, mega, sectionFilter]);

  const groupedBySection = useMemo(() => {
    const map = new Map<DashboardSectionId, SiteTool[]>();
    for (const id of DASHBOARD_SECTIONS_ORDER) map.set(id, []);
    for (const t of filtered) {
      const bucket = map.get(t.dashboardSection) ?? [];
      bucket.push(t);
      map.set(t.dashboardSection, bucket);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-10">
      <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_45%),rgba(255,255,255,0.03)] p-6 sm:p-8 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/90">Toolkit dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">IT automation catalogue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
          One source of truth (<code className="text-cyan-200/90">lib/tools/site-catalog.ts</code>) powers navigation, search, and this
          dashboard. Filter by portfolio area, mega category, or IT practice column — every card shows status, tags, and a clear action.
        </p>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 relative min-w-0">
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
              placeholder="Filter by name, tag, dashboard column, or keyword…"
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
            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/15 transition-colors whitespace-nowrap shrink-0"
          >
            Advanced site search
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Dashboard column</span>
            <label htmlFor="toolkit-dashboard-section" className="sr-only">
              Dashboard column filter
            </label>
            <select
              id="toolkit-dashboard-section"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value as DashboardSectionId | "all")}
              className="text-xs rounded-lg border border-[#1e2d4a] bg-[#0d1321] text-slate-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 min-w-0"
            >
              <option value="all">All columns</option>
              {DASHBOARD_SECTIONS_ORDER.filter((id) => id !== "platform").map((id) => (
                <option key={id} value={id}>
                  {DASHBOARD_SECTION_META[id].label}
                </option>
              ))}
              <option value="platform">{DASHBOARD_SECTION_META.platform.label}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Portfolio area</span>
            <label htmlFor="toolkit-portfolio" className="sr-only">
              Portfolio area filter
            </label>
            <select
              id="toolkit-portfolio"
              value={filter}
              onChange={(e) => setFilter(e.target.value as ToolkitSearchFilter)}
              className="text-xs rounded-lg border border-[#1e2d4a] bg-[#0d1321] text-slate-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 min-w-0"
            >
              {SITE_SEARCH_TOOLKIT_FILTERS.map((f) => (
                <option key={f} value={f}>
                  {f === "all" ? "All areas" : f}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-0 lg:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Mega category (navigation groups)</span>
            <label htmlFor="toolkit-mega" className="sr-only">
              Mega category filter
            </label>
            <select
              id="toolkit-mega"
              value={mega}
              onChange={(e) => setMega(e.target.value as MegaGroupLabel | "all")}
              className="text-xs rounded-lg border border-[#1e2d4a] bg-[#0d1321] text-slate-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 min-w-0"
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
              setSectionFilter("all");
            }}
            className="text-xs font-medium rounded-lg border border-[#1e2d4a] text-slate-300 hover:bg-white/5 px-4 py-2"
          >
            Reset filters
          </button>
        </div>
      ) : sectionFilter !== "all" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <UniversalToolCard
              key={t.href}
              href={t.href}
              title={t.label}
              description={t.description}
              categoryTag={t.categoryTag}
              dashboardLabel={DASHBOARD_SECTION_META[t.dashboardSection].label}
              icon={iconForTool(t)}
              status={t.status}
              tags={t.displayTags}
              comingSoon={t.comingSoon}
              ctaLabel={t.comingSoon ? "Coming soon" : "Open tool"}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {DASHBOARD_SECTIONS_ORDER.map((sectionId) => {
            const tools = groupedBySection.get(sectionId) ?? [];
            if (tools.length === 0) return null;
            const meta = DASHBOARD_SECTION_META[sectionId];
            return (
              <section key={sectionId} id={`dashboard-section-${sectionId}`} className="scroll-mt-24" aria-labelledby={`heading-${sectionId}`}>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[#1e2d4a]/80 pb-4">
                  <div>
                    <h2 id={`heading-${sectionId}`} className="text-lg font-semibold text-slate-100">
                      {meta.label}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 max-w-3xl">{meta.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSectionFilter(sectionId)}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 shrink-0 self-start sm:self-auto"
                  >
                    Only this column
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {tools.map((t) => (
                    <UniversalToolCard
                      key={t.href}
                      href={t.href}
                      title={t.label}
                      description={t.description}
                      categoryTag={t.categoryTag}
                      dashboardLabel={meta.label}
                      icon={iconForTool(t)}
                      status={t.status}
                      tags={t.displayTags}
                      comingSoon={t.comingSoon}
                      ctaLabel={t.comingSoon ? "Coming soon" : "Open tool"}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

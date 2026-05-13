"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { DAY_TO_DAY_CATEGORIES, DAY_TO_DAY_TOOLS, getDayToDayToolById } from "@/lib/day-to-day-tools/catalog";
import type { DayToDayCategoryId } from "@/lib/day-to-day-tools/types";
import type { DayToDayToolDefinition, DayToDayToolLabel } from "@/lib/day-to-day-tools/types";
import { useDayToDayPrefs } from "@/lib/day-to-day-tools/use-day-to-day-prefs";
import ToolModal from "./ToolModal";
import PanelRouter from "./PanelRouter";
import ToolSearch from "./ToolSearch";
import CategoryFilter from "./CategoryFilter";
import ToolCard from "./ToolCard";

type LabelFilter = "all" | DayToDayToolLabel;

function DayToDayToolsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | DayToDayCategoryId>("all");
  const [labelFilter, setLabelFilter] = useState<LabelFilter>("all");
  const [openTool, setOpenTool] = useState<DayToDayToolDefinition | null>(null);
  const { ready, favSet, pinned, recent, toggleFavourite, togglePinned, recordOpened } = useDayToDayPrefs();

  useEffect(() => {
    const tid = searchParams.get("t");
    if (!tid) {
      setOpenTool(null);
      return;
    }
    const t = getDayToDayToolById(tid);
    setOpenTool(t ?? null);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DAY_TO_DAY_TOOLS.filter((t) => {
      if (category !== "all" && t.categoryId !== category) return false;
      if (labelFilter !== "all" && !(t.labels?.includes(labelFilter) ?? false)) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q)) ||
        (t.labels?.some((l) => l.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [query, category, labelFilter]);

  const pinnedTools = useMemo(() => {
    const map = new Map(DAY_TO_DAY_TOOLS.map((t) => [t.id, t]));
    return pinned.map((id) => map.get(id)).filter(Boolean) as DayToDayToolDefinition[];
  }, [pinned]);

  const recentSpotlightIds = useMemo(() => recent.map((r) => r.id).filter((id) => !pinned.includes(id)).slice(0, 8), [recent, pinned]);

  const spotlightIds = useMemo(() => new Set<string>([...pinned, ...recentSpotlightIds]), [pinned, recentSpotlightIds]);

  const gridTools = useMemo(() => filtered.filter((t) => !spotlightIds.has(t.id)), [filtered, spotlightIds]);

  const recentSpotlightTools = useMemo(() => {
    const map = new Map(DAY_TO_DAY_TOOLS.map((t) => [t.id, t]));
    return recentSpotlightIds.map((id) => map.get(id)).filter(Boolean) as DayToDayToolDefinition[];
  }, [recentSpotlightIds]);

  const categoryOptions = useMemo(() => [{ id: "all" as const, label: "All" }, ...DAY_TO_DAY_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))], []);

  function openModal(t: DayToDayToolDefinition) {
    setOpenTool(t);
    recordOpened(t.id);
    const p = new URLSearchParams(searchParams.toString());
    p.set("t", t.id);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  function closeModal() {
    setOpenTool(null);
    const p = new URLSearchParams(searchParams.toString());
    p.delete("t");
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function renderToolSection(title: string, tools: DayToDayToolDefinition[]) {
    if (tools.length === 0) return null;
    return (
      <section aria-label={title} className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ss-text-secondary)] mb-4">{title}</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool, idx) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              categoryLabel={DAY_TO_DAY_CATEGORIES.find((c) => c.id === tool.categoryId)?.label ?? tool.categoryId}
              animationDelayMs={Math.min(idx, 12) * 35}
              onOpen={() => openModal(tool)}
              isFavourite={ready && favSet.has(tool.id)}
              isPinned={pinned.includes(tool.id)}
              onToggleFavourite={() => toggleFavourite(tool.id)}
              onTogglePin={() => togglePinned(tool.id)}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <ToolModal open={!!openTool} title={openTool?.title ?? ""} subtitle={openTool?.description} onClose={closeModal}>
        {openTool ? <PanelRouter tool={openTool} /> : null}
      </ToolModal>

      <main className="flex-1 bg-[var(--ss-page)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-8 flex items-center gap-2 text-sm text-[var(--ss-text-secondary)] motion-safe:animate-page-enter">
            <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--ss-accent)]">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
              Home
            </Link>
            <span className="text-[color-mix(in_srgb,var(--ss-text-secondary)_45%,transparent)]">/</span>
            <span className="font-medium text-[var(--ss-text)]">Day-to-Day Tools</span>
          </div>

          <header className="mb-10 rounded-[28px] border border-[var(--ss-border)] bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--ss-accent)_12%,transparent),transparent_42%),color-mix(in_srgb,var(--ss-elevated-solid)_55%,transparent)] p-8 sm:p-9 backdrop-blur-xl shadow-[0_20px_64px_rgba(0,0,0,0.28)] motion-safe:animate-page-enter">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ss-accent)]">Workspace</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-4xl">Day-to-Day Tools</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ss-text-secondary)] sm:text-base">
              A calm, Apple-inspired hub for IT, marketing, cyber, finance, and automation workflows — planners, checklists, generators, dev utilities, and
              backend-ready API placeholders. Favourites, pins, and recents stay in your browser; export when you need to share.
            </p>
          </header>

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between motion-safe:animate-page-enter">
            <ToolSearch id="d2d-search" value={query} onChange={setQuery} />
            <p className="text-xs text-[var(--ss-text-secondary)] lg:text-right">
              Showing <strong className="text-[var(--ss-text)]">{filtered.length}</strong> of {DAY_TO_DAY_TOOLS.length} tools
            </p>
          </div>

          <div className="mb-8">
            <CategoryFilter
              category={category}
              onCategory={setCategory}
              labelFilter={labelFilter}
              onLabelFilter={setLabelFilter}
              categoryOptions={categoryOptions}
            />
          </div>

          {renderToolSection("Pin to dashboard", pinnedTools)}

          {renderToolSection("Recently used tools", recentSpotlightTools)}

          {filtered.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-accent-soft)_25%,transparent)] px-6 py-16 text-center">
              <p className="text-base font-semibold text-[var(--ss-text)]">No tools match your filters</p>
              <p className="mt-2 text-sm text-[var(--ss-text-secondary)] max-w-md mx-auto">Try clearing search, widening categories, or switching label filters.</p>
              <button
                type="button"
                className="mt-6 ss-pill ss-pill-primary px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setLabelFilter("all");
                }}
              >
                Reset filters
              </button>
            </div>
          ) : gridTools.length === 0 && filtered.length > 0 ? (
            <div className="rounded-[28px] border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-6 py-10 text-center text-sm text-[var(--ss-text-secondary)]">
              All matching tools are shown in <strong className="text-[var(--ss-text)]">Pin to dashboard</strong> or <strong className="text-[var(--ss-text)]">Recently used</strong> above. Clear filters to see the full catalog.
            </div>
          ) : (
            <section aria-label="All tools" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {gridTools.map((tool, idx) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  categoryLabel={DAY_TO_DAY_CATEGORIES.find((c) => c.id === tool.categoryId)?.label ?? tool.categoryId}
                  animationDelayMs={Math.min(idx, 12) * 35}
                  onOpen={() => openModal(tool)}
                  isFavourite={ready && favSet.has(tool.id)}
                  isPinned={pinned.includes(tool.id)}
                  onToggleFavourite={() => toggleFavourite(tool.id)}
                  onTogglePin={() => togglePinned(tool.id)}
                />
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function LoadingShell() {
  return (
    <main className="flex-1 bg-[var(--ss-page)]">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-[var(--ss-text-secondary)] text-sm">Loading tools…</div>
    </main>
  );
}

export default function DayToDayToolsClient() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <DayToDayToolsInner />
    </Suspense>
  );
}

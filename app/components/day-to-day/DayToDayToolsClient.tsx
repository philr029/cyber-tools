"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { DAY_TO_DAY_CATEGORIES, DAY_TO_DAY_TOOLS, getDayToDayToolById } from "@/lib/day-to-day-tools/catalog";
import type { DayToDayCategoryId } from "@/lib/day-to-day-tools/types";
import type { DayToDayToolDefinition } from "@/lib/day-to-day-tools/types";
import ToolModal from "./ToolModal";
import PanelRouter from "./PanelRouter";

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ss-pill px-3 py-1.5 text-xs font-semibold motion-safe:transition-[transform,background-color,color] motion-safe:duration-200 ${
        active
          ? "text-white bg-[var(--ss-accent)] shadow-[0_8px_24px_color-mix(in_srgb,var(--ss-accent)_35%,transparent)]"
          : "text-[var(--ss-text-secondary)] border border-[var(--ss-border)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
      }`}
    >
      {children}
    </button>
  );
}

function DayToDayToolsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | DayToDayCategoryId>("all");
  const [openTool, setOpenTool] = useState<DayToDayToolDefinition | null>(null);

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
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  function openModal(t: DayToDayToolDefinition) {
    setOpenTool(t);
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
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ss-text-secondary)] sm:text-base">
              A calm, data-driven dashboard of practical utilities — notes, planners, timers, templates, trackers, and dev helpers. Everything opens in a
              focused panel; data stays in your browser unless you export it.
            </p>
          </header>

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between motion-safe:animate-page-enter">
            <div className="flex-1 max-w-xl">
              <label htmlFor="d2d-search" className="sr-only">
                Search tools
              </label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ss-accent)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.517 3.516a1 1 0 01-1.414 1.414l-3.516-3.517A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="d2d-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, topic, or keyword…"
                  className="w-full rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] pl-10 pr-4 py-3 text-sm text-[var(--ss-text)] placeholder:text-[color-mix(in_srgb,var(--ss-text-secondary)_55%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--ss-ring)]"
                />
              </div>
            </div>
            <p className="text-xs text-[var(--ss-text-secondary)] lg:text-right">
              Showing <strong className="text-[var(--ss-text)]">{filtered.length}</strong> of {DAY_TO_DAY_TOOLS.length} tools
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2 motion-safe:animate-page-enter">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
              All categories
            </FilterChip>
            {DAY_TO_DAY_CATEGORIES.map((c) => (
              <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label.replace(" Tools", "")}
              </FilterChip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-accent-soft)_25%,transparent)] px-6 py-16 text-center">
              <p className="text-base font-semibold text-[var(--ss-text)]">No tools match your filters</p>
              <p className="mt-2 text-sm text-[var(--ss-text-secondary)] max-w-md mx-auto">Try clearing search or picking a different category.</p>
              <button type="button" className="mt-6 ss-pill ss-pill-primary px-4 py-2 text-sm font-semibold text-white" onClick={() => { setQuery(""); setCategory("all"); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <section aria-label="Tool cards" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool, idx) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => openModal(tool)}
                  style={{ animationDelay: `${Math.min(idx, 12) * 35}ms` }}
                  className="group text-left rounded-[1.375rem] border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_82%,transparent)] p-5 sm:p-6 motion-safe:transition-[transform,border-color,box-shadow,opacity] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ss-accent)_32%,transparent)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.28)] motion-safe:animate-page-enter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-page)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-accent)]">
                        {DAY_TO_DAY_CATEGORIES.find((c) => c.id === tool.categoryId)?.label ?? tool.categoryId}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[var(--ss-text)] group-hover:text-[var(--ss-accent)] motion-safe:transition-colors">{tool.title}</h2>
                    </div>
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--ss-border)] text-[var(--ss-text-secondary)] group-hover:border-[color-mix(in_srgb,var(--ss-accent)_45%,transparent)] group-hover:text-[var(--ss-accent)] motion-safe:transition-colors">
                      <svg className="w-4 h-4 motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--ss-text-secondary)] leading-relaxed line-clamp-3">{tool.description}</p>
                </button>
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

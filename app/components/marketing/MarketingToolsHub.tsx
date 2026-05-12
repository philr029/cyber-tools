"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  MARKETING_CATEGORIES,
  MARKETING_TOOLS,
  featuredMarketingTools,
  marketingHubStats,
} from "@/lib/marketing-tools/catalog";
import type { MarketingCategoryId } from "@/lib/marketing-tools/types";
import { MarketingCategoryIcon } from "./MarketingCategoryIcon";

type FilterKey = "all" | MarketingCategoryId;

const CATEGORY_LABEL_BY_ID = new Map<MarketingCategoryId, string>(
  MARKETING_CATEGORIES.map((c) => [c.id, c.label]),
);

function categoryLabel(id: MarketingCategoryId) {
  return CATEGORY_LABEL_BY_ID.get(id) ?? id;
}

function statusStyles(status: string) {
  if (status === "live") return "bg-emerald-500/15 text-emerald-200 ring-emerald-500/25";
  if (status === "beta") return "bg-amber-500/15 text-amber-100 ring-amber-500/30";
  return "bg-white/5 text-white/55 ring-white/10";
}

function statusLabel(status: string) {
  if (status === "live") return "Live";
  if (status === "beta") return "Beta";
  return "Coming soon";
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 shadow-inner shadow-black/20 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/25";

const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(6,182,212,0.25)] transition hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60";

const btnGhost =
  "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";

export default function MarketingToolsHub() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FilterKey>("all");
  const stats = marketingHubStats();
  const featured = featuredMarketingTools();

  const needle = q.trim().toLowerCase();
  const filtered = MARKETING_TOOLS.filter((tool) => {
    if (cat !== "all" && tool.categoryId !== cat) return false;
    if (!needle) return true;
    const c = categoryLabel(tool.categoryId).toLowerCase();
    return (
      tool.name.toLowerCase().includes(needle) ||
      tool.description.toLowerCase().includes(needle) ||
      c.includes(needle)
    );
  });

  return (
    <div className="min-h-[60vh] bg-[#030508]">
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.14),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200/75">
            SecureScope
          </p>
          <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Marketing Tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">
            A growing collection of SEO, content, social media, email, analytics and campaign tools designed to help
            marketers work faster.
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-5">
            <StatCard label="Total tools" value={stats.total} />
            <StatCard label="Live" value={stats.live} accent="text-emerald-300" />
            <StatCard label="Beta" value={stats.beta} accent="text-amber-200" />
            <StatCard label="Coming soon" value={stats.comingSoon} accent="text-white/50" />
            <StatCard label="Categories" value={stats.categories} className="col-span-2 sm:col-span-1" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section aria-labelledby="featured-heading" className="mt-2">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="featured-heading" className="text-lg font-semibold text-white sm:text-xl">
                Featured tools
              </h2>
              <p className="mt-1 text-sm text-white/50">Hand-picked starting points for everyday marketing work.</p>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((tool) => (
              <li key={tool.id}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-transparent p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)] transition duration-200 hover:border-cyan-400/25 hover:shadow-[0_20px_60px_rgba(6,182,212,0.12)]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/30 ring-1 ring-white/10">
                      <MarketingCategoryIcon id={tool.categoryId} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                        {categoryLabel(tool.categoryId)}
                      </p>
                      <h3 className="mt-0.5 text-base font-semibold tracking-tight text-white">{tool.name}</h3>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{tool.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${statusStyles(tool.status)}`}>
                      {statusLabel(tool.status)}
                    </span>
                    <Link href={tool.href} className={`${btnPrimary} ml-auto text-xs sm:text-sm`}>
                      Open tool
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-md">
            <label htmlFor="marketing-tool-search" className="block text-sm font-medium text-white/70">
              Search tools
            </label>
            <input
              id="marketing-tool-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “UTM”, “email”, or “SEO”…"
              autoComplete="off"
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <p className="text-sm text-white/45 lg:max-w-sm lg:text-right">
            Filter by category or search across names and descriptions. Every card opens a working page or a clear
            coming-soon experience.
          </p>
        </div>

        <section aria-labelledby="browse-heading" className="mt-10">
          <h2 id="browse-heading" className="text-lg font-semibold text-white sm:text-xl">
            Browse all tools
          </h2>

          <div
            role="tablist"
            aria-label="Tool categories"
            className="mt-4 flex flex-wrap gap-2"
          >
            <CategoryPill active={cat === "all"} onClick={() => setCat("all")} icon={null}>
              All
            </CategoryPill>
            {MARKETING_CATEGORIES.map((c) => (
              <CategoryPill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} icon={<MarketingCategoryIcon id={c.id} />}>
                {c.shortLabel}
              </CategoryPill>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div
              role="status"
              className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center"
            >
              <p className="text-base font-medium text-white/80">No tools match your search</p>
              <p className="mt-2 text-sm text-white/45">Try a shorter keyword or switch back to “All” categories.</p>
              <button type="button" className={`${btnGhost} mt-6`} onClick={() => { setQ(""); setCat("all"); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((tool) => (
                <li key={tool.id}>
                  <article className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-[#0a0e18]/90 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-cyan-500/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/40 ring-1 ring-white/10">
                          <span className="scale-90">
                            <MarketingCategoryIcon id={tool.categoryId} />
                          </span>
                        </span>
                        <span className="truncate text-[11px] font-medium uppercase tracking-wider text-cyan-200/70">
                          {categoryLabel(tool.categoryId)}
                        </span>
                      </div>
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${statusStyles(tool.status)}`}>
                        {statusLabel(tool.status)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">{tool.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{tool.description}</p>
                    <div className="mt-5">
                      <Link
                        href={tool.href}
                        className={`${btnPrimary} w-full text-center`}
                      >
                        Open tool
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "text-white",
  className = "",
}: {
  label: string;
  value: number;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-center backdrop-blur-sm ${className}`}
    >
      <p className={`text-2xl font-semibold tabular-nums ${accent}`}>{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}

function CategoryPill({
  children,
  active,
  onClick,
  icon,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
        active
          ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.12)]"
          : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      {icon ? <span className="flex h-5 w-5 items-center justify-center opacity-90 [&>svg]:h-4 [&>svg]:w-4">{icon}</span> : null}
      {children}
    </button>
  );
}

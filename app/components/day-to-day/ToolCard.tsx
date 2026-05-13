"use client";

import { PushPin, Star } from "@phosphor-icons/react";
import type { DayToDayToolDefinition, DayToDayToolLabel } from "@/lib/day-to-day-tools/types";

function LabelBadge({ label }: { label: DayToDayToolLabel }) {
  const map: Record<DayToDayToolLabel, string> = {
    "most-used": "Most used",
    "recently-added": "New",
    "automation-ready": "Automation",
  };
  const cls =
    label === "most-used"
      ? "bg-violet-500/20 text-violet-200 border-violet-500/35"
      : label === "recently-added"
        ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
        : "bg-sky-500/15 text-sky-100 border-sky-500/35";
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>{map[label]}</span>;
}

export default function ToolCard({
  tool,
  categoryLabel,
  animationDelayMs,
  onOpen,
  isFavourite,
  isPinned,
  onToggleFavourite,
  onTogglePin,
}: {
  tool: DayToDayToolDefinition;
  categoryLabel: string;
  animationDelayMs: number;
  onOpen: () => void;
  isFavourite: boolean;
  isPinned: boolean;
  onToggleFavourite: () => void;
  onTogglePin: () => void;
}) {
  return (
    <div
      style={{ animationDelay: `${animationDelayMs}ms` }}
      className="group flex rounded-[1.375rem] border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_82%,transparent)] motion-safe:animate-page-enter motion-safe:transition-[transform,border-color,box-shadow,opacity] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ss-accent)_32%,transparent)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.28)] overflow-hidden"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 min-w-0 text-left p-5 sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ss-ring)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-accent)]">{categoryLabel}</p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--ss-text)] group-hover:text-[var(--ss-accent)] motion-safe:transition-colors">{tool.title}</h2>
            {tool.labels?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tool.labels.map((l) => (
                  <LabelBadge key={l} label={l} />
                ))}
              </div>
            ) : null}
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
      <div className="flex flex-col gap-2 p-3 sm:p-4 border-l border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)]">
        <button
          type="button"
          aria-label={isFavourite ? "Remove favourite" : "Add favourite"}
          onClick={onToggleFavourite}
          className={`rounded-full p-2 border border-[var(--ss-border)] motion-safe:transition-colors ${
            isFavourite ? "text-amber-300 bg-amber-500/15 border-amber-500/40" : "text-[var(--ss-text-secondary)] hover:text-amber-200"
          }`}
        >
          <Star weight={isFavourite ? "fill" : "regular"} className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label={isPinned ? "Unpin from dashboard" : "Pin to dashboard"}
          onClick={onTogglePin}
          className={`rounded-full p-2 border border-[var(--ss-border)] motion-safe:transition-colors ${
            isPinned ? "text-sky-200 bg-sky-500/15 border-sky-500/40" : "text-[var(--ss-text-secondary)] hover:text-sky-200"
          }`}
        >
          <PushPin weight={isPinned ? "fill" : "regular"} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import type { DayToDayCategoryId } from "@/lib/day-to-day-tools/types";
import type { DayToDayToolLabel } from "@/lib/day-to-day-tools/types";

export function FilterChip({
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
      className={`ss-pill px-3 py-1.5 text-xs font-semibold motion-safe:transition-[transform,background-color,color,box-shadow] motion-safe:duration-200 ${
        active
          ? "text-white bg-[var(--ss-accent)] shadow-[0_8px_24px_color-mix(in_srgb,var(--ss-accent)_35%,transparent)]"
          : "text-[var(--ss-text-secondary)] border border-[var(--ss-border)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] motion-safe:hover:-translate-y-0.5"
      }`}
    >
      {children}
    </button>
  );
}

type LabelFilter = "all" | DayToDayToolLabel;

export default function CategoryFilter({
  category,
  onCategory,
  labelFilter,
  onLabelFilter,
  categoryOptions,
}: {
  category: "all" | DayToDayCategoryId;
  onCategory: (c: "all" | DayToDayCategoryId) => void;
  labelFilter: LabelFilter;
  onLabelFilter: (l: LabelFilter) => void;
  categoryOptions: { id: "all" | DayToDayCategoryId; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 motion-safe:animate-page-enter">
        <FilterChip active={category === "all"} onClick={() => onCategory("all")}>
          All categories
        </FilterChip>
        {categoryOptions
          .filter((c) => c.id !== "all")
          .map((c) => (
            <FilterChip key={c.id} active={category === c.id} onClick={() => onCategory(c.id)}>
              {c.label.replace(" Tools", "").replace(" Toolkit", "")}
            </FilterChip>
          ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)] w-full sm:w-auto">Labels</span>
        <FilterChip active={labelFilter === "all"} onClick={() => onLabelFilter("all")}>
          Any label
        </FilterChip>
        <FilterChip active={labelFilter === "most-used"} onClick={() => onLabelFilter("most-used")}>
          Most used
        </FilterChip>
        <FilterChip active={labelFilter === "recently-added"} onClick={() => onLabelFilter("recently-added")}>
          Recently added
        </FilterChip>
        <FilterChip active={labelFilter === "automation-ready"} onClick={() => onLabelFilter("automation-ready")}>
          Automation ready
        </FilterChip>
      </div>
    </div>
  );
}

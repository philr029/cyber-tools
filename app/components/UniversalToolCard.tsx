"use client";

import Link from "next/link";
import { ArrowRight, type IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { ToolStatus } from "@/lib/tools/site-catalog";

export interface UniversalToolCardProps {
  href: string;
  title: string;
  description: string;
  categoryTag: string;
  /** Portfolio dashboard column (shown under the mega-group chip). */
  dashboardLabel?: string;
  icon?: ComponentType<IconProps>;
  /** Shown as a small chip (e.g. vendor or “Live”). */
  badge?: string;
  ctaLabel?: string;
  status?: ToolStatus;
  tags?: string[];
  /** Non-interactive card — no navigation (catalogue placeholders). */
  comingSoon?: boolean;
}

const STATUS_STYLES: Record<ToolStatus, string> = {
  live: "border-emerald-500/35 bg-emerald-500/10 text-emerald-100",
  demo: "border-sky-500/35 bg-sky-500/10 text-sky-100",
  planned: "border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_8%,transparent)] text-[var(--ss-text-secondary)]",
  beta: "border-violet-500/35 bg-violet-500/10 text-violet-100",
};

function StatusBadge({ status }: { status: ToolStatus }) {
  const label =
    status === "live"
      ? "Live"
      : status === "beta"
        ? "Beta"
        : status === "demo"
          ? "Preview"
          : status === "planned"
            ? "Coming soon"
            : "Planned";
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ring-1 ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}

export default function UniversalToolCard({
  href,
  title,
  description,
  categoryTag,
  dashboardLabel,
  icon: Icon,
  badge,
  ctaLabel = "Open tool",
  status = "live",
  tags = [],
  comingSoon = false,
}: UniversalToolCardProps) {
  const showTags = tags.filter(Boolean).slice(0, 4);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--ss-accent-soft)] text-[var(--ss-accent)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)]">
            {Icon ? <Icon className="h-5 w-5" weight="duotone" aria-hidden /> : null}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--ss-text)] leading-snug group-hover:text-[var(--ss-accent)] motion-safe:transition-colors">
              {title}
            </p>
            <p className="text-[11px] text-[var(--ss-text-secondary)] mt-0.5 line-clamp-2">{description}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)] bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] px-2 py-0.5 rounded-full ring-1 ring-[var(--ss-border)]">
            {categoryTag}
          </span>
          {dashboardLabel ? (
            <span className="text-[10px] font-medium text-[var(--ss-text-secondary)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] px-2 py-0.5 rounded-full ring-1 ring-[var(--ss-border)] truncate max-w-[11rem]">
              {dashboardLabel}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          {badge ? (
            <span className="text-[10px] font-medium text-[var(--ss-text-secondary)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] px-2 py-0.5 rounded-full">{badge}</span>
          ) : null}
        </div>
      </div>
      {showTags.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {showTags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] rounded-md bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] text-[var(--ss-text-secondary)] px-1.5 py-0.5 ring-1 ring-[var(--ss-border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ss-accent)] group-hover:text-[color-mix(in_srgb,var(--ss-accent)_85%,#fff)]">
        {comingSoon ? "Coming soon" : ctaLabel}
        {!comingSoon ? (
          <ArrowRight className="h-3.5 w-3.5 motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden weight="bold" />
        ) : null}
      </span>
    </>
  );

  if (comingSoon) {
    return (
      <div
        className="group flex h-full flex-col gap-3 rounded-[1.25rem] border border-dashed border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_85%,transparent)] p-5 opacity-90 cursor-not-allowed"
        aria-disabled="true"
        role="group"
        aria-label={`${title} — coming soon`}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group ss-card card-lift flex h-full flex-col gap-3 p-5 motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-200 hover:border-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)] motion-safe:hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(0,0,0,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-page)]"
    >
      {inner}
    </Link>
  );
}

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
  icon?: ComponentType<IconProps>;
  /** Shown as a small chip (e.g. vendor or “Live”). */
  badge?: string;
  ctaLabel?: string;
  status?: ToolStatus;
  tags?: string[];
}

const STATUS_STYLES: Record<ToolStatus, string> = {
  live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  demo: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  planned: "border-slate-500/40 bg-slate-800/60 text-slate-300",
  beta: "border-violet-500/35 bg-violet-500/10 text-violet-100",
};

function StatusBadge({ status }: { status: ToolStatus }) {
  const label = status === "live" ? "Live" : status === "demo" ? "Demo" : status === "beta" ? "Beta" : "Planned";
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-wider rounded-md px-1.5 py-0.5 ring-1 ${STATUS_STYLES[status]}`}
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
  icon: Icon,
  badge,
  ctaLabel = "Open tool",
  status = "live",
  tags = [],
}: UniversalToolCardProps) {
  const showTags = tags.filter(Boolean).slice(0, 4);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
            {Icon ? <Icon className="h-5 w-5" weight="duotone" aria-hidden /> : null}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-cyan-300 motion-safe:transition-colors">
              {title}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{description}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full ring-1 ring-[#1e2d4a]">
          {categoryTag}
        </span>
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          {badge ? (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded-full">{badge}</span>
          ) : null}
        </div>
      </div>
      {showTags.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {showTags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] rounded-md bg-white/[0.04] text-slate-500 px-1.5 py-0.5 ring-1 ring-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5 motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden weight="bold" />
      </span>
    </>
  );

  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-[#1e2d4a] bg-[#0f1629] p-4 motion-safe:transition-[transform,box-shadow,border-color,background-color] motion-safe:duration-200 hover:border-cyan-500/35 hover:bg-[#101a32] motion-safe:hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
    >
      {inner}
    </Link>
  );
}

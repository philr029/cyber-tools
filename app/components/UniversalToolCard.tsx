"use client";

import Link from "next/link";
import { ArrowRight, type IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";

export interface UniversalToolCardProps {
  href: string;
  title: string;
  description: string;
  categoryTag: string;
  icon?: ComponentType<IconProps>;
  /** Shown as a small chip (e.g. vendor or “Live”). */
  badge?: string;
  ctaLabel?: string;
}

export default function UniversalToolCard({
  href,
  title,
  description,
  categoryTag,
  icon: Icon,
  badge,
  ctaLabel = "Open tool",
}: UniversalToolCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-[#1e2d4a] bg-[#0f1629] p-4 motion-safe:transition-[transform,box-shadow,border-color,background-color] motion-safe:duration-200 hover:border-cyan-500/35 hover:bg-[#101a32] motion-safe:hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
    >
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
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full ring-1 ring-[#1e2d4a]">
          {categoryTag}
        </span>
        {badge ? (
          <span className="text-[10px] font-medium text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded-full">{badge}</span>
        ) : null}
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5 motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden weight="bold" />
      </span>
    </Link>
  );
}

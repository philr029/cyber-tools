"use client";

import Link from "next/link";
import { X } from "@phosphor-icons/react";
import type { BannerConfig, BannerStatus } from "@/lib/messaging/types";
import { withBasePath } from "@/lib/base-path";

const statusStyles: Record<
  BannerStatus,
  { bar: string; iconWrap: string; title: string }
> = {
  info: {
    bar: "border-cyan-500/25 bg-[color-mix(in_srgb,var(--ss-accent)_12%,var(--ss-elevated-solid))]",
    iconWrap: "bg-[var(--ss-accent-soft)] text-[var(--ss-accent)]",
    title: "text-[var(--ss-text)]",
  },
  success: {
    bar: "border-emerald-500/25 bg-[color-mix(in_srgb,#10b981_10%,var(--ss-elevated-solid))]",
    iconWrap: "bg-emerald-500/15 text-emerald-400",
    title: "text-emerald-100",
  },
  warning: {
    bar: "border-amber-500/30 bg-[color-mix(in_srgb,#f59e0b_10%,var(--ss-elevated-solid))]",
    iconWrap: "bg-amber-500/15 text-amber-300",
    title: "text-amber-50",
  },
  error: {
    bar: "border-red-500/30 bg-[color-mix(in_srgb,#ef4444_10%,var(--ss-elevated-solid))]",
    iconWrap: "bg-red-500/15 text-red-300",
    title: "text-red-50",
  },
  security: {
    bar: "border-sky-500/25 bg-[color-mix(in_srgb,#38bdf8_8%,var(--ss-elevated-solid))]",
    iconWrap: "bg-sky-500/15 text-sky-300",
    title: "text-sky-50",
  },
  beta: {
    bar: "border-violet-500/25 bg-[color-mix(in_srgb,#a78bfa_10%,var(--ss-elevated-solid))]",
    iconWrap: "bg-violet-500/15 text-violet-200",
    title: "text-violet-50",
  },
  cookie: {
    bar: "border-zinc-400/20 bg-[color-mix(in_srgb,var(--ss-text)_6%,var(--ss-elevated-solid))]",
    iconWrap: "bg-[color-mix(in_srgb,var(--ss-text)_10%,transparent)] text-[var(--ss-text-secondary)]",
    title: "text-[var(--ss-text)]",
  },
  auth: {
    bar: "border-[var(--ss-border-strong)] bg-[var(--ss-elevated-solid-2)]",
    iconWrap: "bg-[var(--ss-accent-soft)] text-[var(--ss-accent)]",
    title: "text-[var(--ss-text)]",
  },
};

export function PlatformBanner({
  banner,
  onDismiss,
}: {
  banner: BannerConfig;
  onDismiss?: () => void;
}) {
  const s = statusStyles[banner.type] ?? statusStyles.info;
  const href = banner.ctaLink ? withBasePath(banner.ctaLink) : null;

  return (
    <div
      role="region"
      aria-label={banner.title}
      className={`border-b px-3 py-2.5 sm:px-5 ${s.bar}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {banner.icon ? (
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${s.iconWrap}`}
              aria-hidden
            >
              {banner.icon}
            </span>
          ) : null}
          <div className="min-w-0 pt-0.5">
            <p className={`text-sm font-semibold tracking-tight ${s.title}`}>{banner.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--ss-text-secondary)] sm:text-sm">
              {banner.message}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
          {href && banner.ctaText ? (
            <Link
              href={href}
              className="inline-flex items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--ss-text)_8%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--ss-text)] ring-1 ring-[var(--ss-border)] transition-colors hover:bg-[color-mix(in_srgb,var(--ss-text)_12%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] sm:text-sm"
            >
              {banner.ctaText}
            </Link>
          ) : null}
          {banner.dismissible && onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-[var(--ss-text-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--ss-text)_8%,transparent)] hover:text-[var(--ss-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4" weight="bold" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

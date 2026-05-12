"use client";

import type { ReactNode } from "react";
import {
  BellRinging,
  Clock,
  ClockCounterClockwise,
  Pulse,
  WarningCircle,
} from "@phosphor-icons/react";
import type { HubStatus } from "@/lib/monitoring-hub/types";

export interface MonitoringTestCardProps {
  title: string;
  description?: string;
  status: HubStatus;
  lastChecked: string | null;
  responseTime: number | null;
  /** Latest human-readable summary line for the module */
  insight: string;
  errorSummary: string | null;
  onRunTest: () => void | Promise<void>;
  onViewHistory: () => void;
  runLoading?: boolean;
  icon?: ReactNode;
}

const STATUS_STYLES: Record<
  HubStatus,
  { label: string; ring: string; bg: string; text: string; dot: string }
> = {
  healthy: {
    label: "Healthy",
    ring: "ring-emerald-500/35",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  warning: {
    label: "Warning",
    ring: "ring-amber-400/40",
    bg: "bg-amber-500/10",
    text: "text-amber-200",
    dot: "bg-amber-400",
  },
  failed: {
    label: "Failed",
    ring: "ring-rose-500/40",
    bg: "bg-rose-500/10",
    text: "text-rose-200",
    dot: "bg-rose-400",
  },
  not_tested: {
    label: "Not tested",
    ring: "ring-slate-500/30",
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    dot: "bg-slate-400",
  },
};

function formatTime(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function MonitoringTestCard({
  title,
  description,
  status,
  lastChecked,
  responseTime,
  insight,
  errorSummary,
  onRunTest,
  onViewHistory,
  runLoading,
  icon,
}: MonitoringTestCardProps) {
  const st = STATUS_STYLES[status];

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ${st.ring} transition-transform duration-300 hover:-translate-y-0.5`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.12),transparent_55%)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 to-blue-600/25 text-cyan-200 ring-1 ring-white/10">
            {icon ?? <Pulse className="h-5 w-5" weight="duotone" aria-hidden />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
            {description ? (
              <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">{description}</p>
            ) : null}
          </div>
        </div>
        <span
          className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${st.bg} ${st.text} ring-1 ring-white/10`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </div>

      <dl className="relative mt-4 grid grid-cols-2 gap-3 text-[11px] text-[var(--muted)]">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 opacity-70" aria-hidden />
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]/80">Last checked</dt>
            <dd className="font-medium text-[var(--foreground)]/90">{formatTime(lastChecked)}</dd>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ClockCounterClockwise className="h-3.5 w-3.5 opacity-70" aria-hidden />
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]/80">Response</dt>
            <dd className="font-medium text-[var(--foreground)]/90">
              {responseTime === null ? "—" : `${responseTime} ms`}
            </dd>
          </div>
        </div>
      </dl>

      {errorSummary ? (
        <div className="relative mt-3 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-100/90">
          <WarningCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" weight="duotone" aria-hidden />
          <span className="leading-5">{errorSummary}</span>
        </div>
      ) : null}
      <p className={`relative text-[11px] leading-5 text-[var(--muted)] ${errorSummary ? "mt-2" : "mt-3"}`}>{insight}</p>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={runLoading}
          onClick={() => void onRunTest()}
          className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_18px_rgba(6,182,212,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <BellRinging className="h-3.5 w-3.5" weight="duotone" aria-hidden />
          {runLoading ? "Running…" : "Run test"}
        </button>
        <button
          type="button"
          onClick={onViewHistory}
          className="inline-flex flex-1 min-w-[120px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--foreground)]/90 transition hover:border-cyan-400/40 hover:text-cyan-200"
        >
          <ClockCounterClockwise className="h-3.5 w-3.5" aria-hidden />
          View history
        </button>
      </div>
    </article>
  );
}

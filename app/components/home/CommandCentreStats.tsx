"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { buildWorkspaceStats, type WorkspaceStat } from "@/lib/platform/workspace-stats";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function AnimatedValue({ value, reduced }: { value: number; reduced: boolean }) {
  void reduced;
  return <span>{value}</span>;
}

export default function CommandCentreStats() {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  const stats = useMemo(() => {
    void pathname;
    return buildWorkspaceStats();
  }, [pathname]);

  const primary = stats.filter((s) =>
    ["total", "it", "marketing", "cyber", "automation", "pinned", "recentD2d", "recentNav"].includes(s.id),
  );
  const secondary = stats.filter((s) => !primary.includes(s));

  return (
    <section className="mb-10 scroll-mt-28" id="command-stats" aria-labelledby="command-stats-heading">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ss-text-secondary)]">Command centre</p>
          <h2 id="command-stats-heading" className="text-lg font-semibold text-[var(--ss-text)] tracking-tight">
            Live workspace signals
          </h2>
          <p className="text-sm text-[var(--ss-text-secondary)] mt-1 max-w-2xl">
            Counts blend the public tool catalog with this browser&apos;s local activity. Server-backed analytics are a future
            upgrade.
          </p>
        </div>
        <p className="text-xs text-[var(--ss-text-secondary)]">Updates on navigation</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {primary.map((s) => (
          <StatTile key={s.id} stat={s} reduced={reduced} />
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {secondary.map((s) => (
          <StatTile key={s.id} stat={s} reduced={reduced} small />
        ))}
      </div>
    </section>
  );
}

function StatTile({ stat, reduced, small }: { stat: WorkspaceStat; reduced: boolean; small?: boolean }) {
  return (
    <article
      className={`ss-card card-lift rounded-2xl border border-[var(--ss-border)] p-4 ${small ? "p-3.5" : "p-5"}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ss-text-secondary)]">{stat.label}</p>
      <p className={`mt-2 font-semibold tracking-tight text-[var(--ss-text)] ${small ? "text-xl" : "text-2xl sm:text-3xl"}`}>
        <AnimatedValue value={stat.value} reduced={reduced} />
      </p>
      {stat.hint ? <p className="mt-1 text-[11px] text-[var(--ss-text-secondary)] leading-snug">{stat.hint}</p> : null}
      <div className="mt-3 h-1.5 rounded-full bg-[color-mix(in_srgb,var(--ss-text)_10%,transparent)] overflow-hidden" aria-hidden>
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] motion-safe:transition-[width] motion-safe:duration-700"
          style={{
            width: `${Math.min(
              100,
              stat.id === "total" ? 92 : stat.value <= 0 ? 8 : Math.min(100, 18 + Math.log10(stat.value + 1) * 36),
            )}%`,
          }}
        />
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getRecentToolNav, type ToolNavEntry } from "@/lib/platform/tool-nav-memory";

export default function MegaMenuRecentStrip({ onNavigate, menuOpen }: { onNavigate: () => void; menuOpen: boolean }) {
  const recent: ToolNavEntry[] = useMemo(() => {
    if (!menuOpen) return [];
    return getRecentToolNav().slice(0, 5);
  }, [menuOpen]);

  if (!recent.length) {
    return (
      <div className="border-b border-[var(--ss-border)] px-6 sm:px-7 py-3 text-[11px] text-[var(--ss-text-secondary)]">
        Tools you open will appear here as <strong className="text-[var(--ss-text)]">recently opened</strong> shortcuts.
      </div>
    );
  }

  return (
    <div className="border-b border-[var(--ss-border)] px-6 sm:px-7 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ss-text-secondary)] mb-2">Recently opened</p>
      <ul className="flex flex-wrap gap-2">
        {recent.map((r) => (
          <li key={`${r.href}-${r.at}`}>
            <Link
              href={r.href}
              data-mega-link
              onClick={onNavigate}
              className="inline-flex max-w-[14rem] truncate rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-1 text-[11px] font-medium text-[var(--ss-text)] hover:border-[color-mix(in_srgb,var(--ss-accent)_40%,transparent)] hover:text-[var(--ss-accent)] transition-colors"
            >
              {r.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

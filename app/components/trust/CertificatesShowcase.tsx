"use client";

import { useMemo, useState } from "react";
import { CERTIFICATE_PLACEHOLDERS, type CertStatus } from "@/lib/platform/certificates-data";

const STATUS_ORDER: CertStatus[] = ["Completed", "In progress", "Planned"];

const STAGGER = [
  "card-stagger-1",
  "card-stagger-2",
  "card-stagger-3",
  "card-stagger-4",
  "card-stagger-5",
  "card-stagger-6",
  "card-stagger-7",
] as const;

export default function CertificatesShowcase() {
  const [filter, setFilter] = useState<CertStatus | "All">("All");
  const rows = useMemo(() => {
    if (filter === "All") return CERTIFICATE_PLACEHOLDERS;
    return CERTIFICATE_PLACEHOLDERS.filter((c) => c.status === filter);
  }, [filter]);

  return (
    <section className="mb-12 scroll-mt-28" id="trust-credentials" aria-labelledby="creds-heading">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ss-text-secondary)]">Trust & learning</p>
          <h2 id="creds-heading" className="text-lg font-semibold text-[var(--ss-text)] tracking-tight">
            Credentials & capability map
          </h2>
          <p className="text-sm text-[var(--ss-text-secondary)] mt-1 max-w-2xl">
            Placeholder cards for study and roadmap items — not claims of third-party certification unless explicitly marked
            completed with a real verification link you add later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          {(["All", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={filter === s}
              onClick={() => setFilter(s)}
              className={`ss-pill px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === s
                  ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)]"
                  : "text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c, i) => (
          <article
            key={c.id}
            className={`ss-card card-lift rounded-2xl border border-[var(--ss-border)] p-5 ${STAGGER[i % STAGGER.length]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-[var(--ss-accent)]">{c.provider}</p>
                <h3 className="mt-1 text-base font-semibold text-[var(--ss-text)] leading-snug">{c.title}</h3>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  c.status === "Completed"
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                    : c.status === "In progress"
                      ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25"
                      : "bg-[color-mix(in_srgb,var(--ss-text)_8%,transparent)] text-[var(--ss-text-secondary)] ring-1 ring-[var(--ss-border)]"
                }`}
              >
                {c.status}
              </span>
            </div>
            {c.dateNote ? <p className="mt-2 text-[11px] text-[var(--ss-text-secondary)]">Date: {c.dateNote}</p> : null}
            <p className="mt-2 text-sm text-[var(--ss-text-secondary)] leading-relaxed">{c.notes}</p>
            {c.verifyUrl ? (
              <a
                href={c.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-xs font-semibold text-[var(--ss-accent)] hover:underline"
              >
                Verification portal (external) →
              </a>
            ) : (
              <p className="mt-4 text-[11px] text-[var(--ss-text-secondary)]">Verification link: add when earned.</p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)] px-4 py-3 flex flex-wrap gap-2 items-center justify-center text-center">
        <span className="text-xs font-medium text-[var(--ss-text-secondary)]">Built for daily IT and marketing operations</span>
        <span className="hidden sm:inline text-[var(--ss-border)]">|</span>
        {["Least privilege", "No secrets in client", "Export-friendly", "Accessible UI"].map((b) => (
          <span key={b} className="rounded-full bg-[var(--ss-accent-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--ss-accent)]">
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

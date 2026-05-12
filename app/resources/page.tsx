import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources – SecureScope",
  description: "Documentation, runbooks, certification maps, and engineering notes.",
};

const CARDS = [
  {
    href: "/resources/documentation",
    title: "Documentation",
    body: "Architecture, routing, and how tools connect to API routes.",
  },
  {
    href: "/resources/runbooks",
    title: "Runbooks",
    body: "Operational starters for incidents, mail outages, and DNS events.",
  },
  {
    href: "/resources/study-notes",
    title: "Study notes",
    body: "Condensed maps that point to live tools for hands-on practice.",
  },
  {
    href: "/resources/ms-102",
    title: "MS-102",
    body: "Microsoft 365 Administrator exam topics cross-linked to hubs.",
  },
  {
    href: "/resources/security-plus",
    title: "Security+",
    body: "Security+ domains mapped to SecureScope checklists.",
  },
  {
    href: "/resources/github-notes",
    title: "GitHub notes",
    body: "Actions, branch protection, and release hygiene references.",
  },
];

export default function ResourcesHubPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-[var(--ss-border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_srgb,var(--ss-accent)_12%,transparent)] via-transparent to-[color-mix(in_srgb,var(--accent-blue)_10%,transparent)] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ss-text-secondary)]">Resources</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--ss-text)]">Learn with the same tools you ship</h1>
          <p className="mt-4 text-lg text-[var(--ss-text-secondary)] max-w-2xl leading-relaxed">
            Glass-quiet reference pages that stay fast on static hosting. Each card opens a focused note set; deeper work
            happens in the live toolkit.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ul className="grid gap-4 sm:grid-cols-2">
          {CARDS.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="group flex h-full flex-col rounded-3xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_88%,transparent)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_22px_60px_rgba(0,0,0,0.3)]"
              >
                <h2 className="text-lg font-semibold text-[var(--ss-text)] group-hover:text-[var(--ss-accent)] transition-colors">
                  {c.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--ss-text-secondary)] leading-relaxed flex-1">{c.body}</p>
                <span className="mt-4 text-sm font-semibold text-[var(--ss-accent)]">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

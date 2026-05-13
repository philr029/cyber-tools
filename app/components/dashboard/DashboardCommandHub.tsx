"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { withBasePath } from "@/lib/base-path";
import { PLATFORM_HUB_LINKS } from "@/lib/platform/hub-links";
import CommandCentreStats from "@/app/components/home/CommandCentreStats";

const quick = [
  { href: "/tools/browse", label: "Browse tools" },
  { href: "/web-tools", label: "Website QA" },
  { href: "/tools/phone-line-tester", label: "Phone tests" },
  { href: "/day-to-day-tools", label: "Day-to-day" },
  { href: "/forms", label: "Forms centre" },
];

export default function DashboardCommandHub() {
  const { user, loading } = useAuth();
  const name = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="mb-8 space-y-6 animate-page-enter">
      <section className="rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_90%,transparent)] p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ss-text-secondary)]">Welcome back</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ss-text)]">
              {loading ? "Loading workspace…" : `Hello, ${name}`}
            </h2>
            <p className="mt-2 text-sm text-[var(--ss-text-secondary)] max-w-xl">
              This hub links monitoring, AI forensics, and toolkit shortcuts. Use the quick launches below to jump into
              high-frequency flows.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="ss-pill ss-pill-ghost px-3 py-1.5 text-xs font-semibold"
            >
              Threat lookup
            </Link>
            <Link href="/pricing" className="ss-pill ss-pill-ghost px-3 py-1.5 text-xs font-semibold">
              Plans
            </Link>
            <Link href={withBasePath("/settings")} className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white">
              Settings
            </Link>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {quick.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="inline-flex items-center rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--ss-text)] hover:border-[color-mix(in_srgb,var(--ss-accent)_40%,transparent)] hover:text-[var(--ss-accent)] transition-colors"
            >
              {q.label}
            </Link>
          ))}
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_HUB_LINKS.slice(0, 9).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-[var(--ss-border)] px-3 py-2 text-xs text-[var(--ss-text-secondary)] hover:bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] transition-colors"
            >
              <span className="font-semibold text-[var(--ss-text)]">{l.label}</span>
              {l.description ? <span className="block text-[11px] mt-0.5">{l.description}</span> : null}
            </Link>
          ))}
        </div>
      </section>

      <CommandCentreStats />

      <section className="rounded-2xl border border-[var(--ss-border)] bg-[#0d1321] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Reminders</h3>
            <p className="text-xs text-slate-500 mt-1">
              Rotate API keys quarterly, review Conditional Access reports, and export form archives before clearing browser
              storage.
            </p>
          </div>
          <button
            type="button"
            className="ss-pill ss-pill-ghost px-3 py-1.5 text-xs font-semibold text-slate-300"
            onClick={() => {
              const blob = new Blob(
                [
                  JSON.stringify(
                    {
                      exportedAt: new Date().toISOString(),
                      note: "Dashboard summary placeholder — wire to real metrics later.",
                    },
                    null,
                    2,
                  ),
                ],
                { type: "application/json" },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "dashboard-summary-placeholder.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export summary (JSON)
          </button>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation – SecureScope",
  description: "Help centre: getting started, localStorage, exports, deployment, and security notes.",
};

const sections = [
  {
    title: "Getting started",
    body: "Browse /tools/browse, pin favourites in Day-to-Day Tools, and sign in for dashboard routes. Set API keys in Settings for live provider data.",
  },
  {
    title: "How tools work",
    body: "Each tool is a route under /tools or a hub page (*-tools). Server routes proxy third-party APIs so keys stay off the client.",
  },
  {
    title: "localStorage",
    body: "Scan history, form archives, theme, and navigation recents live in your browser. Clearing site data removes them — export JSON/CSV from the forms centre first if needed.",
  },
  {
    title: "Exports",
    body: "Platform forms append submissions per form ID under ss_form_archive_* keys. Use the download buttons after submit for JSON/CSV snapshots.",
  },
  {
    title: "Adding a new tool",
    body: "Add a route under app/tools/..., register the href in lib/tools/site-catalog.ts RAW_TOOLS, and (optionally) lib/navigation/app-menu.ts for mega menu placement.",
  },
  {
    title: "Future APIs",
    body: "Prefer Route Handlers or Server Actions. Read rate limits from env, validate input, and never return service-role material to the browser.",
  },
  {
    title: "Pricing placeholders",
    body: "Tiers describe roadmap packaging. Connect Stripe/Lemon/Paddle only on the server; keep webhooks secret.",
  },
  {
    title: "Security",
    body: "See /security for CSP notes (proxy.ts), Cookiebot, Supabase session cookies, and local encryption for the vault.",
  },
  {
    title: "Deployment",
    body: "Vercel: set NEXT_PUBLIC_SITE_URL and provider keys in Project Settings. GitHub Pages: set NEXT_PUBLIC_BASE_PATH to your repo path and use static export only if your deployment supports it.",
  },
  {
    title: "Troubleshooting menus",
    body: "Mega menu closes on outside click and Escape. Mobile drawer uses a portal above z-50 overlays. If a link 404s, verify the route exists and base path is set for subpath hosts.",
  },
  {
    title: "Troubleshooting routes",
    body: "Use next build locally. Middleware (proxy.ts) may redirect unauthenticated users away from /dashboard/* — sign in first.",
  },
];

export default function DocsPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-14 animate-page-enter">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ss-text-secondary)]">Help</p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--ss-text)] tracking-tight">Documentation & help centre</h1>
      <p className="mt-3 text-sm text-[var(--ss-text-secondary)] leading-relaxed">
        Concise operator notes for this repository. For architecture deep-dives, see{" "}
        <Link href="/developer-notes" className="text-[var(--ss-accent)] font-medium hover:underline">
          Developer notes
        </Link>
        .
      </p>
      <div className="mt-10 space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_92%,transparent)] p-5">
            <h2 className="text-base font-semibold text-[var(--ss-text)]">{s.title}</h2>
            <p className="mt-2 text-sm text-[var(--ss-text-secondary)] leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}

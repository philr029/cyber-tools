"use client";

import Link from "next/link";
import type { ReactNode } from "react";

const STATS = [
  { label: "Total tools", value: "70+", caption: "across coding, IT admin, M365, cyber, web QA, automation, business" },
  { label: "Coding tools", value: "10", caption: "snippets, regex, JSON, API, GH Actions, README, commit, bug, changelog, review" },
  { label: "IT admin tools", value: "8", caption: "starter, leaver, mailbox, licence, access, triage, build, install" },
  { label: "Security tools", value: "20+", caption: "M365, Defender, cyber, identity, network, endpoint and incident" },
  { label: "API integrations planned", value: "8", caption: "VirusTotal, AbuseIPDB, Safe Browsing, HetrixTools, Graph, more" },
];

const CATEGORIES = [
  {
    href: "/coding-tools",
    title: "Coding Automation",
    description: "Snippets, regex, JSON, API requests, GH Actions, READMEs, commits, changelogs, reviews.",
    accent: "from-cyan-500/30 to-blue-500/10",
    count: "10 tools",
  },
  {
    href: "/it-admin-tools",
    title: "IT Admin Automation",
    description: "New starter, leaver, shared mailbox, licence planner, access review, triage, build, install.",
    accent: "from-emerald-500/30 to-teal-500/10",
    count: "8 tools",
  },
  {
    href: "/m365-tools",
    title: "Microsoft 365 Security",
    description: "MFA, Conditional Access, Safe Links, forwarding audit, admin roles, Intune, incidents.",
    accent: "from-violet-500/30 to-indigo-500/10",
    count: "12 tools",
  },
  {
    href: "/cyber-tools",
    title: "Cyber Security",
    description: "Password advisor, phishing analyser, firewall rules, security headers, SSL, DNS, incidents.",
    accent: "from-rose-500/30 to-pink-500/10",
    count: "13 tools",
  },
  {
    href: "/web-tools",
    title: "Website QA",
    description: "Uptime, redirects, broken links, meta, SEO, page speed, accessibility, mobile, forms.",
    accent: "from-amber-500/30 to-orange-500/10",
    count: "10 tools",
  },
  {
    href: "/business-tools",
    title: "Business Productivity",
    description: "Email tone, meeting notes, project updates, SOPs, risk register.",
    accent: "from-sky-500/30 to-cyan-500/10",
    count: "5 tools",
  },
  {
    href: "/automation-tools",
    title: "Automation & Ops",
    description: "Daily test planner, GitHub Actions, API key safety, Vercel env vars, Power Automate.",
    accent: "from-fuchsia-500/30 to-purple-500/10",
    count: "8 tools",
  },
  {
    href: "/domain-ip-tools",
    title: "Domain & IP",
    description: "WHOIS, DNS, subdomains, geo, blacklist, redirect tracer, domain protection.",
    accent: "from-teal-500/30 to-emerald-500/10",
    count: "7 tools",
  },
  {
    href: "/lead-tools",
    title: "Phone & Lead",
    description: "Phone validator, lead intel, form QA, email header analysis.",
    accent: "from-indigo-500/30 to-violet-500/10",
    count: "5 tools",
  },
];

const FEATURED = [
  { href: "/tools/coding/snippet", title: "Code Snippet Generator", description: "Starter templates for JavaScript, Python, PowerShell, HTML and CSS.", tag: "Coding" },
  { href: "/tools/it-admin/licence-planner", title: "M365 Licence Planner", description: "Plan SKU counts and costs with editable prices saved locally.", tag: "IT Admin" },
  { href: "/tools/m365/safe-links", title: "Safe Links Explainer", description: "Decode a Defender Safe Links wrapper and reveal the real destination.", tag: "M365" },
  { href: "/tools/security/password-advisor", title: "Password Strength Advisor", description: "In-browser strength, entropy and passphrase suggestions — nothing sent.", tag: "Security" },
  { href: "/tools/business/risk-register", title: "Risk Register Builder", description: "A structured risk register that exports clean Markdown — saved locally.", tag: "Business" },
  { href: "/tools/coding/actions-generator", title: "GitHub Actions Workflow Generator", description: "Production-quality YAML for Pages, Playwright, security and schedules.", tag: "Coding" },
];

export default function HomeDashboard() {
  return (
    <>
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-3xl border border-[#1e2d4a] bg-gradient-to-br from-[#0b1224] via-[#0a0f1e] to-[#0b1422] p-8 lg:p-12">
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/90">
              IT Automation Toolkit · Developer Automation Hub
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              IT Automation Toolkit
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-7 text-slate-300/90">
              A collection of tools for IT admins, developers, cyber security, Microsoft 365, and website automation.
              Built to feel like a SaaS dashboard — and engineered so each tool stays useful in real day-to-day work.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.35)] hover:from-cyan-400 hover:to-blue-500 transition-colors"
              >
                Browse all tools
              </Link>
              <Link
                href="/coding-tools"
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/15 transition-colors"
              >
                Coding tools
              </Link>
              <Link
                href="/it-admin-tools"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
              >
                IT admin tools
              </Link>
              <Link
                href="/cyber-tools"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
              >
                Cyber security
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader eyebrow="Toolkit by the numbers" title="Dashboard stats" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STATS.map((s) => (
            <article key={s.label} className="rounded-2xl border border-[#1e2d4a] bg-[#0f1629] p-5 transition-all duration-200 hover:border-cyan-400/40 hover:bg-[#0f1d3a]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{s.label}</p>
              <p className="mt-3 text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{s.value}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{s.caption}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader eyebrow="Categories" title="Pick a category and jump in" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl border border-[#1e2d4a] bg-[#0f1629] p-5 transition-all duration-200 hover:border-cyan-400/40 hover:-translate-y-0.5"
            >
              <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${c.accent} opacity-60 blur-2xl pointer-events-none`} aria-hidden="true" />
              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-100">{c.title}</h3>
                  {c.count && (
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200 shrink-0">
                      {c.count}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{c.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition-colors group-hover:text-cyan-200">
                  Open category
                  <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader eyebrow="Featured tools" title="A few highlights to try first" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-2xl border border-[#1e2d4a] bg-[#0f1629] p-5 transition-all duration-200 hover:border-cyan-400/40"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-semibold text-slate-100">{f.title}</h3>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">{f.tag}</span>
              </div>
              <p className="text-sm leading-6 text-slate-400">{f.description}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0f1629] p-6 lg:p-8">
          <SectionHeader eyebrow="Why I built this" title="A useful sandbox that doubles as a portfolio" plain />
          <div className="grid gap-4 lg:grid-cols-3 text-sm leading-6 text-slate-300">
            <Block title="Real day-to-day IT work">
              I support Microsoft 365 tenants, helpdesks, websites and lead-generation funnels. Every tool here grew out of a real task I needed to repeat reliably.
            </Block>
            <Block title="Built for clarity, not magic">
              Every result is clearly labelled <em>demo</em> or <em>live</em>. Checklists are plain Markdown you can copy into a ticket, runbook, or onboarding doc.
            </Block>
            <Block title="Designed to be extended">
              Each tool is structured so a real API — VirusTotal, AbuseIPDB, Microsoft Graph, Cloudflare, HetrixTools — can be wired in without rewriting the UI.
            </Block>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cyber-tools" className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:from-cyan-400 hover:to-blue-500 transition-colors">
              Try the cyber tools
            </Link>
            <Link href="/m365-tools" className="inline-flex items-center gap-1.5 rounded-xl border border-[#1e2d4a] bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors">
              See the Microsoft 365 checklists
            </Link>
            <Link href="/automation-tools" className="inline-flex items-center gap-1.5 rounded-xl border border-[#1e2d4a] bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors">
              Browse the automation tools
            </Link>
            <Link href="/about" className="inline-flex items-center gap-1.5 rounded-xl border border-[#1e2d4a] bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors">
              About this project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ eyebrow, title, plain }: { eyebrow: string; title: string; plain?: boolean }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">{eyebrow}</p>
      <h2 className={`mt-2 text-xl font-bold tracking-tight ${plain ? "text-slate-100" : "text-slate-100"}`}>{title}</h2>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1e2d4a]/60 bg-black/20 p-4">
      <p className="text-sm font-semibold text-slate-100 mb-2">{title}</p>
      <p>{children}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import type { ReactNode } from "react";

const STATS = [
  { label: "Tools available", value: "55+", caption: "across Web, Cyber, M365, Domain/IP, Automation, Business, Reporting and Phone & Lead" },
  { label: "Checks automated", value: "200+", caption: "concrete checklist items, ready to copy" },
  { label: "Categories", value: "8", caption: "web, cyber, identity, network, automation, business, reporting, lead" },
  { label: "Microsoft 365 workflows", value: "11", caption: "licensing, starter, leaver, MFA, CA, Teams Phone, Intune, Defender" },
];

const CATEGORIES = [
  { href: "/web-tools", title: "Web Tools", description: "Status, redirects, broken links, meta, page speed, mobile, forms, launch checklist.", accent: "from-cyan-500/30 to-blue-500/10" },
  { href: "/cyber-tools", title: "Cyber Tools", description: "Reputation, SSL, DNS, security headers, phishing email/URL, password strength, IR.", accent: "from-violet-500/30 to-indigo-500/10" },
  { href: "/m365-tools", title: "Microsoft 365", description: "Licensing, starter/leaver, MFA, CA, Teams Phone, Intune, Defender.", accent: "from-emerald-500/30 to-teal-500/10" },
  { href: "/domain-ip-tools", title: "Domain & IP", description: "WHOIS, DNS, subdomains, geo, blacklist (incl. monitor), deliverability.", accent: "from-amber-500/30 to-orange-500/10" },
  { href: "/automation-tools", title: "Automation", description: "Daily test planner, GH Actions, API integration planner, Vercel env, Power Automate.", accent: "from-rose-500/30 to-pink-500/10" },
  { href: "/business-tools", title: "Business / IT", description: "Ticket priority, RCA, change requests, asset handover, vendor comparison.", accent: "from-fuchsia-500/30 to-pink-500/10" },
  { href: "/reporting-tools", title: "Reporting", description: "Security reports, monthly IT summary, QA reports, automation ROI calculator.", accent: "from-indigo-500/30 to-blue-500/10" },
  { href: "/lead-tools", title: "Phone & Lead", description: "Phone validator, lead intel, form QA, email header analysis.", accent: "from-sky-500/30 to-cyan-500/10" },
];

const FEATURED = [
  { href: "/tools/phishing-email-analyser", title: "Phishing Email Analyser", description: "Score a suspect email from sender, subject, links and urgency tone.", tag: "Cyber" },
  { href: "/tools/m365/ca-policy-builder", title: "Conditional Access Policy Builder", description: "Build a clean, named CA policy from group, app, location and device inputs.", tag: "M365" },
  { href: "/tools/business/ticket-priority", title: "Ticket Priority Calculator", description: "Impact × urgency × users → deterministic priority and SLA.", tag: "Business" },
  { href: "/tools/reporting/automation-roi", title: "Automation ROI Calculator", description: "Estimate monthly savings, annual savings and payback period.", tag: "Reporting" },
];

export default function HomeDashboard() {
  return (
    <>
      <section className="mb-10">
        <SectionHeader eyebrow="Toolkit by the numbers" title="Built to be useful, not just a portfolio piece" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                <h3 className="text-base font-semibold text-slate-100">{c.title}</h3>
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
        <div className="grid gap-3 sm:grid-cols-2">
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

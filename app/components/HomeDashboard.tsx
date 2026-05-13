"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import type { ReactNode } from "react";
import type { ComponentType } from "react";
import {
  Briefcase,
  Browser,
  Code,
  GearSix,
  Megaphone,
  Package,
  ShieldCheck,
  Sparkle,
  TreeStructure,
  type IconProps,
} from "@phosphor-icons/react";
import UniversalToolCard from "@/app/components/UniversalToolCard";
import SectionReveal from "@/app/components/ui/SectionReveal";
import ToolCategoryCard from "@/app/components/home/ToolCategoryCard";
import { DASHBOARD_SECTION_META, featuredToolsList, mostUsefulToolsList, recentlyAddedToolsList, type SiteTool } from "@/lib/tools/site-catalog";

const TAG_ICONS: Record<string, ComponentType<IconProps>> = {
  "Web QA": Browser,
  DNS: TreeStructure,
  Security: ShieldCheck,
  Marketing: Megaphone,
  Automation: GearSix,
  Developer: Code,
  AI: Sparkle,
  Productivity: Briefcase,
};

function iconForTool(t: SiteTool) {
  return TAG_ICONS[t.categoryTag] ?? Package;
}

const CATEGORIES = [
  {
    href: "/it-admin-tools",
    title: "IT Admin",
    emoji: "🧰",
    description: "Starters, leavers, mailboxes, licensing, access reviews, triage, and device build flows.",
    accent: "from-emerald-500/25 to-teal-500/10",
    count: "Hub + checklists",
  },
  {
    href: "/cyber-tools",
    title: "Cyber Security",
    emoji: "🛡️",
    description: "Phishing, headers, SSL, DNS hygiene, suspicious URLs, threat scoring, and IR prompts.",
    accent: "from-rose-500/25 to-pink-500/10",
    count: "Security hub",
  },
  {
    href: "/marketing-tools",
    title: "Marketing",
    emoji: "✉️",
    description: "UTMs, campaigns, social drafts, subject lines, SERP previews, and calculators.",
    accent: "from-fuchsia-500/25 to-pink-500/10",
    count: "Growth toolkit",
  },
  {
    href: "/web-tools",
    title: "Website Testing",
    emoji: "🧪",
    description: "Launch QA, redirects, broken links, performance, accessibility, forms, and uptime.",
    accent: "from-amber-500/25 to-orange-500/10",
    count: "Web QA hub",
  },
  {
    href: "/lead-tools",
    title: "Phone Testing",
    emoji: "📞",
    description: "Validators, lead intelligence, and phone-line test scripts alongside CRM-adjacent flows.",
    accent: "from-indigo-500/25 to-violet-500/10",
    count: "Phone & lead",
  },
  {
    href: "/automation-tools",
    title: "Automation",
    emoji: "⚙️",
    description: "Monitoring hub, daily planners, GitHub Actions, API safety, and integration contracts.",
    accent: "from-purple-500/25 to-indigo-500/10",
    count: "Ops automation",
  },
  {
    href: "/coding-tools",
    title: "Developer Tools",
    emoji: "💻",
    description: "Snippets, regex, JSON, API requests, repo health, Actions YAML, and review checklists.",
    accent: "from-sky-500/25 to-cyan-500/10",
    count: "Engineering hub",
  },
];

export default function HomeDashboard() {
  return (
    <div id="portfolio-toolkit" className="scroll-mt-28">
      <section className="mb-10">
        <SectionReveal>
          <SectionHeader eyebrow="Navigate" title="Organised hubs for every discipline" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {CATEGORIES.map((c) => (
              <ToolCategoryCard
                key={c.href}
                href={c.href}
                title={c.title}
                description={c.description}
                meta={c.count}
                accent={c.accent}
                emoji={c.emoji}
              />
            ))}
          </div>
        </SectionReveal>
      </section>

      <section className="mb-10">
        <SectionReveal>
          <SectionHeader eyebrow="Featured tools" title="Hand-picked modules to try first" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredToolsList(6).map((t) => (
              <UniversalToolCard
                key={t.href}
                href={t.href}
                title={t.label}
                description={t.description}
                categoryTag={t.categoryTag}
                dashboardLabel={DASHBOARD_SECTION_META[t.dashboardSection].label}
                icon={iconForTool(t)}
                status={t.status}
                tags={t.displayTags}
                comingSoon={t.comingSoon}
              />
            ))}
          </div>
        </SectionReveal>
      </section>

      <section className="mb-10">
        <SectionReveal>
          <SectionHeader eyebrow="Recently added" title="Fresh routes in the toolkit" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyAddedToolsList(6).map((t) => (
              <UniversalToolCard
                key={t.href}
                href={t.href}
                title={t.label}
                description={t.description}
                categoryTag={t.categoryTag}
                dashboardLabel={DASHBOARD_SECTION_META[t.dashboardSection].label}
                icon={iconForTool(t)}
                status={t.status}
                tags={t.displayTags}
                comingSoon={t.comingSoon}
              />
            ))}
          </div>
        </SectionReveal>
      </section>

      <section className="mb-10">
        <SectionReveal>
          <SectionHeader eyebrow="Most useful" title="High-frequency desk tools" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mostUsefulToolsList(6).map((t) => (
              <UniversalToolCard
                key={t.href}
                href={t.href}
                title={t.label}
                description={t.description}
                categoryTag={t.categoryTag}
                dashboardLabel={DASHBOARD_SECTION_META[t.dashboardSection].label}
                icon={iconForTool(t)}
                status={t.status}
                tags={t.displayTags}
                comingSoon={t.comingSoon}
              />
            ))}
          </div>
        </SectionReveal>
      </section>

      <section className="mb-10">
        <div className="ss-card rounded-3xl p-6 lg:p-8">
          <SectionHeader eyebrow="Why I built this" title="A useful sandbox that doubles as a portfolio" plain />
          <div className="grid gap-4 lg:grid-cols-3 text-sm">
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
            <Link
              href="/cyber-tools"
              className="ss-pill ss-pill-primary btn-micro inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white"
            >
              Try the cyber tools
            </Link>
            <Link
              href={withBasePath("/pricing")}
              className="ss-pill ss-pill-ghost btn-micro inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
            >
              View pricing
            </Link>
            <Link
              href="/m365-tools"
              className="ss-pill ss-pill-ghost btn-micro inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
            >
              See the Microsoft 365 checklists
            </Link>
            <Link
              href="/automation-tools"
              className="ss-pill ss-pill-ghost btn-micro inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
            >
              Browse the automation tools
            </Link>
            <Link href="/about" className="ss-pill ss-pill-ghost btn-micro inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold">
              About this project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string; plain?: boolean }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ss-text-secondary)]">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--ss-text)]">{title}</h2>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-4">
      <p className="text-sm font-semibold text-[var(--ss-text)] mb-2">{title}</p>
      <p className="text-[var(--ss-text-secondary)] leading-relaxed">{children}</p>
    </div>
  );
}

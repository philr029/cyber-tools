import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const SLUGS: Record<
  string,
  { title: string; description: string; bullets: string[]; links?: { href: string; label: string }[] }
> = {
  documentation: {
    title: "Documentation",
    description:
      "SecureScope is a Next.js 16 App Router project. Tools call server routes under `/api` so secrets stay off the client.",
    bullets: [
      "Navigation data lives in `lib/navigation/app-menu.ts` and mirrors this resources area.",
      "The global search index merges the site catalog, marketing tools, and `lib/data/searchIndex.ts`.",
      "Authentication-gated `/dashboard/*` routes are enforced in `proxy.ts` middleware.",
    ],
    links: [
      { href: "/about", label: "About the platform" },
      { href: "/tools/browse", label: "Toolkit browser" },
    ],
  },
  runbooks: {
    title: "Runbooks",
    description: "Starter checklists you can paste into tickets or Teams threads when minutes matter.",
    bullets: [
      "Mail flow triage: MX → SPF/DKIM/DMARC → headers (`/tools/mx-dns-checker`, `/tools/email-headers`).",
      "Web outage: status codes → redirects → TLS (`/tools/website-status`, `/tools/ssl-checker`).",
      "Identity incident: risky sign-ins → CA policies (`/tools/m365/conditional-access`).",
    ],
    links: [
      { href: "/tools/incident-response", label: "Incident response template" },
      { href: "/dashboard/playbooks", label: "Workspace playbooks" },
    ],
  },
  "study-notes": {
    title: "Study notes",
    description: "Use live tools as labs — every checklist links to runnable pages, not dead PDFs.",
    bullets: [
      "Pair DNS labs with `/tools/dns-lookup` and `/tools/email-deliverability`.",
      "Pair security domains with `/cyber-tools` and `/tools/preview/security-audit-checklist`.",
      "Pair automation topics with `/automation-tools` and `/tools/automated-monitoring`.",
    ],
    links: [{ href: "/search", label: "Open search" }],
  },
  "ms-102": {
    title: "MS-102 map",
    description: "Microsoft 365 Administrator certification anchors mapped to SecureScope hubs.",
    bullets: [
      "Identity & access: `/m365-tools` and Conditional Access builders.",
      "Security & compliance: Defender baselines and email security checklists.",
      "Modern messaging & collaboration: Teams phone and Exchange hygiene tools.",
    ],
    links: [
      { href: "/m365-tools", label: "Microsoft 365 hub" },
      { href: "/it-admin-tools", label: "IT admin hub" },
    ],
  },
  "security-plus": {
    title: "Security+ map",
    description: "High-level domain mapping for Security+ style study paths.",
    bullets: [
      "Threats & vulnerabilities: `/cyber-tools` and phishing analysers.",
      "Architecture: Zero Trust prompts via M365 and network tools.",
      "Operations: monitoring hub, API testers, and reporting generators.",
    ],
    links: [{ href: "/cyber-tools", label: "Security hub" }],
  },
  "github-notes": {
    title: "GitHub notes",
    description: "Shipping hygiene that pairs with the coding utilities hub.",
    bullets: [
      "Use `/tools/github-repo-health` before declaring a repo “green”.",
      "Generate Actions YAML from `/tools/coding/actions-generator`.",
      "Keep README sections aligned with `/tools/coding/readme-generator`.",
    ],
    links: [{ href: "/coding-tools", label: "Coding utilities hub" }],
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = SLUGS[slug];
  if (!page) return { title: "Not found" };
  return { title: `${page.title} – Resources` };
}

export default async function ResourceSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = SLUGS[slug];
  if (!page) notFound();

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Link href="/resources" className="text-sm font-semibold text-[var(--ss-accent)] hover:underline">
          ← Resources
        </Link>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ss-text)]">{page.title}</h1>
        <p className="mt-4 text-[var(--ss-text-secondary)] leading-relaxed">{page.description}</p>
        <ul className="mt-8 space-y-3 list-disc pl-5 text-sm text-[var(--ss-text)] marker:text-[var(--ss-accent)]">
          {page.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {page.links && page.links.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-3">
            {page.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--ss-text)] hover:border-[color-mix(in_srgb,var(--ss-accent)_45%,transparent)] hover:bg-[var(--ss-accent-soft)] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

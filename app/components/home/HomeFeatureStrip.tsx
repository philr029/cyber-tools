import Link from "next/link";
import type { ComponentType } from "react";
import {
  Globe,
  MagnifyingGlass,
  Megaphone,
  Phone,
  Robot,
  ShieldCheck,
  TreeStructure,
  type IconProps,
} from "@phosphor-icons/react";

type Feature = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<IconProps>;
};

const FEATURES: Feature[] = [
  {
    title: "Domain tools",
    description: "WHOIS, DNS, MX, reputation, and mail-path diagnostics in one hub.",
    href: "/domain-ip-tools",
    icon: TreeStructure,
  },
  {
    title: "Phone testing",
    description: "PSTN scripts, validation, and escalation-friendly test notes.",
    href: "/lead-tools",
    icon: Phone,
  },
  {
    title: "Website & form testing",
    description: "Launch QA, performance passes, and structured form coverage.",
    href: "/web-tools",
    icon: Globe,
  },
  {
    title: "Marketing tools",
    description: "UTMs, campaigns, social drafts, and conversion helpers.",
    href: "/marketing-tools",
    icon: Megaphone,
  },
  {
    title: "Cyber tools",
    description: "Headers, SSL, phishing checks, and incident-ready narratives.",
    href: "/cyber-tools",
    icon: ShieldCheck,
  },
  {
    title: "Automation tools",
    description: "Monitoring hubs, CI schedules, API safety, and integration planners.",
    href: "/automation-tools",
    icon: Robot,
  },
  {
    title: "Advanced search",
    description: "Command-style search across every route, hub, and checklist.",
    href: "/search",
    icon: MagnifyingGlass,
  },
];

const CARD_STAGGER = [
  "card-stagger-1",
  "card-stagger-2",
  "card-stagger-3",
  "card-stagger-4",
  "card-stagger-5",
  "card-stagger-6",
  "card-stagger-7",
] as const;

export default function HomeFeatureStrip() {
  return (
    <section
      className="relative border-y border-[color-mix(in_srgb,var(--ss-text)_10%,transparent)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_88%,transparent)]"
      aria-labelledby="home-feature-heading"
    >
      <div className="absolute inset-0 ss-ambient-glow opacity-70" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--ss-text)_45%,transparent)]">
            Toolkit
          </p>
          <h2 id="home-feature-heading" className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ss-text)]">
            Everything you need for modern IT and growth ops
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--ss-text-secondary)]">
            Jump into a category — each hub is organised like a calm product surface so you can move quickly without noise.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            const stagger = CARD_STAGGER[idx] ?? "card-stagger-7";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`ss-card group card-lift relative overflow-hidden p-5 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-page)] ${stagger}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ss-accent-soft)] text-[var(--ss-accent)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)]">
                    <Icon className="h-5 w-5" weight="duotone" aria-hidden />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">
                    Open
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-[var(--ss-text)] group-hover:text-[var(--ss-accent)] motion-safe:transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ss-text-secondary)]">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

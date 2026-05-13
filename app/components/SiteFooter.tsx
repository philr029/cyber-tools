"use client";

import Link from "next/link";
import CookieSettingsButton from "@/app/components/CookieSettingsButton";
import BrandLogo from "@/app/components/brand/BrandLogo";
import { withBasePath } from "@/lib/base-path";
import { EXTERNAL_LINKS, PLATFORM_HUB_LINKS } from "@/lib/platform/hub-links";

const linkClass =
  "text-xs font-medium text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] motion-safe:transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-page)]";

const colTitle = "text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ss-text-secondary)] mb-3";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_92%,transparent)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-3">
            <BrandLogo />
            <p className="text-sm text-[var(--ss-text-secondary)] leading-relaxed max-w-sm">
              SecureScope is a fast workspace for IT, marketing, cyber, and automation checks — with glass navigation, local
              exports, and a clear path to real backends.
            </p>
            <p className="text-[11px] text-[var(--ss-text-secondary)]">
              Version <span className="font-mono text-[var(--ss-text)]">0.1.0</span> · Last updated{" "}
              <time dateTime="2026-05-13">May 2026</time>
            </p>
          </div>

          <div className="lg:col-span-8 grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <p className={colTitle}>Toolkit</p>
              <ul className="space-y-2">
                {PLATFORM_HUB_LINKS.filter((l) =>
                  ["/tools/browse", "/domain-ip-tools", "/marketing-tools", "/cyber-tools", "/automation-tools"].includes(l.href),
                ).map((l) => (
                  <li key={l.href}>
                    <Link href={withBasePath(l.href)} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={colTitle}>Platform</p>
              <ul className="space-y-2">
                <li>
                  <Link href={withBasePath("/dashboard")} className={linkClass}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/pricing")} className={linkClass}>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/forms")} className={linkClass}>
                    Forms centre
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/docs")} className={linkClass}>
                    Help & docs
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/developer-notes")} className={linkClass}>
                    Developer notes
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/credentials")} className={linkClass}>
                    Credentials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className={colTitle}>Trust & source</p>
              <ul className="space-y-2">
                <li>
                  <Link href={withBasePath("/privacy")} className={linkClass}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/cookies")} className={linkClass}>
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <CookieSettingsButton className={`${linkClass} cursor-pointer bg-transparent border-0 p-0`} />
                </li>
                <li>
                  <Link href={withBasePath("/security")} className={linkClass}>
                    Security
                  </Link>
                </li>
                <li>
                  <a href={EXTERNAL_LINKS.githubRepo} className={linkClass} target="_blank" rel="noopener noreferrer">
                    GitHub repository
                  </a>
                </li>
                <li>
                  <a href={EXTERNAL_LINKS.portfolio} className={linkClass} target="_blank" rel="noopener noreferrer">
                    Portfolio
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-[11px] text-[var(--ss-text-secondary)]">
                Social: <span className="italic">add LinkedIn / X when publishing</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--ss-border)] pt-6">
          <p className="text-[11px] text-[var(--ss-text-secondary)] text-center sm:text-left">
            © {new Date().getFullYear()} Philip Ruttley. Cookie consent via Cookiebot; essential categories remain for login.
          </p>
          <button
            type="button"
            className="ss-pill ss-pill-ghost px-3 py-1.5 text-xs font-semibold"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}

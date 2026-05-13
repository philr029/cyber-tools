"use client";

import Link from "next/link";
import CookieSettingsButton from "@/app/components/CookieSettingsButton";
import BrandLogo from "@/app/components/brand/BrandLogo";
import { withBasePath } from "@/lib/base-path";
import { EXTERNAL_LINKS } from "@/lib/platform/hub-links";

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

          <div className="lg:col-span-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className={colTitle}>Product</p>
              <ul className="space-y-2">
                <li>
                  <Link href={withBasePath("/pricing")} className={linkClass}>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/dashboard")} className={linkClass}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/forms")} className={linkClass}>
                    Forms centre
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/enterprise")} className={linkClass}>
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className={colTitle}>Tools</p>
              <ul className="space-y-2">
                <li>
                  <Link href={withBasePath("/tools/browse")} className={linkClass}>
                    Browse toolkit
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/domain-ip-tools")} className={linkClass}>
                    Domain &amp; DNS
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/cyber-tools")} className={linkClass}>
                    Security
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/web-tools")} className={linkClass}>
                    Website testing
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/automation-tools")} className={linkClass}>
                    Automation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className={colTitle}>Resources</p>
              <ul className="space-y-2">
                <li>
                  <Link href={withBasePath("/blog")} className={linkClass}>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/docs")} className={linkClass}>
                    Docs
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/developer-notes")} className={linkClass}>
                    Developer notes
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/resources")} className={linkClass}>
                    Resources library
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className={colTitle}>Company</p>
              <ul className="space-y-2">
                <li>
                  <Link href={withBasePath("/contact")} className={linkClass}>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/security")} className={linkClass}>
                    Security
                  </Link>
                </li>
                <li>
                  <a href={EXTERNAL_LINKS.githubRepo} className={linkClass} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href={EXTERNAL_LINKS.portfolio} className={linkClass} target="_blank" rel="noopener noreferrer">
                    Portfolio
                  </a>
                </li>
                <li>
                  <Link href={withBasePath("/privacy")} className={linkClass}>
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href={withBasePath("/cookies")} className={linkClass}>
                    Cookies
                  </Link>
                </li>
                <li>
                  <CookieSettingsButton className={`${linkClass} cursor-pointer bg-transparent border-0 p-0`} />
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--ss-border)] pt-6">
          <p className="text-[11px] text-[var(--ss-text-secondary)] text-center sm:text-left">
            © {new Date().getFullYear()} Philip Ruttley. Cookie consent via Cookiebot; essential categories remain for login.
          </p>
          <button
            type="button"
            className="ss-pill ss-pill-ghost px-3 py-1.5 text-xs font-semibold motion-safe:transition-transform motion-safe:hover:-translate-y-px"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import CookieSettingsButton from "@/app/components/CookieSettingsButton";
import { withBasePath } from "@/lib/base-path";

const linkClass =
  "text-xs font-medium text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] motion-safe:transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-page)]";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_88%,transparent)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav
          className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center sm:text-left"
          aria-label="Legal and privacy"
        >
          <Link href={withBasePath("/privacy")} className={linkClass}>
            Privacy Policy
          </Link>
          <Link href={withBasePath("/cookies")} className={linkClass}>
            Cookie Policy
          </Link>
          <CookieSettingsButton className={`${linkClass} cursor-pointer bg-transparent border-0 p-0`} />
          <Link href={withBasePath("/security")} className={linkClass}>
            Security
          </Link>
        </nav>
        <p className="text-center text-[10px] text-[var(--ss-text-secondary)] mt-4 max-w-2xl mx-auto leading-relaxed">
          Cookie consent is managed by Cookiebot. Essential cookies (e.g. session, security) stay enabled where
          required for login and site function; optional categories load only after you allow them.
        </p>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import NotificationBell from "@/components/notifications/NotificationBell";

const NAV_GROUPS = [
  {
    label: "Lookup",
    links: [
      { href: "/tools/ip-lookup", label: "IP Reputation" },
      { href: "/tools/geo-lookup", label: "Geolocation & ASN" },
      { href: "/tools/domain-lookup", label: "Domain Reputation" },
      { href: "/tools/dns-lookup", label: "DNS Lookup" },
      { href: "/tools/whois", label: "WHOIS" },
      { href: "/tools/url-analysis", label: "URL Analysis" },
    ],
  },
  {
    label: "Analysis",
    links: [
      { href: "/tools/ssl-checker", label: "SSL Certificate" },
      { href: "/tools/security-headers", label: "HTTP Headers" },
      { href: "/tools/blacklist", label: "Blacklist Check" },
      { href: "/tools/threat-score", label: "Threat Score" },
      { href: "/tools/redirect-trace", label: "Redirect Tracer" },
    ],
  },
  {
    label: "Advanced",
    links: [
      { href: "/tools/port-scanner", label: "Port Scanner" },
      { href: "/tools/subdomains", label: "Subdomain Finder" },
      { href: "/tools/email-headers", label: "Email Headers" },
      { href: "/tools/phone-lookup", label: "Phone Validator" },
      { href: "/tools/keyforge", label: "KeyForge" },
    ],
  },
];

function NavDropdown({ group, pathname }: { group: (typeof NAV_GROUPS)[0]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isGroupActive = group.links.some((l) => pathname === l.href);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          isGroupActive
            ? "text-cyan-400 bg-cyan-400/10"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {group.label}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1.5 w-48 rounded-xl border border-[#1e2d4a] bg-[#0b0f1a]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-1 z-50"
        >
          {group.links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-cyan-400 bg-cyan-400/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();

  async function handleLogout() {
    await logout();
    toast("Signed out.", "info");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f1a]/80 backdrop-blur-xl border-b border-[#1e2d4a] shadow-[0_1px_0_rgba(6,182,212,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-shadow group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-100 tracking-tight">SecureScope</span>
          </Link>

          {/* Desktop nav — grouped dropdowns */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            <Link
              href="/"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                pathname === "/"
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              Scanner
            </Link>
            {NAV_GROUPS.map((group) => (
              <NavDropdown key={group.label} group={group} pathname={pathname} />
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                pathname === "/settings"
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Settings
            </Link>

            {/* Notification bell — only shown when logged in */}
            {!loading && user && <NotificationBell />}

            {/* Auth buttons */}
            {!loading && (
              user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      pathname.startsWith("/dashboard")
                        ? "text-cyan-400 bg-cyan-400/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                    </svg>
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                  >
                    Get started
                  </Link>
                </div>
              )
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#1e2d4a] bg-[#0b0f1a]/95 px-4 pb-4 pt-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-1 ${
              pathname === "/" ? "text-cyan-400 bg-cyan-400/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Scanner
          </Link>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mt-3">
              <p className="px-3 py-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {group.label}
              </p>
              <nav className="flex flex-col gap-0.5">
                {group.links.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        active ? "text-cyan-400 bg-cyan-400/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-[#1e2d4a] flex flex-col gap-1">
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === "/settings" ? "text-cyan-400 bg-cyan-400/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              Settings
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => { void handleLogout(); setMobileOpen(false); }}
                  className="text-left block px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-lg bg-cyan-600/20 text-cyan-400 transition-colors"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


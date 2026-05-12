"use client";

// =============================================================================
// Header
// -----------------------------------------------------------------------------
// Sticky navigation: compact primary links, mega menu for all tool categories,
// global search (⌘/Ctrl+K), mobile drawer, and account utilities.
// =============================================================================

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useTheme } from "@/lib/theme-context";
import { useDailyScans, FREE_DAILY_LIMIT } from "@/lib/use-daily-scans";
import MegaMenu from "@/app/components/nav/MegaMenu";
import MobileNav, { PRIMARY_MOBILE_NAV_ID } from "@/app/components/nav/MobileNav";
import SearchModal, { GLOBAL_SEARCH_DIALOG_ID, useSearchHotkey } from "@/app/components/search/SearchModal";
import SearchHotkeyText from "@/app/components/SearchHotkeyText";
import { TOP_BAR_LINKS } from "@/app/components/nav/nav-data";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const mobileOpenRef = useRef(mobileOpen);
  const toolsMenuOpenRef = useRef(toolsMenuOpen);
  mobileOpenRef.current = mobileOpen;
  toolsMenuOpenRef.current = toolsMenuOpen;
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const { theme, toggle: toggleTheme } = useTheme();
  const { scansToday } = useDailyScans(user?.plan ?? null);

  const handleToolsOpenChange = useCallback((next: boolean) => {
    setToolsMenuOpen(next);
    if (next) {
      setSearchOpen(false);
      setMobileOpen(false);
    }
  }, []);

  const toggleSearch = useCallback(() => {
    setSearchOpen((wasOpen) => {
      if (wasOpen) return false;
      setToolsMenuOpen(false);
      setMobileOpen(false);
      return true;
    });
  }, []);

  const openSearchFromMobile = useCallback(() => {
    setToolsMenuOpen(false);
    setMobileOpen(false);
    setSearchOpen(true);
  }, []);

  useSearchHotkey(toggleSearch, true);

  const isToolsActive = useMemo(() => {
    if (pathname.startsWith("/tools")) return true;
    if (pathname.startsWith("/resources")) return true;
    if (pathname.startsWith("/projects")) return true;
    if (pathname.startsWith("/dashboard")) return true;
    if (pathname.endsWith("-tools")) return true;
    if (pathname === "/marketing-tools") return true;
    if (pathname === "/web-tools") return true;
    if (pathname === "/it-admin-tools" || pathname === "/m365-tools" || pathname === "/cyber-tools") return true;
    if (pathname === "/domain-ip-tools" || pathname === "/lead-tools" || pathname === "/business-tools") return true;
    if (pathname === "/reporting-tools" || pathname === "/coding-tools") return true;
    if (pathname === "/automation-tools") return true;
    return false;
  }, [pathname]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024 && mobileOpenRef.current) setMobileOpen(false);
      if (window.innerWidth < 1024 && toolsMenuOpenRef.current) setToolsMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await logout();
    toast("Signed out.", "info");
    router.push("/");
  }

  function topLinkClass(href: string, active?: boolean) {
    const isActive =
      active ??
      (href === "/"
        ? pathname === "/"
        : href === "/dashboard"
          ? pathname.startsWith("/dashboard")
          : href === "/automation-tools"
            ? pathname === "/automation-tools" || pathname.startsWith("/tools/automation")
            : pathname === href);
    return `ss-pill px-3 py-1.5 text-xs font-semibold ${
      isActive
        ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)]"
        : "text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
    }`;
  }

  return (
    <header className="sticky top-0 z-[60] glass-surface border-b border-[var(--ss-border)] shadow-[0_1px_0_color-mix(in_srgb,var(--ss-text)_6%,transparent)]">
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 min-w-0 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-[var(--ss-accent)] to-[var(--accent-blue)] shadow-[0_12px_30px_rgba(56,189,248,0.22)] transition-shadow group-hover:shadow-[0_16px_40px_rgba(56,189,248,0.3)]">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-semibold text-[var(--ss-text)] tracking-tight truncate">
              SecureScope
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center min-w-0" aria-label="Main navigation">
            {TOP_BAR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={topLinkClass(link.href)}
                aria-current={
                  link.href === "/"
                    ? pathname === "/"
                      ? "page"
                      : undefined
                    : link.href === "/dashboard"
                      ? pathname.startsWith("/dashboard")
                        ? "page"
                        : undefined
                      : link.href === "/automation-tools"
                        ? pathname === "/automation-tools" || pathname.startsWith("/tools/automation")
                          ? "page"
                          : undefined
                        : pathname === link.href
                          ? "page"
                          : undefined
                }
              >
                {link.label}
              </Link>
            ))}
            <div className={`flex items-center ml-1 rounded-full ${isToolsActive ? "bg-[var(--ss-accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_30%,transparent)]" : ""}`}>
              <MegaMenu label="Tools" open={toolsMenuOpen} onOpenChange={handleToolsOpenChange} />
            </div>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={toggleSearch}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] hover:border-[color-mix(in_srgb,var(--ss-accent)_40%,transparent)] hover:bg-[var(--ss-accent-soft)] motion-safe:transition-[color,background-color,border-color,transform] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 ${
                pathname === "/search" ? "border-[color-mix(in_srgb,var(--ss-accent)_45%,transparent)] bg-[var(--ss-accent-soft)] text-[var(--ss-text)]" : "border-[var(--ss-border)]"
              }`}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              aria-haspopup="dialog"
              aria-controls={GLOBAL_SEARCH_DIALOG_ID}
            >
              <svg className="w-4 h-4 text-[var(--ss-accent)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.517 3.516a1 1 0 01-1.414 1.414l-3.516-3.517A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden md:inline text-xs font-medium">Search</span>
              <span className="hidden lg:inline text-[10px] text-[var(--ss-text-secondary)] font-mono border border-[var(--ss-border)] rounded-full px-1.5 py-0.5 bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)]">
                <SearchHotkeyText />
              </span>
            </button>

            <Link
              href="/settings"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                pathname === "/settings"
                  ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)]"
                  : "text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden lg:inline">Settings</span>
            </Link>

            {!loading && user && user.plan === "free" && (
              <Link
                href="/pricing"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors group"
                title={`${scansToday}/${FREE_DAILY_LIMIT} scans used today — upgrade for unlimited`}
              >
                <svg className="w-3 h-3 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-medium text-amber-300">
                  {scansToday}/{FREE_DAILY_LIMIT}
                </span>
                <span className="hidden md:flex w-12 h-1.5 rounded-full bg-amber-500/20 overflow-hidden">
                  <span
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${Math.min((scansToday / FREE_DAILY_LIMIT) * 100, 100)}%` }}
                  />
                </span>
              </Link>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-transparent text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] hover:border-[var(--ss-border)] transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {!loading && user && <NotificationBell />}

            {!loading &&
              (user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className={`ss-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${
                      pathname.startsWith("/dashboard")
                        ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)] ring-1 ring-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)]"
                        : "text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ss-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="ss-pill px-3 py-1.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Get started
                  </Link>
                </div>
              ))}

            <button
              type="button"
              onClick={() => {
                setMobileOpen((v) => {
                  const next = !v;
                  if (next) {
                    setSearchOpen(false);
                    setToolsMenuOpen(false);
                  }
                  return next;
                });
              }}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] text-[var(--ss-text)] hover:bg-[var(--ss-accent-soft)] hover:border-[color-mix(in_srgb,var(--ss-accent)_40%,transparent)] motion-safe:transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls={PRIMARY_MOBILE_NAV_ID}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

      <div className="lg:hidden">
        <MobileNav
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpenSearch={openSearchFromMobile}
          utilitySlot={
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
                pathname === "/settings"
                  ? "text-[var(--ss-accent)] bg-[var(--ss-accent-soft)]"
                  : "text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]"
              }`}
            >
              Settings
            </Link>
          }
          authSlot={
            !loading ? (
              user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold rounded-xl text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void handleLogout();
                      setMobileOpen(false);
                    }}
                    className="text-left block px-3 py-2 text-sm font-semibold rounded-xl text-[var(--ss-text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold rounded-xl text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold rounded-xl ss-pill-primary text-center text-white"
                  >
                    Get started free
                  </Link>
                </>
              )
            ) : null
          }
        />
      </div>
    </header>
  );
}

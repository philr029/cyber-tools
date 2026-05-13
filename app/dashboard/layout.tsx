"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import { roleMeetsMinimum, type UserRole } from "@/lib/auth/user-role";
import { withBasePath } from "@/lib/base-path";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  /** Minimum role required to see the link (viewer < editor < admin). */
  minRole: UserRole;
};

const NAV: NavItem[] = [
  {
    href: "/account",
    label: "Account",
    minRole: "viewer",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Overview",
    minRole: "viewer",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/monitoring",
    label: "Monitoring",
    minRole: "viewer",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/cases",
    label: "Cases",
    minRole: "viewer",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M2 4.75C2 3.784 2.784 3 3.75 3h4.836c.464 0 .909.184 1.237.513l1.414 1.414c.329.328.773.512 1.237.512H16.25c.966 0 1.75.784 1.75 1.75v8.75A1.75 1.75 0 0116.25 17H3.75A1.75 1.75 0 012 15.25V4.75z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/alerts",
    label: "Alerts",
    minRole: "viewer",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/playbooks",
    label: "Playbooks",
    minRole: "viewer",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M3.25 3A2.25 2.25 0 001 5.25v9.5A2.25 2.25 0 003.25 17h9.5A2.25 2.25 0 0015 14.75v-9.5A2.25 2.25 0 0012.75 3h-9.5z" />
        <path
          fillRule="evenodd"
          d="M16.28 3.22a.75.75 0 010 1.06l-1.5 1.5a.75.75 0 01-1.06-1.06l1.5-1.5a.75.75 0 011.06 0zM14 11a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0114 11zM14.28 7.53a.75.75 0 00-1.06-1.06l-1.5 1.5a.75.75 0 001.06 1.06l1.5-1.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    minRole: "editor",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0-6a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/history",
    label: "Scan History",
    minRole: "viewer",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/saved",
    label: "Saved Scans",
    minRole: "editor",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/vault",
    label: "Encrypted vault",
    minRole: "editor",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 3l7 3v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/activity",
    label: "Activity Log",
    minRole: "viewer",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

const ADMIN_NAV: NavItem[] = [
  {
    href: "/dashboard/admin/users",
    label: "Users",
    minRole: "admin",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 6a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 17a4 4 0 014-4h2a4 4 0 014 4v1H3v-1zM14 8.5a2 2 0 100-4 2 2 0 000 4zM16 17h-3v-1a3 3 0 013-3h1v4z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/admin/security-log",
    label: "Security log",
    minRole: "admin",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4h14v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm4 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

function RoleDeniedBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const denied = searchParams.get("denied");
  if (denied !== "role") return null;
  return (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <span>You don&apos;t have access to that area. Editors and admins can open API-heavy tools, saved reports, and the encrypted vault.</span>
      <button
        type="button"
        onClick={() => router.replace(withBasePath("/dashboard"))}
        className="shrink-0 text-xs font-medium text-amber-200 underline underline-offset-2"
      >
        Dismiss
      </button>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();

  const role = user?.role ?? "viewer";

  const visibleNav = useMemo(
    () => NAV.filter((item) => roleMeetsMinimum(role, item.minRole)),
    [role],
  );
  const visibleAdminNav = useMemo(
    () => ADMIN_NAV.filter((item) => roleMeetsMinimum(role, item.minRole)),
    [role],
  );

  async function handleLogout() {
    await logout();
    toast("Signed out successfully.", "info");
    router.refresh();
    router.push(withBasePath("/"));
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[#1e2d4a] bg-[#0d1321] px-3 py-4">
        <div className="mb-3">
          <WorkspaceSwitcher />
        </div>

        <div className="px-3 py-2.5 mb-4 rounded-xl bg-[#131929] border border-[#1e2d4a]">
          <p className="text-sm font-medium text-slate-200 truncate">{user?.name ?? "—"}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email ?? "—"}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                user?.plan === "pro" ? "bg-amber-500/15 text-amber-400" : "bg-slate-700/60 text-slate-400"
              }`}
            >
              {user?.plan === "pro" ? "Pro" : "Free"}
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-300 capitalize">
              {user?.role ?? "—"}
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
          {visibleNav.map(({ href, label, icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : href === "/account"
                  ? pathname === "/account" || pathname.startsWith("/account/")
                  : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {icon}
                {label}
              </Link>
            );
          })}
          {visibleAdminNav.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-[#1e2d4a]">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Administration</p>
              {visibleAdminNav.map(({ href, label, icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-purple-500/10 text-purple-300"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {icon}
                    {label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </nav>

        <div className="mt-4 pt-4 border-t border-[#1e2d4a] flex flex-col gap-1">
          <Link
            href="/settings"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith("/settings")
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Settings
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clipRule="evenodd"
              />
            </svg>
            Back to Tools
          </Link>
          <Link
            href="/enterprise"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === "/enterprise"
                ? "text-purple-400 bg-purple-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                clipRule="evenodd"
              />
            </svg>
            Enterprise Demo
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors text-left w-full"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.115l-2.5 2.5a.75.75 0 000 1.09l2.5 2.5a.75.75 0 101.004-1.114L8.704 10.75H18.25A.75.75 0 0019 10z"
                clipRule="evenodd"
              />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={null}>
          <RoleDeniedBanner />
        </Suspense>
        {children}
      </main>
    </div>
  );
}

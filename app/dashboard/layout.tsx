"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import type { ReactNode } from "react";

const NAV: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/monitoring",
    label: "Monitoring",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/cases",
    label: "Cases",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M2 4.75C2 3.784 2.784 3 3.75 3h4.836c.464 0 .909.184 1.237.513l1.414 1.414c.329.328.773.512 1.237.512H16.25c.966 0 1.75.784 1.75 1.75v8.75A1.75 1.75 0 0116.25 17H3.75A1.75 1.75 0 012 15.25V4.75z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/alerts",
    label: "Alerts",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/playbooks",
    label: "Playbooks",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M3.25 3A2.25 2.25 0 001 5.25v9.5A2.25 2.25 0 003.25 17h9.5A2.25 2.25 0 0015 14.75v-9.5A2.25 2.25 0 0012.75 3h-9.5z" />
        <path fillRule="evenodd" d="M16.28 3.22a.75.75 0 010 1.06l-1.5 1.5a.75.75 0 01-1.06-1.06l1.5-1.5a.75.75 0 011.06 0zM14 11a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0114 11zM14.28 7.53a.75.75 0 00-1.06-1.06l-1.5 1.5a.75.75 0 001.06 1.06l1.5-1.5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0-6a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/history",
    label: "Scan History",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/saved",
    label: "Saved Scans",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/activity",
    label: "Activity Log",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();

  async function handleLogout() {
    await logout();
    toast("Signed out successfully.", "info");
    router.push("/");
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
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[#1e2d4a] bg-[#0d1321] px-3 py-4">
        {/* Workspace switcher */}
        <div className="mb-3">
          <WorkspaceSwitcher />
        </div>

        {/* User card */}
        <div className="px-3 py-2.5 mb-4 rounded-xl bg-[#131929] border border-[#1e2d4a]">
          <p className="text-sm font-medium text-slate-200 truncate">{user?.name ?? "—"}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email ?? "—"}</p>
          <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-xs font-medium ${user?.plan === "pro" ? "bg-amber-500/15 text-amber-400" : "bg-slate-700/60 text-slate-400"}`}>
            {user?.plan === "pro" ? "Pro" : "Free"}
          </span>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
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
        </nav>

        <div className="mt-4 pt-4 border-t border-[#1e2d4a] flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
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
              <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
            </svg>
            Enterprise Demo
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors text-left w-full"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.08a.75.75 0 10-1.004-1.115l-2.5 2.5a.75.75 0 000 1.09l2.5 2.5a.75.75 0 101.004-1.114L8.704 10.75H18.25A.75.75 0 0019 10z" clipRule="evenodd" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projects – SecureScope",
  description: "Curated entry points across security, automation, and marketing workflows.",
};

const PROJECTS = [
  {
    title: "External attack surface review",
    description: "Domain reputation, DNS, SSL, headers and phishing heuristics in one pass.",
    href: "/tools",
  },
  {
    title: "Automation & monitoring",
    description: "Server-side checks for uptime, forms, DNS and phone paths.",
    href: "/tools/automated-monitoring",
  },
  {
    title: "Marketing launch pack",
    description: "UTMs, meta previews, broken links and live copy generators.",
    href: "/marketing-tools",
  },
  {
    title: "M365 admin hardening",
    description: "MFA, Conditional Access, Defender and Intune readiness helpers.",
    href: "/m365-tools",
  },
  {
    title: "Lead & form quality",
    description: "Phone validation, lead intelligence, and structured form QA.",
    href: "/lead-tools",
  },
  {
    title: "Workspace dashboards",
    description: "Saved scans, alerts, monitoring and reports after you sign in.",
    href: "/dashboard",
  },
];

export default function ProjectsPage() {
  return (
    <main className="flex-1 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100">Projects</h1>
        <p className="text-slate-400 mt-3 max-w-2xl leading-relaxed">
          Jump into common bundles of tools without hunting through the full catalogue. Each card opens a working hub
          or composite flow inside SecureScope.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {PROJECTS.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="flex h-full flex-col rounded-2xl border border-[#1e2d4a] bg-[#0d1321] p-5 transition-colors hover:border-cyan-500/35 hover:bg-[#0f1629]"
              >
                <h2 className="text-lg font-semibold text-slate-100">{p.title}</h2>
                <p className="mt-2 text-sm text-slate-400 flex-1 leading-relaxed">{p.description}</p>
                <span className="mt-4 text-sm font-medium text-cyan-400">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

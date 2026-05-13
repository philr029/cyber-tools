import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About – SecureScope",
  description: "Learn about the SecureScope cyber intelligence platform.",
};

const TECH = [
  { name: "Next.js 16", desc: "App Router, Server Actions, Proxy (middleware) for auth" },
  { name: "TypeScript", desc: "End-to-end type safety across API routes and components" },
  { name: "Tailwind CSS v4", desc: "Utility-first styling with dark-mode-first design" },
  { name: "Supabase Auth", desc: "Email/password identity, PKCE email links, HttpOnly cookie sessions (@supabase/ssr)" },
  { name: "AbuseIPDB", desc: "IP reputation and abuse reports API" },
  { name: "VirusTotal", desc: "Multi-engine malware and domain reputation scanning" },
  { name: "SecurityTrails", desc: "DNS history and subdomain enumeration" },
  { name: "Shodan", desc: "Open port scanning and service fingerprinting" },
  { name: "Gemini AI", desc: "Contextual AI chat for guided threat analysis" },
];

const SECURITY_DECISIONS = [
  {
    title: "SSRF prevention",
    detail:
      "All outbound fetch requests pass through lib/ssrf.ts, which blocks requests to RFC 1918 private ranges, loopback addresses, and cloud metadata endpoints (169.254.169.254).",
  },
  {
    title: "Session security",
    detail:
      "Authentication uses Supabase Auth with server-verified cookies (@supabase/ssr). Middleware calls getClaims() to validate the JWT before trusting identity. Only the public anon key is exposed to the browser — never the service role key.",
  },
  {
    title: "Password hashing",
    detail:
      "Passwords are handled by Supabase Auth (hosted bcrypt/argon workflows). Application roles and profile fields live in Postgres under Row Level Security (see supabase/migrations).",
  },
  {
    title: "Input validation",
    detail:
      "All API inputs are validated server-side before processing. Email format, password length, and query type validation are enforced in route handlers.",
  },
  {
    title: "API key isolation",
    detail:
      "All API integrations live in lib/providers/ and run server-side only. Keys are never included in client bundles. Provider functions return null when no key is configured.",
  },
  {
    title: "Rate limiting (planned)",
    detail:
      "Per-user scan rate limiting is tracked server-side. Free tier is limited to 10 scans/day. Production deployment would use Vercel KV or a database counter.",
  },
];

const ROADMAP = [
  "Real database backend (Prisma + Postgres or Vercel KV)",
  "Stripe integration for Pro billing",
  "Webhook notifications for alert events",
  "Team workspaces and role-based access",
  "Report export (PDF/CSV)",
  "API access for programmatic scanning",
  "MITRE ATT&CK framework mapping",
  "Threat intelligence feed integration",
];

export default function AboutPage() {
  return (
    <main className="flex-1 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mb-5">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-100">About SecureScope</h1>
          <p className="text-slate-400 mt-3 max-w-xl">
            A full-stack cyber intelligence platform built to demonstrate production-grade SaaS
            architecture, security best practices, and modern web development with Next.js.
          </p>
        </div>

        {/* Why built */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-100 mb-3">Why I built this</h2>
          <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 text-sm text-slate-300 leading-relaxed space-y-3">
            <p>
              Security tooling is often fragmented — you need five different browser tabs to check
              an IP&apos;s reputation, verify an SSL certificate, scan for open ports, and analyse
              HTTP security headers. SecureScope consolidates these workflows into a single, fast,
              clean interface.
            </p>
            <p>
              I also wanted to show what a production-ready Next.js SaaS looks like end-to-end:
              proper auth with cookie-based JWT sessions, protected routes via the new
              <code className="mx-1 px-1 py-0.5 rounded bg-white/5 text-cyan-300 font-mono text-xs">proxy.ts</code>
              convention, server-side API proxying to protect keys, and a responsive dashboard
              that&apos;s actually useful.
            </p>
          </div>
        </section>

        {/* Technologies */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-100 mb-3">Technologies used</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {TECH.map(({ name, desc }) => (
              <div key={name} className="rounded-xl bg-[#0d1321] border border-[#1e2d4a] p-3.5">
                <p className="text-sm font-medium text-slate-200">{name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security decisions */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-100 mb-3">Security decisions</h2>
          <div className="space-y-2">
            {SECURITY_DECISIONS.map(({ title, detail }) => (
              <div key={title} className="rounded-xl bg-[#0d1321] border border-[#1e2d4a] p-3.5">
                <p className="text-sm font-medium text-emerald-400 mb-1">{title}</p>
                <p className="text-xs text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-100 mb-3">Future roadmap</h2>
          <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
            <ul className="grid sm:grid-cols-2 gap-2">
              {ROADMAP.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                  <svg className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
          >
            Try the tools
          </Link>
          <Link
            href="/pricing"
            className="px-5 py-2.5 rounded-xl border border-[#1e2d4a] text-slate-300 hover:text-slate-100 hover:bg-white/5 text-sm font-medium transition-colors"
          >
            View pricing
          </Link>
          <a
            href="https://github.com/philr029/cyber-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl border border-[#1e2d4a] text-slate-300 hover:text-slate-100 hover:bg-white/5 text-sm font-medium transition-colors"
          >
            GitHub →
          </a>
        </div>
      </div>
    </main>
  );
}

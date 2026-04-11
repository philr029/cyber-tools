import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing – SecureScope",
  description: "Simple, transparent pricing for individuals and security teams.",
};

const FREE_FEATURES = [
  "10 scans per day",
  "IP reputation checks",
  "Domain reputation lookup",
  "SSL certificate checker",
  "Security headers analysis",
  "Blacklist checks",
  "DNS lookup",
  "Scan history (20 entries)",
];

const PRO_FEATURES = [
  "Unlimited scans",
  "Everything in Free",
  "Save unlimited scans",
  "Domain & IP monitoring",
  "Email alerts on changes",
  "Blacklist change detection",
  "SSL expiry alerts",
  "Risk score tracking",
  "Priority support",
];

export default function PricingPage() {
  return (
    <main className="flex-1 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-100">Simple, transparent pricing</h1>
          <p className="text-slate-400 mt-3 max-w-md mx-auto">
            Start for free. Upgrade when you need continuous monitoring and alerts.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-6 flex flex-col">
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-100">$0</span>
                <span className="text-slate-400 text-sm pb-1">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Perfect for individuals and occasional checks.</p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block text-center py-2.5 px-4 rounded-xl border border-[#1e2d4a] text-slate-300 hover:text-slate-100 hover:bg-white/5 text-sm font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl bg-gradient-to-b from-cyan-950/60 to-[#0d1321] border border-cyan-500/30 p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1.5 bg-cyan-600 text-white text-xs font-medium rounded-bl-xl">
              Most popular
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Pro</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-100">$19</span>
                <span className="text-slate-400 text-sm pb-1">/month</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">For IT admins, SOC analysts, and security teams.</p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="block w-full text-center py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors cursor-not-allowed opacity-80"
              disabled
              title="Payment simulation — demo only"
            >
              Coming soon
            </button>
            <p className="text-center text-xs text-slate-600 mt-2">Demo mode — no real payments</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-slate-100 mb-6 text-center">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is this a real SaaS?",
                a: "This is a portfolio project demonstrating a full SaaS architecture with auth, dashboards, and monitoring. No real payments are processed.",
              },
              {
                q: "Where is my data stored?",
                a: "Scan history and saved scans are stored in your browser's localStorage. Nothing is sent to a database.",
              },
              {
                q: "Can I use the demo account?",
                a: "Yes — use demo@securescope.io / demo1234 to explore Pro features. The demo user's data is pre-seeded.",
              },
              {
                q: "What APIs does this use?",
                a: "AbuseIPDB, VirusTotal, SecurityTrails, Shodan, and others. Set your own API keys in settings for real data.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl bg-[#0d1321] border border-[#1e2d4a] p-4">
                <p className="text-sm font-medium text-slate-200 mb-1.5">{q}</p>
                <p className="text-sm text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

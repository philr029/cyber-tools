import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enterprise Security Platform Demo – SecureScope",
  description:
    "See how SecureScope powers SOC analyst workflows, IT admin monitoring, and automated incident response.",
};

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ label, title, sub }: { label: string; title: string; sub: string }) {
  return (
    <div className="text-center mb-10">
      <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-3">
        {label}
      </span>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">{title}</h2>
      <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">{sub}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature pill
// ---------------------------------------------------------------------------

function FeaturePill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131929] border border-[#1e2d4a] text-xs text-slate-300">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Use-case card
// ---------------------------------------------------------------------------

function UseCaseCard({
  icon,
  title,
  role,
  description,
  workflow,
  features,
}: {
  icon: string;
  title: string;
  role: string;
  description: string;
  workflow: string[];
  features: string[];
}) {
  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-6 hover:border-cyan-500/30 transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <span className="inline-block px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
        {role}
      </span>
      <h3 className="text-base font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">{description}</p>

      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Workflow</p>
        <ol className="space-y-1.5">
          {workflow.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="w-4 h-4 rounded-full bg-[#1e2d4a] text-slate-500 text-[9px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {features.map((f) => (
          <FeaturePill key={f} text={f} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EnterprisePage() {
  return (
    <div className="bg-[#0b0f1a] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1e2d4a] py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Enterprise Security Platform Demo
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 leading-tight mb-5">
            From Threat Intel to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Resolved Incident
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            SecureScope combines real-time threat intelligence, case management, and automation
            into a single platform — so your security team can investigate faster, collaborate
            better, and respond before damage occurs.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
              </svg>
              Open Dashboard
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#131929] border border-[#1e2d4a] hover:border-cyan-500/30 text-slate-200 font-semibold text-sm transition-colors"
            >
              Try the Scanner
            </Link>
          </div>
        </div>
      </section>

      {/* Platform capabilities */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            label="Platform Overview"
            title="Everything a Security Team Needs"
            sub="Built around real SOC workflows — from initial alert to final resolution — with full audit trail and team collaboration."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🧠", title: "Multi-Workspace", desc: "Separate workspaces for each client, team, or environment. Role-based access keeps data segmented." },
              { icon: "📁", title: "Case Management", desc: "Kanban-style cases with severity, status, notes, and scan attachments. Full incident lifecycle tracking." },
              { icon: "⚡", title: "Playbook Automation", desc: "Trigger-action rules that auto-create cases, fire webhooks, or send notifications when threats are detected." },
              { icon: "📡", title: "Live Monitoring", desc: "Real-time dashboard with risk distribution charts, activity feed, and asset health status." },
              { icon: "🔔", title: "Notifications", desc: "In-app notification centre for alerts, case changes, playbook triggers, and team activity." },
              { icon: "📊", title: "Reports &amp; Export", desc: "One-click PDF and JSON reports for scan history, cases, and security posture — ready for stakeholders." },
              { icon: "🤖", title: "AI Security Assistant", desc: "Gemini-powered chat assistant that explains scans, assesses risk, and recommends next actions." },
              { icon: "🔐", title: "Role-Based Access", desc: "Owner, Admin, and Viewer roles per workspace. Invite via email with appropriate permissions." },
              { icon: "🧪", title: "API Integration", desc: "Public API endpoints for external scan triggering. Webhook support for Slack, Teams, and SIEM tools." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 hover:border-cyan-500/20 transition-colors">
                <span className="text-2xl block mb-2">{item.icon}</span>
                <p className="text-sm font-semibold text-slate-200 mb-1">{item.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-world use cases */}
      <section className="py-16 px-4 border-t border-[#1e2d4a]">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            label="Real-World Use Cases"
            title="Built for How Security Teams Actually Work"
            sub="Three personas, three workflows — all supported out of the box."
          />

          <div className="grid md:grid-cols-3 gap-5">
            <UseCaseCard
              icon="🔍"
              title="SOC Analyst Workflow"
              role="SOC Analyst"
              description="Triage incoming alerts, investigate suspicious IPs and domains, escalate confirmed threats into cases, and close the loop with resolution notes — all within a single platform."
              workflow={[
                "Alert fires for blacklisted IP",
                "Playbook auto-creates investigation case",
                "Analyst runs full IP/domain scan",
                "AI assistant explains findings",
                "Case updated with scan attachment + note",
                "Case resolved and documented",
              ]}
              features={["Live Monitoring", "Case Management", "AI Assistant", "Playbooks", "Activity Log"]}
            />
            <UseCaseCard
              icon="🖥️"
              title="IT Admin Monitoring"
              role="IT Administrator"
              description="Track the security posture of internal infrastructure. Monitor SSL certificate expiry, open ports, security headers, and blacklist status for all company-managed assets."
              workflow={[
                "Add assets to monitoring list",
                "Playbook fires on SSL expiry (7d)",
                "Notification sent to admin",
                "Admin runs SSL + headers scan",
                "Case opened for remediation",
                "Export posture report for management",
              ]}
              features={["Asset Monitoring", "SSL Checker", "Playbooks", "Reports", "Notifications"]}
            />
            <UseCaseCard
              icon="🚨"
              title="Incident Response"
              role="IR Lead"
              description="Coordinate response across teams using shared workspaces. Maintain a detailed audit trail of every action taken. Export full incident report for post-mortem and compliance."
              workflow={[
                "Incident detected via scan or alert",
                "High-severity case created",
                "Team members assigned via workspace",
                "Investigation notes added in real-time",
                "Playbook fires Teams webhook to IR channel",
                "Resolved case exported as PDF for compliance",
              ]}
              features={["Workspaces", "Cases", "Team Collaboration", "Webhooks", "PDF Export", "Activity Log"]}
            />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 px-4 border-t border-[#1e2d4a] bg-[#0d1321]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "15+", label: "Security Tools" },
              { value: "3", label: "Workspace Roles" },
              { value: "5", label: "Playbook Actions" },
              { value: "∞", label: "Cases & Scans" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-cyan-400">{value}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-4 border-t border-[#1e2d4a]">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            label="Architecture"
            title="Built to Scale"
            sub="Production-grade technology stack designed for security-critical applications."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Next.js 16 App Router", detail: "Server-side rendering, API routes as serverless functions, streaming support." },
              { name: "TypeScript", detail: "End-to-end type safety across API routes, data models, and UI components." },
              { name: "Tailwind CSS v4", detail: "Utility-first styling with a consistent dark-mode design system." },
              { name: "Gemini AI", detail: "Google Gemini powers the security assistant for real-time threat analysis and recommendations." },
              { name: "RBAC", detail: "Role-based access control with Owner / Admin / Viewer hierarchy per workspace." },
              { name: "Input Validation", detail: "All user inputs validated and sanitised server-side. SSRF protection on outbound requests." },
              { name: "Vercel Deployment", detail: "Zero-config deployment with automatic HTTPS, edge caching, and serverless scaling." },
              { name: "Real API Integrations", detail: "AbuseIPDB, VirusTotal, Shodan, SecurityTrails, RDAP — all live when keys are configured." },
            ].map(({ name, detail }) => (
              <div key={name} className="rounded-xl bg-[#0d1321] border border-[#1e2d4a] p-4">
                <p className="text-xs font-semibold text-slate-200 mb-1">{name}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-[#1e2d4a] text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Start Exploring the Platform</h2>
          <p className="text-slate-400 text-sm mb-6">
            Sign up for free and experience the full enterprise workflow — no setup required.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors"
            >
              Get started free
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-[#131929] border border-[#1e2d4a] hover:border-cyan-500/30 text-slate-200 font-semibold text-sm transition-colors"
            >
              View dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

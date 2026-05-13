"use client";

import { useState } from "react";
import type { FormId } from "@/lib/messaging/types";
import PlatformForm from "@/components/messaging/PlatformForm";

const BLOCKS: { id: FormId; title: string; note: string }[] = [
  { id: "contact", title: "Contact", note: "General enquiries — forwards to FORM_WEBHOOK_URL when set." },
  { id: "request-access", title: "Request access", note: "Pilot / demo / role requests (no credentials)." },
  { id: "newsletter", title: "Newsletter / product updates", note: "Requires Cookiebot marketing consent." },
  { id: "tool-suggestion", title: "Tool suggestion", note: "Structured idea intake for the catalog." },
  { id: "tool-feedback", title: "Tool feedback", note: "Quality and UX notes for existing tools." },
  { id: "bug-report", title: "Bug report", note: "Repro-first; never paste secrets or API keys." },
  { id: "feature-request", title: "Feature request", note: "Broader roadmap asks." },
  { id: "it-support-request", title: "IT support request", note: "Desk-style triage template." },
  { id: "marketing-campaign-request", title: "Marketing campaign request", note: "Launch brief scaffold." },
  { id: "website-test", title: "Website test request", note: "Scope for QA / monitoring passes." },
  { id: "phone-test", title: "Phone test request", note: "Lines, IVR, and windows — minimal PII." },
  { id: "domain-test", title: "Domain / DNS test request", note: "Public domains only." },
  { id: "security-check", title: "Security check request", note: "Scoped review without credentials in-form." },
  { id: "lead-check", title: "Lead check request", note: "Structured review requests." },
];

export default function FormsCentreClient() {
  const [active, setActive] = useState<FormId>("contact");

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-14 animate-page-enter">
      <h1 className="text-3xl font-semibold text-[var(--ss-text)] tracking-tight">Forms centre</h1>
      <p className="mt-2 text-sm text-[var(--ss-text-secondary)] leading-relaxed">
        Submissions POST to <code className="text-xs font-mono">/api/platform-forms</code> (sanitised + rate limited) and mirror into{" "}
        <strong className="text-[var(--ss-text)]">localStorage</strong> archives per form. Integrate later with Resend, Microsoft Graph,
        Notion, Airtable, Supabase edge functions, Vercel/Netlify handlers — server-side only.
      </p>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <nav className="lg:w-56 shrink-0 rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_92%,transparent)] p-2 max-h-[480px] overflow-y-auto">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ss-text-secondary)]">Choose form</p>
          <ul className="space-y-0.5">
            {BLOCKS.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setActive(b.id)}
                  className={`w-full text-left rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
                    active === b.id
                      ? "bg-[var(--ss-accent-soft)] text-[var(--ss-accent)]"
                      : "text-[var(--ss-text-secondary)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] hover:text-[var(--ss-text)]"
                  }`}
                >
                  {b.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1 min-w-0 rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_94%,transparent)] p-5 sm:p-6">
          {(() => {
            const b = BLOCKS.find((x) => x.id === active)!;
            return (
              <div key={b.id}>
                <h2 className="text-lg font-semibold text-[var(--ss-text)]">{b.title}</h2>
                <p className="mt-1 text-sm text-[var(--ss-text-secondary)]">{b.note}</p>
                <div className="mt-6">
                  <PlatformForm formId={b.id} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </main>
  );
}

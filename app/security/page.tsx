"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

type CheckState = "ok" | "warn" | "info";

function CheckRow({
  state,
  title,
  body,
}: {
  state: CheckState;
  title: string;
  body: string;
}) {
  const ring =
    state === "ok"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : state === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
        : "border-cyan-500/30 bg-cyan-500/5 text-cyan-200";
  const dot =
    state === "ok" ? "bg-emerald-400" : state === "warn" ? "bg-amber-400" : "bg-cyan-400";
  return (
    <div className={`rounded-xl border px-4 py-3 ${ring}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <main className="flex-1 py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3l7 3v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Security checklist</h1>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
            SecureScope keeps provider API keys on the server. This page summarises deployment hygiene, browser
            storage, headers, and optional <strong className="text-slate-300">client-side encryption</strong> for local
            scan history. It does <strong className="text-slate-300">not</strong> describe full-site end-to-end
            encryption unless every data path is separately protected.
          </p>
          <p className="text-xs text-slate-500">
            Operator-focused detail: see the repository{" "}
            <code className="text-cyan-300/90">SECURITY.md</code> file (same folder as <code className="text-cyan-300/90">README.md</code>
            ).
          </p>
        </header>

        <section className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">Encrypted scan history</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Passphrase-based vault controls live under the signed-in dashboard (editors and admins) at{" "}
            <strong className="text-slate-300">Encrypted vault</strong>. Sign in with an account that has the editor role
            or higher, then open the vault from the dashboard sidebar.
          </p>
          <Link
            href={withBasePath("/login?redirect=/dashboard/vault")}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-4 py-2.5 transition-colors"
          >
            Sign in to manage encryption
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200">Deployment & transport</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckRow
              state="ok"
              title="HTTPS"
              body="Deploy behind HTTPS (default on Vercel). HSTS is enabled for production builds via next.config.ts."
            />
            <CheckRow
              state="ok"
              title="API secrets"
              body="Keys are read from server environment variables only — never prefix secrets with NEXT_PUBLIC_. Use .env.example as a template."
            />
            <CheckRow
              state="info"
              title="Session cookies"
              body="Authentication uses Supabase Auth with HttpOnly cookies via @supabase/ssr. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY — never expose the service role key to the browser."
            />
            <CheckRow
              state="info"
              title="CSP & frame protection"
              body="Baseline headers include X-Frame-Options and Referrer-Policy. A stricter nonce CSP can be applied via proxy.ts when wired as middleware — see SECURITY.md."
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200">Forms, XSS, and errors</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckRow
              state="ok"
              title="Input handling"
              body="Auth and lookup flows use shared sanitisation helpers; prefer React text nodes over dangerouslySetInnerHTML for user-derived content."
            />
            <CheckRow
              state="info"
              title="Safe error messages"
              body="API routes should return generic errors in production; detailed diagnostics belong in server logs only."
            />
            <CheckRow
              state="ok"
              title="External links"
              body="Links that open in a new tab should use rel=&quot;noopener noreferrer&quot; to avoid tab-nabbing."
            />
            <CheckRow
              state="warn"
              title="Client-side encryption limits"
              body="Passphrase-derived keys live in memory while unlocked. Malware or XSS in the page can still read data after unlock — this feature protects stored-at-rest history on the device, not a compromised renderer."
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200">API protection (recommendations)</h2>
          <ul className="list-disc pl-5 text-sm text-slate-400 space-y-2">
            <li>Keep provider keys in serverless / Node only; never echo keys or raw upstream errors to the browser in production.</li>
            <li>Add per-IP or per-user rate limits on AI and lookup routes (Redis, KV, or edge middleware).</li>
            <li>Use CAPTCHA or managed bot protection if anonymous abuse appears.</li>
            <li>Return minimal JSON on failure — enough for the UI, not stack traces.</li>
          </ul>
        </section>

        <p className="text-center text-sm text-slate-500">
          <Link href={withBasePath("/")} className="text-cyan-400 hover:text-cyan-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

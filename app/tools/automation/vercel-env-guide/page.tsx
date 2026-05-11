"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

interface EnvVar {
  id: string;
  key: string;
  scope: "production" | "preview" | "development" | "all";
  notes: string;
}

const DEFAULT: EnvVar[] = [
  { id: "e1", key: "SESSION_SECRET", scope: "all", notes: "32+ char random string for signing session JWTs." },
  { id: "e2", key: "ABUSEIPDB_API_KEY", scope: "production", notes: "Server-side only. IP reputation lookups." },
  { id: "e3", key: "VIRUSTOTAL_API_KEY", scope: "production", notes: "Server-side only. Domain / URL reputation." },
  { id: "e4", key: "SECURITYTRAILS_API_KEY", scope: "production", notes: "DNS history & subdomain enumeration." },
  { id: "e5", key: "GEMINI_API_KEY", scope: "production", notes: "AI assistant. Keep outside client bundle." },
];

export default function VercelEnvGuidePage() {
  const [vars, setVars] = useState<EnvVar[]>(DEFAULT);

  const envFile = useMemo(() => {
    const lines = ["# .env.local — never commit", ""];
    for (const v of vars) {
      lines.push(`# ${v.notes}`);
      lines.push(`${v.key}=`);
      lines.push("");
    }
    return lines.join("\n");
  }, [vars]);

  const cli = useMemo(() => {
    return vars
      .map((v) => `vercel env add ${v.key} ${v.scope === "all" ? "production preview development" : v.scope}`)
      .join("\n");
  }, [vars]);

  function update(i: number, field: keyof EnvVar, value: string) {
    setVars((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  }

  function remove(i: number) {
    setVars((prev) => prev.filter((_, idx) => idx !== i));
  }

  function add() {
    setVars((prev) => [...prev, { id: `e-${Date.now()}`, key: "NEW_SECRET", scope: "production", notes: "Describe what this is for." }]);
  }

  async function copy(text: string) { try { await navigator.clipboard.writeText(text); } catch {} }

  return (
    <ToolPageLayout
      title="Vercel Environment Variable Guide"
      description="Plan your Vercel environment variables — split by Production / Preview / Development, generate a starter .env.local and the matching `vercel env add` commands."
    >
      <div className="space-y-3">
        {vars.map((v, i) => (
          <div key={v.id} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
            <div className="grid gap-2 sm:grid-cols-[1.2fr_1fr_2.2fr_auto]">
              <input value={v.key} onChange={(e) => update(i, "key", e.target.value.toUpperCase().replace(/\s+/g, "_"))} className="font-mono rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-cyan-200" />
              <select value={v.scope} onChange={(e) => update(i, "scope", e.target.value as EnvVar["scope"])} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white">
                <option value="production">production</option>
                <option value="preview">preview</option>
                <option value="development">development</option>
                <option value="all">all</option>
              </select>
              <input value={v.notes} onChange={(e) => update(i, "notes", e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white/80" />
              <button type="button" onClick={() => remove(i)} className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={add} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white">Add variable</button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Starter .env.local</p>
            <button onClick={() => copy(envFile)} className="rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-400">Copy</button>
          </div>
          <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/80 font-mono whitespace-pre-wrap">{envFile}</pre>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Vercel CLI commands</p>
            <button onClick={() => copy(cli)} className="rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-400">Copy</button>
          </div>
          <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/80 font-mono whitespace-pre-wrap">{cli}</pre>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-amber-400/20 bg-amber-500/5 p-4 text-xs leading-6 text-amber-100/80">
        <p className="font-semibold mb-1">Security notes</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Anything prefixed <code className="text-amber-200">NEXT_PUBLIC_</code> is inlined into the client bundle. Never use it for secrets.</li>
          <li>Rotate secrets if you ever paste them into a shared Vercel UI screenshot.</li>
          <li>Use different keys per environment so a leaked preview key cannot affect production.</li>
        </ul>
      </div>
    </ToolPageLayout>
  );
}

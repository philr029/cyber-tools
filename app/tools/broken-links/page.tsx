"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

interface LinkRow {
  url: string;
  status: "pending" | "ok" | "broken" | "blocked";
  code?: number;
  note?: string;
}

export default function BrokenLinksPage() {
  const [raw, setRaw] = useState(
    [
      "https://example.com",
      "https://example.com/missing-page",
      "https://github.com",
      "https://this-domain-definitely-does-not-exist.example",
    ].join("\n"),
  );
  const [results, setResults] = useState<LinkRow[]>([]);
  const [running, setRunning] = useState(false);

  const urls = useMemo(
    () => raw.split("\n").map((l) => l.trim()).filter(Boolean),
    [raw],
  );

  async function run() {
    setRunning(true);
    const initial: LinkRow[] = urls.map((u) => ({ url: u, status: "pending" }));
    setResults(initial);
    const out: LinkRow[] = [];
    for (let i = 0; i < urls.length; i += 1) {
      const url = urls[i];
      try {
        const normalized = /^https?:\/\//.test(url) ? url : `https://${url}`;
        const r = await fetch(normalized, { method: "GET", mode: "no-cors" }).catch(() => null);
        if (!r) {
          out.push({ url, status: "broken", note: "Fetch failed" });
        } else if (r.type === "opaque") {
          out.push({ url, status: "blocked", note: "CORS opaque — re-check from server side" });
        } else {
          const status = r.status;
          if (status >= 200 && status < 400) out.push({ url, status: "ok", code: status });
          else out.push({ url, status: "broken", code: status });
        }
      } catch (e) {
        out.push({ url, status: "broken", note: e instanceof Error ? e.message : "error" });
      }
      setResults([...out, ...initial.slice(out.length)]);
    }
    setRunning(false);
  }

  const summary = useMemo(() => {
    const ok = results.filter((r) => r.status === "ok").length;
    const broken = results.filter((r) => r.status === "broken").length;
    const blocked = results.filter((r) => r.status === "blocked").length;
    return { ok, broken, blocked };
  }, [results]);

  return (
    <ToolPageLayout
      title="Broken Link Checker"
      description="Paste a list of URLs and we'll ping each one from the browser. CORS-protected sites return as 'opaque' — these need a server-side recheck (see API hook note below)."
    >
      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <label className="block text-xs font-medium text-white/70 mb-1">URLs (one per line)</label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void run()}
            disabled={running || urls.length === 0}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {running ? "Checking…" : `Check ${urls.length} link${urls.length === 1 ? "" : "s"}`}
          </button>
          <span className="text-[11px] text-white/45">Demo result · browser-side</span>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/30 p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
            <Badge tone="emerald">{summary.ok} OK</Badge>
            <Badge tone="rose">{summary.broken} broken</Badge>
            <Badge tone="amber">{summary.blocked} blocked / opaque</Badge>
          </div>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-xs">
                <span className="font-mono text-white/80 truncate max-w-[60%]">{r.url}</span>
                <span className="flex items-center gap-2">
                  {r.code && <span className="text-white/60">HTTP {r.code}</span>}
                  {r.note && <span className="text-white/45">{r.note}</span>}
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      r.status === "ok"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : r.status === "broken"
                        ? "bg-rose-500/20 text-rose-200"
                        : r.status === "blocked"
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    {r.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-[24px] border border-cyan-400/20 bg-cyan-500/5 p-4 text-xs leading-6 text-cyan-100/80">
        <p className="font-semibold mb-1">Future API hook</p>
        <p>
          Run this list through a server-side checker (Vercel function or a GitHub Action using <code className="text-cyan-200">linkchecker</code> or <code className="text-cyan-200">lychee</code>) to bypass browser CORS and get true HTTP status for every URL.
        </p>
      </div>
    </ToolPageLayout>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "emerald" | "rose" | "amber" }) {
  const map = {
    emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    rose: "bg-rose-500/15 text-rose-200 border-rose-400/30",
    amber: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  } as const;
  return <span className={`rounded-full border px-2 py-0.5 ${map[tone]}`}>{children}</span>;
}

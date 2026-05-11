"use client";

import { useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

interface StatusResult {
  url: string;
  ok: boolean;
  status: number;
  latencyMs: number;
  contentType: string | null;
  server: string | null;
  redirects: string[];
}

const EXAMPLES = ["https://example.com", "https://github.com", "https://microsoft.com"];

export default function WebsiteStatusPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StatusResult | null>(null);

  async function check(target: string) {
    setError(null);
    setData(null);
    setLoading(true);
    const started = performance.now();
    try {
      let normalized = target.trim();
      if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
      const parsed = new URL(normalized);
      const res = await fetch(parsed.toString(), { method: "GET", redirect: "follow", mode: "no-cors" }).catch(async () => {
        return await fetch(parsed.toString(), { method: "GET" });
      });
      const latencyMs = Math.round(performance.now() - started);
      const status = (res as Response).status ?? 0;
      const okFromResponse = (res as Response).ok;
      const ok = okFromResponse ?? (status === 0 || (status >= 200 && status < 400));
      const contentType = (res as Response).headers?.get?.("content-type") ?? null;
      const server = (res as Response).headers?.get?.("server") ?? null;
      setData({ url: parsed.toString(), ok, status, latencyMs, contentType, server, redirects: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageLayout
      title="Website Status Checker"
      description="A lightweight client-side uptime ping. Enter any URL and we'll measure HTTP status, response time, and basic headers. Browser CORS rules mean some servers will return status 0 (opaque) — that's expected."
    >
      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void check(url); }}
            placeholder="https://example.com"
            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
          <button
            type="button"
            onClick={() => void check(url)}
            disabled={loading || !url.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-40"
          >
            {loading ? "Checking…" : "Run check"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
          <span>Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => { setUrl(ex); void check(ex); }} className="rounded-full border border-white/10 px-2 py-0.5 hover:border-cyan-400/40 hover:text-cyan-200">
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
      )}

      {data && (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/30 p-5">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                data.ok ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${data.ok ? "bg-emerald-300 animate-pulse" : "bg-rose-300"}`} />
              {data.status === 0 ? "Reachable (opaque)" : `HTTP ${data.status} ${data.ok ? "OK" : ""}`}
            </span>
            <span className="text-xs text-white/55">{data.latencyMs} ms</span>
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
              Demo result · browser-only
            </span>
          </div>
          <dl className="grid gap-2 sm:grid-cols-2 text-xs">
            <Row label="URL" value={data.url} />
            <Row label="Latency" value={`${data.latencyMs} ms`} />
            <Row label="Content-Type" value={data.contentType || "—"} />
            <Row label="Server" value={data.server || "—"} />
          </dl>
          <p className="mt-4 text-[11px] text-white/45 leading-5">
            Browsers may return status 0 (opaque) for cross-origin GETs. To get accurate status codes, run this check
            server-side — the same code path used by SecureScope&apos;s server tools.
          </p>
        </div>
      )}
    </ToolPageLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</dt>
      <dd className="mt-1 font-mono text-white/80 truncate">{value}</dd>
    </div>
  );
}

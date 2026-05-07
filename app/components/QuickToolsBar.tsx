"use client";

import { useState } from "react";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToolId = "dns" | "http" | "geo";

interface ToolResult {
  ok: boolean;
  lines: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function runDNS(query: string): Promise<ToolResult> {
  try {
    const res = await fetch(`/api/lookup/dns?target=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as {
      records?: { type: string; value: string }[];
      nameservers?: string[];
    };
    const lines: string[] = [];
    const records = json.records ?? [];
    ["A", "MX", "TXT", "NS"].forEach((type) => {
      const hits = records.filter((r) => r.type === type);
      if (hits.length) lines.push(`${type}: ${hits.map((r) => r.value).join(", ")}`);
    });
    if ((json.nameservers ?? []).length) lines.push(`NS servers: ${(json.nameservers ?? []).join(", ")}`);
    return { ok: true, lines: lines.length ? lines : ["No records found"] };
  } catch (err) {
    return { ok: false, lines: [`Error: ${err instanceof Error ? err.message : "Unknown error"}`] };
  }
}

async function runHTTPStatus(query: string): Promise<ToolResult> {
  try {
    // Ensure it has a scheme
    const url = /^https?:\/\//i.test(query) ? query : `https://${query}`;
    const res = await fetch(`/api/lookup/headers?target=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as {
      score?: number;
      grade?: string;
      headers?: { name: string; present: boolean }[];
    };
    const lines: string[] = [];
    if (json.grade)  lines.push(`Security grade: ${json.grade} (${json.score ?? "?"}/100)`);
    const presentHeaders = (json.headers ?? []).filter((h) => h.present).map((h) => h.name);
    if (presentHeaders.length) lines.push(`Present: ${presentHeaders.slice(0, 4).join(", ")}`);
    const missingHeaders = (json.headers ?? []).filter((h) => !h.present).map((h) => h.name);
    if (missingHeaders.length) lines.push(`Missing: ${missingHeaders.slice(0, 3).join(", ")}`);
    return { ok: true, lines: lines.length ? lines : ["Analysis complete"] };
  } catch (err) {
    return { ok: false, lines: [`Error: ${err instanceof Error ? err.message : "Unknown error"}`] };
  }
}

async function runGeo(query: string): Promise<ToolResult> {
  try {
    const res = await fetch(`/api/lookup/geo?target=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as {
      country?: string;
      countryCode?: string;
      city?: string;
      region?: string;
      isp?: string;
      asn?: string;
      status?: string;
    };
    const lines: string[] = [];
    if (json.country)  lines.push(`Country: ${json.country} (${json.countryCode ?? "?"})`);
    if (json.city)     lines.push(`City: ${json.city}${json.region ? `, ${json.region}` : ""}`);
    if (json.isp)      lines.push(`ISP: ${json.isp}`);
    if (json.asn)      lines.push(`ASN: ${json.asn}`);
    return { ok: true, lines: lines.length ? lines : ["Location data unavailable"] };
  } catch (err) {
    return { ok: false, lines: [`Error: ${err instanceof Error ? err.message : "Unknown error"}`] };
  }
}

// ---------------------------------------------------------------------------
// Tool config
// ---------------------------------------------------------------------------

const TOOLS: {
  id: ToolId;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  color: string;
  run: (q: string) => Promise<ToolResult>;
}[] = [
  {
    id: "dns",
    label: "DNS Lookup",
    placeholder: "domain.com",
    color: "text-teal-400",
    run: runDNS,
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
      </svg>
    ),
  },
  {
    id: "http",
    label: "HTTP Headers",
    placeholder: "https://example.com",
    color: "text-orange-400",
    run: runHTTPStatus,
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M3 3.5A1.5 1.5 0 014.5 2h11A1.5 1.5 0 0117 3.5v1A1.5 1.5 0 0115.5 6h-11A1.5 1.5 0 013 4.5v-1zM3 9.5A1.5 1.5 0 014.5 8h11A1.5 1.5 0 0117 9.5v1a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 10.5v-1zM4.5 14a1.5 1.5 0 00-1.5 1.5v1A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5v-1a1.5 1.5 0 00-1.5-1.5h-11z" />
      </svg>
    ),
  },
  {
    id: "geo",
    label: "IP Geo",
    placeholder: "8.8.8.8 or domain",
    color: "text-green-400",
    run: runGeo,
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Single mini-tool widget
// ---------------------------------------------------------------------------

function MiniTool({ tool }: { tool: typeof TOOLS[0] }) {
  const [query, setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ToolResult | null>(null);

  async function handleRun() {
    const safeQuery = sanitizeSingleLineInput(query);
    if (!safeQuery || loading) return;
    setLoading(true);
    setResult(null);
    const res = await tool.run(safeQuery);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="flex-1 min-w-0 bg-[#0f1629] rounded-2xl border border-[#1e2d4a] p-4 card-lift transition-all duration-200">
      {/* Header */}
      <div className={`flex items-center gap-1.5 mb-3 ${tool.color}`}>
        {tool.icon}
        <span className="text-xs font-semibold">{tool.label}</span>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(sanitizeSingleLineInput(e.target.value, { trim: false }))}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
          placeholder={tool.placeholder}
          className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-colors"
        />
        <button
          type="button"
          onClick={handleRun}
          disabled={loading || !query.trim()}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-medium btn-micro transition-colors flex-shrink-0"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
          ) : (
            "Run"
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-2.5 animate-result-in">
          <div
            className={`rounded-lg border px-3 py-2 space-y-0.5 ${
              result.ok
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            {result.lines.map((line, i) => (
              <p key={i} className={`text-xs leading-snug ${result.ok ? "text-slate-300" : "text-red-400"}`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Tools Bar
// ---------------------------------------------------------------------------

export default function QuickToolsBar() {
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
        </svg>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Quick Tools</h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-2.5">
        {TOOLS.map((tool) => (
          <MiniTool key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}

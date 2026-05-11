"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface HeaderRow {
  id: string;
  key: string;
  value: string;
}

export default function ApiBuilderPage() {
  const [url, setUrl] = useState("https://api.example.com/v1/items");
  const [method, setMethod] = useState<Method>("GET");
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: "h1", key: "Accept", value: "application/json" },
    { id: "h2", key: "Authorization", value: "Bearer ${TOKEN}" },
  ]);
  const [body, setBody] = useState(`{
  "name": "Demo item",
  "active": true
}`);

  const hasBody = method !== "GET" && method !== "DELETE";

  const filteredHeaders = useMemo(() => headers.filter((h) => h.key.trim()), [headers]);

  const fetchCode = useMemo(() => {
    const headerObj: Record<string, string> = {};
    for (const h of filteredHeaders) headerObj[h.key] = h.value;

    const opts: string[] = [`  method: ${JSON.stringify(method)},`];
    if (Object.keys(headerObj).length > 0) {
      opts.push(`  headers: ${JSON.stringify(headerObj, null, 4).replace(/\n/g, "\n  ")},`);
    }
    if (hasBody && body.trim()) {
      const trimmed = body.trim();
      try {
        JSON.parse(trimmed);
        opts.push(`  body: JSON.stringify(${trimmed}),`);
      } catch {
        opts.push(`  body: ${JSON.stringify(trimmed)},`);
      }
    }

    return `// Run this from a browser or Node.js
const res = await fetch(${JSON.stringify(url)}, {
${opts.join("\n")}
});

if (!res.ok) {
  throw new Error(\`HTTP \${res.status} - \${res.statusText}\`);
}
const data = await res.json();
console.log(data);`;
  }, [url, method, filteredHeaders, body, hasBody]);

  const curlCode = useMemo(() => {
    const parts: string[] = [`curl -X ${method} ${JSON.stringify(url)}`];
    for (const h of filteredHeaders) parts.push(`  -H ${JSON.stringify(`${h.key}: ${h.value}`)}`);
    if (hasBody && body.trim()) {
      const trimmed = body.trim();
      parts.push(`  --data ${JSON.stringify(trimmed)}`);
    }
    return parts.join(" \\\n");
  }, [method, url, filteredHeaders, body, hasBody]);

  function updateHeader(id: string, patch: Partial<HeaderRow>) {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  function addHeader() {
    setHeaders((prev) => [...prev, { id: `h${Date.now()}`, key: "", value: "" }]);
  }

  function removeHeader(id: string) {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <ToolPageLayout
      title="API Request Builder"
      description="Compose an HTTP request and copy ready-to-run fetch() and curl commands. Great for documenting integrations or sharing a reproducer with a teammate."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="HTTP request engineering." accent="cyan" />
        <Meta label="Why" body="Hand-formatting curl and fetch is error-prone — let the toolkit do it." accent="violet" />
        <Meta
          label="Future API"
          body="Hook to the existing /api/proxy serverless function (or your own) to execute the request server-side. Never put bearer tokens in client code."
          accent="emerald"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 space-y-3">
          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Endpoint URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/v1/items"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
          </label>

          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Method</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            >
              {(["GET", "POST", "PUT", "PATCH", "DELETE"] as Method[]).map((m) => (
                <option key={m} value={m} className="bg-[#0b1220]">
                  {m}
                </option>
              ))}
            </select>
          </label>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium text-white/75">Headers</p>
              <button
                type="button"
                onClick={addHeader}
                className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/65 transition-colors hover:border-white/30 hover:text-white"
              >
                + Add header
              </button>
            </div>
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h.id} className="flex gap-2">
                  <input
                    value={h.key}
                    onChange={(e) => updateHeader(h.id, { key: e.target.value })}
                    placeholder="Header"
                    className="w-1/3 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <input
                    value={h.value}
                    onChange={(e) => updateHeader(h.id, { value: e.target.value })}
                    placeholder="Value"
                    className="flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeader(h.id)}
                    aria-label="Remove header"
                    className="rounded-lg border border-white/10 px-2 text-white/55 transition-colors hover:border-rose-400/40 hover:text-rose-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {hasBody && (
            <label className="block text-xs text-white/65">
              <span className="mb-1 block font-medium text-white/75">Request body</span>
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key":"value"}'
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />
            </label>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                JavaScript (fetch)
              </p>
              <CopyButton text={fetchCode} label="Copy fetch" />
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre">
{fetchCode}
            </pre>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                curl
              </p>
              <CopyButton text={curlCode} label="Copy curl" />
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre">
{curlCode}
            </pre>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}

function Meta({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}

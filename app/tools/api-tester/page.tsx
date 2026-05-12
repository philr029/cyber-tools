"use client";

import { useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import {
  sanitizeHeaderName,
  sanitizeHeaderValue,
  sanitizeMultilineInput,
  sanitizeSingleLineInput,
} from "@/lib/input-sanitization";
import { withBasePath } from "@/lib/base-path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeaderRow {
  id: number;
  key: string;
  value: string;
}

interface APITestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string | null;
  contentType: string;
  durationMs: number;
  url: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
type HTTPMethod = (typeof METHODS)[number];
function statusColor(code: number): string {
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-orange-400";
  if (code >= 300) return "text-yellow-400";
  if (code >= 200) return "text-emerald-400";
  return "text-slate-400";
}

const EXAMPLE_REQUESTS = [
  { label: "JSONPlaceholder GET", method: "GET" as HTTPMethod, url: "https://jsonplaceholder.typicode.com/posts/1", body: "" },
  { label: "JSONPlaceholder POST", method: "POST" as HTTPMethod, url: "https://jsonplaceholder.typicode.com/posts", body: '{\n  "title": "Test Post",\n  "body": "Hello world",\n  "userId": 1\n}' },
  { label: "httpbin GET", method: "GET" as HTTPMethod, url: "https://httpbin.org/get", body: "" },
  { label: "httpbin POST JSON", method: "POST" as HTTPMethod, url: "https://httpbin.org/post", body: '{\n  "key": "value"\n}' },
];

const Icon = (
  <svg className="w-10 h-10 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Header row component
// ---------------------------------------------------------------------------

function HeaderRowInput({
  row,
  onChange,
  onRemove,
}: {
  row: HeaderRow;
  onChange: (id: number, field: "key" | "value", val: string) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Header name"
        value={row.key}
        onChange={(e) => onChange(row.id, "key", e.target.value)}
        className="flex-1 bg-[#0b0f1a] border border-[#1e2d4a] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      <input
        type="text"
        placeholder="Value"
        value={row.value}
        onChange={(e) => onChange(row.id, "value", e.target.value)}
        className="flex-1 bg-[#0b0f1a] border border-[#1e2d4a] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
        aria-label="Remove header"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Response viewer
// ---------------------------------------------------------------------------

function ResponseViewer({ result }: { result: APITestResult }) {
  const [tab, setTab] = useState<"body" | "headers">("body");

  let formattedBody = result.body ?? "(no body)";
  if (result.contentType.includes("json") && result.body) {
    try {
      formattedBody = JSON.stringify(JSON.parse(result.body), null, 2);
    } catch {
      // use raw
    }
  }

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a]">
        <div className="flex items-center gap-3">
          <span className={`text-xl font-bold ${statusColor(result.status)}`}>
            {result.status}
          </span>
          <span className="text-sm text-slate-400">{result.statusText}</span>
          <span className="text-xs text-slate-600 bg-[#0d1321] border border-[#1e2d4a] px-2 py-0.5 rounded-full">
            {result.durationMs} ms
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(formattedBody);
          }}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
          </svg>
          Copy
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e2d4a]">
        {(["body", "headers"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t}
            {t === "headers" && (
              <span className="ml-1.5 bg-[#1e2d4a] text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">
                {Object.keys(result.headers).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {tab === "body" && (
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all max-h-96 overflow-auto leading-relaxed">
            {formattedBody}
          </pre>
        )}
        {tab === "headers" && (
          <div className="space-y-1.5">
            {Object.entries(result.headers).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-xs">
                <span className="text-cyan-400 font-medium min-w-[180px] shrink-0">{k}</span>
                <span className="text-slate-300 break-all">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function APITesterPage() {
  const [method, setMethod] = useState<HTTPMethod>("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState<HeaderRow[]>([{ id: 1, key: "Content-Type", value: "application/json" }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<APITestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasBody = ["POST", "PUT", "PATCH"].includes(method);

  function addHeader() {
    setHeaders((prev) => [...prev, { id: Date.now(), key: "", value: "" }]);
  }

  function updateHeader(id: number, field: "key" | "value", val: string) {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: val } : h)));
  }

  function removeHeader(id: number) {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  }

  function applyExample(ex: (typeof EXAMPLE_REQUESTS)[number]) {
    setMethod(ex.method);
    setUrl(ex.url);
    setBody(ex.body);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const safeUrl = sanitizeSingleLineInput(url, { maxLength: 4096 });
    if (!safeUrl) {
      setError("Please enter a URL.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const headersObj: Record<string, string> = {};
    for (const h of headers) {
      const key = sanitizeHeaderName(h.key);
      if (key) {
        headersObj[key] = sanitizeHeaderValue(h.value);
      }
    }

    const sanitizedBody = hasBody
      ? sanitizeMultilineInput(body, { trim: false, maxLength: 20000 })
      : "";
    const safeBody = sanitizedBody.trim() ? sanitizedBody : undefined;

    try {
      const res = await fetch(withBasePath("/api/tools/api-test"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: safeUrl,
          method,
          headers: headersObj,
          body: safeBody,
        }),
      });

      const data = await res.json() as APITestResult & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Request failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolPageLayout
      title="API Tester"
      description="Send HTTP requests (GET, POST, PUT, PATCH, DELETE) and inspect responses. All requests are proxied server-side."
    >
      {/* Examples */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLE_REQUESTS.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => applyExample(ex)}
            className="text-xs bg-[#0d1321] border border-[#1e2d4a] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL + method row */}
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 space-y-4">
          <div className="flex gap-3">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HTTPMethod)}
              className="bg-[#0b0f1a] border border-[#1e2d4a] rounded-lg px-3 py-2.5 text-sm font-mono font-semibold text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-w-[110px]"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 bg-[#0b0f1a] border border-[#1e2d4a] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors min-w-[80px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending
                </span>
              ) : "Send"}
            </button>
          </div>

          {/* Headers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Headers</span>
              <button
                type="button"
                onClick={addHeader}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add header
              </button>
            </div>
            <div className="space-y-2">
              {headers.map((h) => (
                <HeaderRowInput key={h.id} row={h} onChange={updateHeader} onRemove={removeHeader} />
              ))}
            </div>
          </div>

          {/* Body */}
          {hasBody && (
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={'{\n  "key": "value"\n}'}
                rows={8}
                className="w-full bg-[#0b0f1a] border border-[#1e2d4a] rounded-lg px-4 py-3 text-xs font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
      </form>

      {/* Result */}
      {!loading && result && <div className="mt-4"><ResponseViewer result={result} /></div>}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-10 text-center mt-4">
          {Icon}
          <p className="text-sm text-slate-400 mt-3">Enter a URL and press Send to test an API endpoint.</p>
          <p className="text-xs text-slate-600 mt-1">Requests are proxied server-side. Private IPs are blocked.</p>
        </div>
      )}
    </ToolPageLayout>
  );
}

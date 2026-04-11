"use client";

import { useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldRow {
  id: number;
  key: string;
  value: string;
}

interface Observation {
  label: string;
  severity: "info" | "warning" | "pass";
}

interface FormTestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string | null;
  contentType: string;
  durationMs: number;
  finalUrl: string;
  redirected: boolean;
  observations: Observation[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONTENT_TYPES = [
  { label: "URL-encoded (application/x-www-form-urlencoded)", value: "application/x-www-form-urlencoded" },
  { label: "Multipart (multipart/form-data)", value: "multipart/form-data" },
  { label: "JSON (application/json)", value: "application/json" },
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]["value"];

const OBSERVATION_STYLES: Record<Observation["severity"], { bg: string; text: string; icon: string }> = {
  pass: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", icon: "✓" },
  warning: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", icon: "⚠" },
  info: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", icon: "ℹ" },
};

function statusColor(code: number): string {
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-orange-400";
  if (code >= 300) return "text-yellow-400";
  if (code >= 200) return "text-emerald-400";
  return "text-slate-400";
}

const EXAMPLE_FORMS = [
  {
    label: "httpbin POST form",
    url: "https://httpbin.org/post",
    method: "POST" as const,
    contentType: "application/x-www-form-urlencoded" as ContentType,
    fields: [
      { id: 1, key: "username", value: "testuser" },
      { id: 2, key: "email", value: "test@example.com" },
    ],
  },
  {
    label: "httpbin GET",
    url: "https://httpbin.org/get",
    method: "GET" as const,
    contentType: "application/x-www-form-urlencoded" as ContentType,
    fields: [
      { id: 1, key: "search", value: "test query" },
    ],
  },
  {
    label: "JSONPlaceholder POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST" as const,
    contentType: "application/json" as ContentType,
    fields: [
      { id: 1, key: "title", value: "Test form submission" },
      { id: 2, key: "body", value: "This is a form test." },
      { id: 3, key: "userId", value: "1" },
    ],
  },
];

const Icon = (
  <svg className="w-10 h-10 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Field row component
// ---------------------------------------------------------------------------

function FieldRowInput({
  row,
  onChange,
  onRemove,
}: {
  row: FieldRow;
  onChange: (id: number, field: "key" | "value", val: string) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Field name"
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
        aria-label="Remove field"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Observations panel
// ---------------------------------------------------------------------------

function ObservationsPanel({ observations }: { observations: Observation[] }) {
  const warnings = observations.filter((o) => o.severity === "warning").length;
  const passes = observations.filter((o) => o.severity === "pass").length;

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a] flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Security Observations</span>
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-400">{passes} passed</span>
          <span className="text-amber-400">{warnings} warnings</span>
        </div>
      </div>
      <div className="p-5 space-y-2">
        {observations.map((obs, i) => {
          const style = OBSERVATION_STYLES[obs.severity];
          return (
            <div key={i} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${style.bg}`}>
              <span className={`text-sm font-bold ${style.text} leading-5`}>{style.icon}</span>
              <span className={`text-xs leading-5 ${style.text}`}>{obs.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Response viewer
// ---------------------------------------------------------------------------

function ResponseViewer({ result }: { result: FormTestResult }) {
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
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e2d4a] bg-[#0b0f1a]">
        <div className="flex items-center gap-3">
          <span className={`text-xl font-bold ${statusColor(result.status)}`}>{result.status}</span>
          <span className="text-sm text-slate-400">{result.statusText}</span>
          <span className="text-xs text-slate-600 bg-[#0d1321] border border-[#1e2d4a] px-2 py-0.5 rounded-full">
            {result.durationMs} ms
          </span>
          {result.redirected && (
            <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
              Redirected
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(formattedBody)}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
        >
          Copy
        </button>
      </div>

      {result.finalUrl && (
        <div className="px-5 py-2 border-b border-[#1e2d4a] bg-[#0b0f1a]">
          <span className="text-xs text-slate-500">Final URL: </span>
          <span className="text-xs text-slate-300 font-mono break-all">{result.finalUrl}</span>
        </div>
      )}

      <div className="flex border-b border-[#1e2d4a]">
        {(["body", "headers"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors ${
              tab === t ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-500 hover:text-slate-300"
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

      <div className="p-5">
        {tab === "body" && (
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all max-h-80 overflow-auto leading-relaxed">
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

export default function FormTesterPage() {
  const [method, setMethod] = useState<"GET" | "POST">("POST");
  const [url, setUrl] = useState("");
  const [contentType, setContentType] = useState<ContentType>("application/x-www-form-urlencoded");
  const [fields, setFields] = useState<FieldRow[]>([
    { id: 1, key: "", value: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addField() {
    setFields((prev) => [...prev, { id: Date.now(), key: "", value: "" }]);
  }

  function updateField(id: number, field: "key" | "value", val: string) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  }

  function removeField(id: number) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function applyExample(ex: (typeof EXAMPLE_FORMS)[number]) {
    setUrl(ex.url);
    setMethod(ex.method);
    setContentType(ex.contentType);
    setFields(ex.fields);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a target URL.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const validFields = fields.filter((f) => f.key.trim());

    try {
      const res = await fetch("/api/tools/form-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          method,
          contentType,
          fields: validFields,
        }),
      });

      const data = await res.json() as FormTestResult & { error?: string };
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
      title="Form Testing Tool"
      description="Submit form data to any endpoint and inspect the response. Security observations highlight potential vulnerabilities."
    >
      {/* Examples */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLE_FORMS.map((ex) => (
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
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 space-y-4">
          {/* URL + method */}
          <div className="flex gap-3">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
              className="bg-[#0b0f1a] border border-[#1e2d4a] rounded-lg px-3 py-2.5 text-sm font-mono font-semibold text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-w-[90px]"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/submit"
              className="flex-1 bg-[#0b0f1a] border border-[#1e2d4a] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Content type (POST only) */}
          {method === "POST" && (
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">Content Type</label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setContentType(ct.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      contentType === ct.value
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-[#0b0f1a] border-[#1e2d4a] text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Form Fields</span>
              <button
                type="button"
                onClick={addField}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add field
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((f) => (
                <FieldRowInput key={f.id} row={f} onChange={updateField} onRemove={removeField} />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-2.5 bg-pink-500 hover:bg-pink-400 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting form…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
                Submit Form
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
      </form>

      {/* Results */}
      {!loading && result && (
        <div className="mt-4 space-y-4">
          <ObservationsPanel observations={result.observations} />
          <ResponseViewer result={result} />
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-10 text-center mt-4">
          {Icon}
          <p className="text-sm text-slate-400 mt-3">Enter a form endpoint and fields, then click Submit Form.</p>
          <p className="text-xs text-slate-600 mt-1">Security observations check for CSRF tokens, missing headers, and server disclosure.</p>
        </div>
      )}
    </ToolPageLayout>
  );
}

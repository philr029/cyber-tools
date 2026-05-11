"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

interface Result {
  ok: boolean;
  formatted: string;
  error?: string;
  line?: number;
  column?: number;
}

const SAMPLE = `{"user":{"name":"Jane","email":"jane@example.com","roles":["admin","editor"]},"createdAt":"2025-01-01T10:00:00Z","active":true}`;

function locate(input: string, position: number): { line: number; column: number } {
  const slice = input.slice(0, position);
  const line = (slice.match(/\n/g)?.length ?? 0) + 1;
  const lastNl = slice.lastIndexOf("\n");
  const column = position - (lastNl + 1) + 1;
  return { line, column };
}

function format(input: string, indent: number): Result {
  if (!input.trim()) {
    return { ok: false, formatted: "", error: "Paste some JSON to validate." };
  }
  try {
    const parsed = JSON.parse(input);
    return { ok: true, formatted: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON";
    const m = msg.match(/position (\d+)/);
    if (m) {
      const pos = Number(m[1]);
      const { line, column } = locate(input, pos);
      return { ok: false, formatted: "", error: msg, line, column };
    }
    return { ok: false, formatted: "", error: msg };
  }
}

export default function JsonFormatterPage() {
  const [raw, setRaw] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => format(raw, indent), [raw, indent]);
  const minified = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(raw));
    } catch {
      return "";
    }
  }, [raw]);

  return (
    <ToolPageLayout
      title="JSON Formatter & Validator"
      description="Paste JSON and immediately see whether it is valid. Get a pretty-printed version with adjustable indentation and a minified version, both copyable."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="JSON debugging and API hygiene." accent="cyan" />
        <Meta label="Why" body="Faster than opening a parser tab when an API response misbehaves." accent="violet" />
        <Meta label="Privacy" body="Everything runs in your browser. JSON never leaves the page." accent="emerald" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Input</p>
            <button
              type="button"
              onClick={() => setRaw(SAMPLE)}
              className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/65 transition-colors hover:border-white/30 hover:text-white"
            >
              Load sample
            </button>
          </div>
          <textarea
            rows={16}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/65">
            <label className="inline-flex items-center gap-2">
              <span>Indent</span>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={0}>Minified</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setRaw("")}
              className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div
            className={`rounded-[24px] border p-4 ${
              result.ok
                ? "border-emerald-400/30 bg-emerald-500/5"
                : "border-rose-400/30 bg-rose-500/5"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Validation
            </p>
            {result.ok ? (
              <p className="mt-2 text-sm text-emerald-200">Valid JSON.</p>
            ) : (
              <p className="mt-2 text-sm text-rose-200">
                {result.error}
                {result.line && (
                  <span className="ml-1 text-rose-300/80">
                    (line {result.line}, column {result.column})
                  </span>
                )}
              </p>
            )}
          </div>

          {result.ok && (
            <>
              <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                    Formatted ({indent === 0 ? "minified" : `${indent} spaces`})
                  </p>
                  <CopyButton text={result.formatted} label="Copy JSON" />
                </div>
                <pre className="max-h-80 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre">
{result.formatted}
                </pre>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                    Minified
                  </p>
                  <CopyButton text={minified} label="Copy minified" />
                </div>
                <pre className="max-h-32 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre-wrap break-all">
{minified}
                </pre>
              </div>
            </>
          )}
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

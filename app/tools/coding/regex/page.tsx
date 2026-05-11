"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

interface Preset {
  id: string;
  label: string;
  pattern: string;
  flags: string;
  sample: string;
  notes: string;
}

const PRESETS: Preset[] = [
  {
    id: "email",
    label: "Email address",
    pattern: "^[\\w.!#$%&'*+\\/=?^`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$",
    flags: "i",
    sample: "jane.smith@example.co.uk",
    notes: "Pragmatic email regex — close to RFC 5322 but readable. Anchored start/end.",
  },
  {
    id: "uk-phone",
    label: "UK phone number",
    pattern: "^(?:(?:\\+44\\s?|0)(?:\\d\\s?){9,10})$",
    flags: "",
    sample: "+44 7123 456789",
    notes: "Accepts +44 and 0 prefixes, optional spaces between digits.",
  },
  {
    id: "url",
    label: "URL (http/https)",
    pattern: "^https?:\\/\\/(?:[\\w-]+\\.)+[A-Za-z]{2,}(?:[\\/?#][^\\s]*)?$",
    flags: "i",
    sample: "https://example.com/path?query=1",
    notes: "Requires http:// or https:// prefix and a valid TLD.",
  },
  {
    id: "uk-postcode",
    label: "UK postcode",
    pattern: "^[A-Z]{1,2}\\d[A-Z\\d]?\\s*\\d[A-Z]{2}$",
    flags: "i",
    sample: "SW1A 1AA",
    notes: "Royal Mail format. Optional whitespace between outward and inward codes.",
  },
  {
    id: "ipv4",
    label: "IPv4 address",
    pattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)$",
    flags: "",
    sample: "192.168.1.42",
    notes: "Each octet 0–255. Use a CIDR-aware library for ranges.",
  },
  {
    id: "iso-date",
    label: "ISO 8601 date (YYYY-MM-DD)",
    pattern: "^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$",
    flags: "",
    sample: "2025-11-30",
    notes: "Structural check only — does not validate February days.",
  },
];

export default function RegexBuilderPage() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState(PRESETS[0].flags);
  const [testInput, setTestInput] = useState(PRESETS[0].sample);

  const preset = useMemo(() => PRESETS.find((p) => p.id === presetId)!, [presetId]);

  const compile = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      return { re, error: null as string | null };
    } catch (e) {
      return { re: null, error: e instanceof Error ? e.message : "Invalid regex" };
    }
  }, [pattern, flags]);

  const matchResult = useMemo(() => {
    if (!compile.re) return null;
    const m = testInput.match(compile.re);
    return m;
  }, [compile.re, testInput]);

  const literal = `/${pattern}/${flags}`;
  const jsSnippet = `const re = new RegExp(${JSON.stringify(pattern)}, ${JSON.stringify(flags)});\nconst ok = re.test(input);`;

  return (
    <ToolPageLayout
      title="Regex Builder"
      description="Start from a battle-tested pattern (email, UK phone, URL, postcode, IP, date), customise the regex and verify it against your own input."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="Pattern matching and input validation." accent="cyan" />
        <Meta label="Why" body="Quickly reach for a tested regex instead of guessing at escapes." accent="violet" />
        <Meta label="Future API" body="Optional: wire to a regex explainer LLM via a serverless function." accent="emerald" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 space-y-3">
          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Preset</span>
            <select
              value={presetId}
              onChange={(e) => {
                const id = e.target.value;
                setPresetId(id);
                const p = PRESETS.find((x) => x.id === id);
                if (p) {
                  setPattern(p.pattern);
                  setFlags(p.flags);
                  setTestInput(p.sample);
                }
              }}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0b1220]">
                  {p.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] leading-5 text-white/45">{preset.notes}</span>
          </label>

          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Pattern</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
          </label>

          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Flags</span>
            <input
              value={flags}
              onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))}
              placeholder="e.g. gi"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
          </label>

          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Test input</span>
            <textarea
              rows={4}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div
            className={`rounded-[24px] border p-4 ${
              compile.error
                ? "border-rose-400/30 bg-rose-500/5"
                : matchResult
                  ? "border-emerald-400/30 bg-emerald-500/5"
                  : "border-amber-400/30 bg-amber-500/5"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Result
            </p>
            {compile.error ? (
              <p className="mt-2 text-sm text-rose-200">Invalid regex: {compile.error}</p>
            ) : matchResult ? (
              <div className="mt-2 text-sm text-emerald-200">
                <p>Match found.</p>
                <pre className="mt-2 rounded bg-black/30 p-2 text-xs text-white/85">
                  {JSON.stringify(matchResult, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="mt-2 text-sm text-amber-200">No match.</p>
            )}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Regex literal
              </p>
              <CopyButton text={literal} />
            </div>
            <pre className="overflow-auto rounded-xl bg-black/40 p-3 text-xs text-white/85">{literal}</pre>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                JavaScript snippet
              </p>
              <CopyButton text={jsSnippet} />
            </div>
            <pre className="overflow-auto rounded-xl bg-black/40 p-3 text-xs text-white/85">{jsSnippet}</pre>
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

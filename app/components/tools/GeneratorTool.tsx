"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

export type GeneratorField =
  | {
      id: string;
      label: string;
      type?: "text" | "email" | "url" | "date" | "number";
      placeholder?: string;
      defaultValue?: string;
      hint?: string;
    }
  | {
      id: string;
      label: string;
      type: "textarea";
      placeholder?: string;
      defaultValue?: string;
      rows?: number;
      hint?: string;
    }
  | {
      id: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
      defaultValue?: string;
      hint?: string;
    };

export interface GeneratorOutput {
  /** Heading for the output block. */
  label: string;
  /** Output content (text/markdown/code/yaml etc). */
  value: string;
  /** Display language hint for the pre block (purely visual). */
  language?: string;
}

export interface GeneratorToolProps {
  title: string;
  description: string;
  skill?: string;
  why?: string;
  futureApi?: string;
  fields: GeneratorField[];
  /** Returns one or more named output blocks rendered with copy buttons. */
  generate: (values: Record<string, string>) => GeneratorOutput[];
  /** Optional helper rendered above the inputs (e.g. example presets). */
  topSlot?: ReactNode;
  /** Optional helper rendered below the outputs. */
  bottomSlot?: ReactNode;
  /** Optional initial state derived from the fields' defaultValue keys. */
  storageKey?: string;
}

function initial(fields: GeneratorField[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    if ("defaultValue" in f && f.defaultValue !== undefined) {
      out[f.id] = f.defaultValue;
    } else if (f.type === "select") {
      out[f.id] = f.options[0]?.value ?? "";
    } else {
      out[f.id] = "";
    }
  }
  return out;
}

export default function GeneratorTool(props: GeneratorToolProps) {
  const { fields, generate, storageKey } = props;
  const [values, setValues] = useState<Record<string, string>>(() => initial(fields));

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          // Hydrating from localStorage on the client — intentional, matches
          // the codebase's existing pattern (see lib/use-daily-scans.ts).
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setValues((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [storageKey, values]);

  function update(id: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setValues((prev) => ({ ...prev, [id]: e.target.value }));
  }

  const outputs = useMemo(() => {
    try {
      return generate(values);
    } catch {
      return [{ label: "Error", value: "Generator error — check your inputs.", language: "text" }];
    }
  }, [generate, values]);

  return (
    <ToolPageLayout title={props.title} description={props.description}>
      <Meta skill={props.skill} why={props.why} futureApi={props.futureApi} />

      {props.topSlot && <div className="mb-5">{props.topSlot}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Inputs
          </p>
          <div className="space-y-3">
            {fields.map((field) => (
              <label key={field.id} className="block text-xs text-white/65">
                <span className="mb-1 block font-medium text-white/75">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    rows={field.rows ?? 4}
                    value={values[field.id] ?? ""}
                    onChange={(e) => update(field.id, e)}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={values[field.id] ?? ""}
                    onChange={(e) => update(field.id, e)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0b1220]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    value={values[field.id] ?? ""}
                    onChange={(e) => update(field.id, e)}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                )}
                {field.hint && (
                  <span className="mt-1 block text-[11px] leading-5 text-white/45">{field.hint}</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {outputs.map((out, i) => (
            <div
              key={`${out.label}-${i}`}
              className="rounded-[24px] border border-white/10 bg-black/30 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                  {out.label}
                  {out.language && (
                    <span className="ml-2 rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-white/55">
                      {out.language}
                    </span>
                  )}
                </p>
                <CopyButton text={out.value} label="Copy" />
              </div>
              <pre className="max-h-80 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/80 whitespace-pre-wrap">
{out.value || "Fill in the inputs to see output here."}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {props.bottomSlot && <div className="mt-6">{props.bottomSlot}</div>}
    </ToolPageLayout>
  );
}

function Meta({ skill, why, futureApi }: { skill?: string; why?: string; futureApi?: string }) {
  if (!skill && !why && !futureApi) return null;
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {skill && (
        <MetaCard label="Skill demonstrated" body={skill} accent="cyan" />
      )}
      {why && <MetaCard label="Why it's useful" body={why} accent="violet" />}
      {futureApi && (
        <MetaCard label="Future API hook" body={futureApi} accent="emerald" />
      )}
    </div>
  );
}

function MetaCard({
  label,
  body,
  accent,
}: {
  label: string;
  body: ReactNode;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">
        {label}
      </p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}

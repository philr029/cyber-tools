"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

export interface GeneratorInput {
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  /** Text input by default, "textarea" for multi-line, "select" for dropdown, "number" for numeric. */
  type?: "text" | "email" | "url" | "textarea" | "select" | "number" | "date";
  defaultValue?: string;
  required?: boolean;
  /** Options for type === "select". */
  options?: { value: string; label: string }[];
  /** Optional css classes for span. */
  span?: "full" | "half";
  /** Mark password fields so they're never logged. */
  sensitive?: boolean;
}

export interface GeneratorToolProps {
  title: string;
  description: string;
  skill?: string;
  why?: string;
  futureApi?: string;
  inputs: GeneratorInput[];
  /**
   * Compute the textual output from the current input values.
   * Return null/empty to indicate nothing to show yet.
   */
  generate: (values: Record<string, string>) => string;
  /**
   * Optional richer renderable block above the textual output — typically a
   * summary card, score gauge, or coloured verdict. Receives the same values.
   */
  renderResult?: (values: Record<string, string>) => ReactNode;
  /**
   * Optional list of validation errors. If returned and non-empty, output is
   * still rendered but a notice is shown above.
   */
  validate?: (values: Record<string, string>) => string[];
  /**
   * Optional label shown on the output card. Defaults to "Generated output".
   */
  outputLabel?: string;
  /** Label shown on the right side of the output card (e.g. "Demo result"). */
  outputBadge?: string;
  /** File extension for download. Defaults to "md". */
  downloadExtension?: "md" | "txt" | "yaml" | "yml" | "json";
  /**
   * If true, output is treated as plain text (no Markdown styling note).
   */
  plainText?: boolean;
}

export default function GeneratorTool(props: GeneratorToolProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    for (const input of props.inputs) {
      obj[input.id] = input.defaultValue ?? "";
    }
    return obj;
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const output = useMemo(() => props.generate(values), [props, values]);
  const errors = useMemo(
    () => (props.validate ? props.validate(values) : []),
    [props, values],
  );
  const result = useMemo(
    () => (props.renderResult ? props.renderResult(values) : null),
    [props, values],
  );

  function setInput(id: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setValues((prev) => ({ ...prev, [id]: e.target.value }));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const ext = props.downloadExtension ?? "md";
    const mime =
      ext === "json" ? "application/json" :
      ext === "yaml" || ext === "yml" ? "text/yaml" :
      ext === "txt" ? "text/plain" :
      "text/markdown";
    const blob = new Blob([output], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = props.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    a.href = url;
    a.download = `${slug || "result"}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolPageLayout title={props.title} description={props.description}>
      <GeneratorMeta skill={props.skill} why={props.why} futureApi={props.futureApi} />

      <div className="mb-6 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45 mb-3">
          Inputs
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {props.inputs.map((input) => {
            const isFull = input.span === "full" || input.type === "textarea";
            const wrapClass = isFull ? "sm:col-span-2" : "";
            return (
              <label key={input.id} className={`block text-xs text-white/60 ${wrapClass}`}>
                <span className="block mb-1 font-medium text-white/70">
                  {input.label}
                  {input.required && <span className="ml-1 text-rose-400">*</span>}
                </span>
                {input.type === "textarea" ? (
                  <textarea
                    value={values[input.id] ?? ""}
                    onChange={(e) => setInput(input.id, e)}
                    placeholder={input.placeholder}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 resize-y min-h-[100px]"
                  />
                ) : input.type === "select" ? (
                  <select
                    value={values[input.id] ?? ""}
                    onChange={(e) => setInput(input.id, e)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  >
                    <option value="">Select…</option>
                    {(input.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={input.sensitive ? "password" : (input.type ?? "text")}
                    value={values[input.id] ?? ""}
                    onChange={(e) => setInput(input.id, e)}
                    placeholder={input.placeholder}
                    autoComplete={input.sensitive ? "new-password" : undefined}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                )}
                {input.hint && (
                  <span className="mt-1 block text-[11px] text-white/45">{input.hint}</span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs leading-6 text-amber-200">
          <p className="font-semibold mb-1">Heads up:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      {result && (
        <div className="mb-6">
          {result}
        </div>
      )}

      <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
            {props.outputLabel ?? "Generated output"}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-300/80">
              {props.outputBadge ?? "Demo result · safe to copy/share"}
            </span>
            <button
              type="button"
              onClick={copy}
              className="rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-400 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={download}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:text-white hover:border-white/30 transition-colors"
            >
              Download
            </button>
          </div>
        </div>
        <pre className="max-h-[460px] overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 font-mono whitespace-pre-wrap">
{output || "Fill in the inputs above to generate output."}
        </pre>
      </div>
    </ToolPageLayout>
  );
}

function GeneratorMeta({ skill, why, futureApi }: { skill?: string; why?: string; futureApi?: string }) {
  if (!skill && !why && !futureApi) return null;
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {skill && <MetaCard label="Skill demonstrated" body={skill} accent="cyan" />}
      {why && <MetaCard label="Why it's useful" body={why} accent="violet" />}
      {futureApi && <MetaCard label="Future API hook" body={futureApi} accent="emerald" />}
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}

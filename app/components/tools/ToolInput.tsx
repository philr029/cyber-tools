"use client";

import { useState, type FormEvent } from "react";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";
import type { ValidationResult } from "@/lib/validators";
import SecuritySignals from "@/app/components/tools/SecuritySignals";

interface ToolInputProps {
  placeholder: string;
  buttonLabel?: string;
  validate?: (value: string) => ValidationResult;
  onSubmit: (value: string) => void;
  loading?: boolean;
  externalDisabled?: boolean;
  hint?: string;
  examples?: string[];
  showTlsIndicator?: boolean;
  showTrustSignals?: boolean;
}

export default function ToolInput({
  placeholder,
  buttonLabel = "Look Up",
  validate,
  onSubmit,
  loading = false,
  externalDisabled = false,
  hint,
  examples = [],
  showTlsIndicator = false,
  showTrustSignals = true,
}: ToolInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(sanitizeSingleLineInput(e.target.value, { trim: false }));
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = sanitizeSingleLineInput(value);
    if (!trimmed) return;

    if (validate) {
      const result = validate(trimmed);
      if (!result.ok) {
        setError(result.message);
        return;
      }
    }

    setError(null);
    onSubmit(trimmed);
  }

  return (
    <div className="mb-6 rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/35">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className={`w-full rounded-2xl border bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/28 focus:outline-none focus:ring-2 focus:ring-cyan-400/25 transition ${error ? "border-rose-500/40" : "border-white/10"}`}
              disabled={loading || externalDisabled}
              aria-describedby={error ? "input-error" : hint ? "input-hint" : undefined}
            />
          </div>
          <button
            type="submit"
            disabled={loading || externalDisabled || !value.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.2)] transition hover:from-cyan-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading…
              </>
            ) : buttonLabel}
          </button>
        </div>

        {error ? <p id="input-error" className="mt-2 pl-1 text-xs text-rose-300">{error}</p> : null}
        {!error && hint ? <p id="input-hint" className="mt-2 pl-1 text-xs text-white/45">{hint}</p> : null}
        {(showTrustSignals || showTlsIndicator) && (
          <div className="mt-4">
            <SecuritySignals compact />
          </div>
        )}
        {!error && examples.length > 0 && (
          <p className="mt-3 pl-1 text-xs text-white/45">
            Try:{" "}
            {examples.map((ex, i) => (
              <span key={ex}>
                {i > 0 && " · "}
                <button
                  type="button"
                  onClick={() => {
                    setValue(ex);
                    setError(null);
                  }}
                  className="text-cyan-200 transition hover:text-cyan-100 hover:underline"
                >
                  {ex}
                </button>
              </span>
            ))}
          </p>
        )}
      </form>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";
import type { ValidationResult } from "@/lib/validators";

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
    <div className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] shadow-[0_4px_24px_rgba(0,0,0,0.3)] px-5 py-5 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
              className={`w-full pl-11 pr-4 py-3.5 bg-[#0b0f1a] border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition ${error ? "border-red-500/50" : "border-[#1e2d4a]"}`}
              disabled={loading || externalDisabled}
              aria-describedby={error ? "input-error" : hint ? "input-hint" : undefined}
            />
          </div>
          <button
            type="submit"
            disabled={loading || externalDisabled || !value.trim()}
            className="px-5 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0f1629] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading…
              </>
            ) : buttonLabel}
          </button>
        </div>

        {error && (
          <p id="input-error" className="mt-2 text-xs text-red-400 pl-1">{error}</p>
        )}
        {!error && hint && (
          <p id="input-hint" className="mt-2 text-xs text-slate-500 pl-1">{hint}</p>
        )}
        {showTlsIndicator && (
          <p className="mt-2 text-xs text-emerald-400 pl-1 inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 1.5A4.5 4.5 0 005.5 6v1.25H5A2 2 0 003 9.25v6.5a2 2 0 002 2h10a2 2 0 002-2v-6.5a2 2 0 00-2-2h-.5V6A4.5 4.5 0 0010 1.5zM7 6a3 3 0 116 0v1.25H7V6z" clipRule="evenodd" />
            </svg>
            Data sent over HTTPS/TLS
          </p>
        )}
        {!error && examples.length > 0 && (
          <p className="mt-2 text-xs text-slate-500 pl-1">
            Try:{" "}
            {examples.map((ex, i) => (
              <span key={ex}>
                {i > 0 && " · "}
                <button
                  type="button"
                  onClick={() => { setValue(ex); setError(null); }}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
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

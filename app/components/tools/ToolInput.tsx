"use client";

import { useState, type FormEvent } from "react";
import type { ValidationResult } from "@/lib/validators";

interface ToolInputProps {
  placeholder: string;
  buttonLabel?: string;
  validate?: (value: string) => ValidationResult;
  onSubmit: (value: string) => void;
  loading?: boolean;
  hint?: string;
  examples?: string[];
}

export default function ToolInput({
  placeholder,
  buttonLabel = "Look Up",
  validate,
  onSubmit,
  loading = false,
  hint,
  examples = [],
}: ToolInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
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
              onChange={(e) => { setValue(e.target.value); setError(null); }}
              placeholder={placeholder}
              className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error ? "border-red-300" : "border-gray-200"}`}
              disabled={loading}
              aria-describedby={error ? "input-error" : hint ? "input-hint" : undefined}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="px-5 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
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
          <p id="input-error" className="mt-2 text-xs text-red-600 pl-1">{error}</p>
        )}
        {!error && hint && (
          <p id="input-hint" className="mt-2 text-xs text-gray-400 pl-1">{hint}</p>
        )}
        {!error && examples.length > 0 && (
          <p className="mt-2 text-xs text-gray-400 pl-1">
            Try:{" "}
            {examples.map((ex, i) => (
              <span key={ex}>
                {i > 0 && " · "}
                <button
                  type="button"
                  onClick={() => { setValue(ex); setError(null); }}
                  className="text-blue-500 hover:underline"
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

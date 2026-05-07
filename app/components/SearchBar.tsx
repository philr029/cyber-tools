"use client";

import { useState, type FormEvent } from "react";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = sanitizeSingleLineInput(value);
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        {/* Globe icon */}
        <span className="absolute left-4 flex items-center pointer-events-none text-slate-500">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(sanitizeSingleLineInput(e.target.value, { trim: false }))}
          placeholder="Enter IP, domain, or URL..."
          className="w-full pl-12 pr-36 py-4 bg-[#0f1629] border border-[#1e2d4a] rounded-2xl text-sm text-slate-100 placeholder-slate-500 shadow-[0_0_0_1px_rgba(6,182,212,0.1),0_4px_24px_rgba(0,0,0,0.3)] focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_0_1px_rgba(6,182,212,0.3),0_0_20px_rgba(6,182,212,0.1),0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-200"
          disabled={loading}
          aria-label="IP address, domain, or URL to scan"
        />
        {/* Shield icon right side */}
        <span className="absolute right-28 flex items-center pointer-events-none text-slate-600">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0f1629] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              Scan
            </>
          )}
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500 text-center">
        Try:{" "}
        <button type="button" onClick={() => setValue("8.8.8.8")} className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">8.8.8.8</button>
        {" · "}
        <button type="button" onClick={() => setValue("google.com")} className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">google.com</button>
        {" · "}
        <button type="button" onClick={() => setValue("cloudflare.com")} className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">cloudflare.com</button>
      </p>
    </form>
  );
}


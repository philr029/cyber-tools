"use client";

import { useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3 w-full">
        <div className="relative flex-1">
          {/* Search icon */}
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
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
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter IP address or domain (e.g. 8.8.8.8, example.com)"
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={loading}
            aria-label="IP address or domain"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-6 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Scanning…
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a.75.75 0 01.75.75v6.5h6.5a.75.75 0 010 1.5h-6.5v6.5a.75.75 0 01-1.5 0v-6.5h-6.5a.75.75 0 010-1.5h6.5v-6.5A.75.75 0 0110 1z"
                  clipRule="evenodd"
                />
              </svg>
              Scan
            </>
          )}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400 pl-1">
        Try: <button type="button" onClick={() => { setValue("8.8.8.8"); }} className="text-blue-500 hover:underline">8.8.8.8</button>
        {" · "}
        <button type="button" onClick={() => { setValue("example.com"); }} className="text-blue-500 hover:underline">example.com</button>
        {" · "}
        <button type="button" onClick={() => { setValue("malicious-test.xyz"); }} className="text-blue-500 hover:underline">malicious-test.xyz</button>
      </p>
    </form>
  );
}

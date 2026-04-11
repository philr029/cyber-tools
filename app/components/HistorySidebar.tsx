"use client";

import type { HistoryEntry } from "@/lib/types";
import HistoryRow from "@/app/components/HistoryRow";

const QUICK_EXAMPLES = [
  { query: "8.8.8.8", label: "8.8.8.8" },
  { query: "google.com", label: "google.com" },
  { query: "cloudflare.com", label: "cloudflare.com" },
];

interface Props {
  history: HistoryEntry[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

export default function HistorySidebar({ history, onSelect, onClear }: Props) {
  return (
    <div
      id="history"
      className="bg-[#0f1629] rounded-2xl border border-[#1e2d4a] overflow-hidden sticky top-20 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#162038]">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-slate-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-sm font-semibold text-slate-300">Recent Lookups</h2>
          {history.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-slate-900 bg-cyan-400 rounded-full">
              {history.length}
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            aria-label="Clear history"
          >
            Clear
          </button>
        )}
      </div>

      <div className="px-1 py-2 max-h-72 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <svg
              className="w-8 h-8 text-slate-700 mb-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-slate-500 mb-3">No lookups yet</p>
            <div className="space-y-1.5 w-full">
              {QUICK_EXAMPLES.map((ex) => (
                <button
                  key={ex.query}
                  onClick={() => onSelect(ex.query)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/20 hover:bg-cyan-500/10 border border-[#1e2d4a] hover:border-cyan-500/20 text-xs text-slate-400 hover:text-cyan-400 transition-all group"
                >
                  <span className="font-mono">{ex.label}</span>
                  <svg
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          history.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  );
}

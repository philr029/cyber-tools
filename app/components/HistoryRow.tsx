import type { HistoryEntry } from "@/lib/types";
import StatusBadge from "@/app/components/ui/StatusBadge";

interface HistoryRowProps {
  entry: HistoryEntry;
  onSelect: (query: string) => void;
}

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function HistoryRow({ entry, onSelect }: HistoryRowProps) {
  return (
    <button
      onClick={() => onSelect(entry.query)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group text-left"
      aria-label={`Re-scan ${entry.query}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Globe / network icon */}
        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{entry.query}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatTime(entry.timestamp)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <StatusBadge status={entry.overallStatus} size="sm" />
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors"
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
      </div>
    </button>
  );
}

"use client";

const EXAMPLES = [
  { query: "8.8.8.8", label: "Google DNS", badge: "Safe", badgeClass: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
  { query: "google.com", label: "Google.com", badge: "Safe", badgeClass: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
  { query: "cloudflare.com", label: "Cloudflare", badge: "Safe", badgeClass: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
];

interface Props {
  onExample: (query: string) => void;
}

export default function EmptyState({ onExample }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--ss-accent-soft)] border border-[color-mix(in_srgb,var(--ss-accent)_28%,transparent)] mb-6 shadow-[0_12px_40px_color-mix(in_srgb,var(--ss-accent)_12%,transparent)]">
        <svg
          className="w-8 h-8 text-[var(--ss-accent)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      </div>
      <h2 className="text-base font-semibold tracking-tight text-[var(--ss-text)] mb-1.5">Start a lookup</h2>
      <p className="text-sm text-[var(--ss-text-secondary)] max-w-sm mb-8 leading-relaxed">
        Enter any IP address, domain, or URL above for a comprehensive security analysis.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.query}
            type="button"
            onClick={() => onExample(ex.query)}
            className="flex flex-col items-start gap-1 p-4 ss-card card-lift rounded-2xl text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ss-page)]"
          >
            <span className="text-sm font-semibold text-[var(--ss-text)] group-hover:text-[var(--ss-accent)] motion-safe:transition-colors">
              {ex.label}
            </span>
            <span className="text-xs font-mono text-[var(--ss-text-secondary)]">{ex.query}</span>
            <span className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${ex.badgeClass}`}>
              {ex.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

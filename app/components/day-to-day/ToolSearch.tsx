"use client";

export default function ToolSearch({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1 max-w-xl">
      <label htmlFor={id} className="sr-only">
        Search tools
      </label>
      <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ss-accent)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.517 3.516a1 1 0 01-1.414 1.414l-3.516-3.517A7 7 0 012 9z"
          clipRule="evenodd"
        />
      </svg>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, topic, or keyword…"
        className="w-full rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] pl-10 pr-4 py-3 text-sm text-[var(--ss-text)] placeholder:text-[color-mix(in_srgb,var(--ss-text-secondary)_55%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--ss-ring)] motion-safe:transition-shadow motion-safe:duration-200"
      />
    </div>
  );
}

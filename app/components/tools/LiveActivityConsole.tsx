import type { ActivityEntry } from "@/lib/use-activity-console";

const LEVEL_STYLES: Record<ActivityEntry["level"], string> = {
  info: "text-cyan-300",
  success: "text-emerald-300",
  warning: "text-amber-300",
  error: "text-rose-300",
};

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LiveActivityConsole({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section className="mt-8 rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Live Activity Console</p>
          <p className="mt-1 text-sm text-white/60">Read-only execution trail for sanitization, transport, and request status.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/50">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Read Only
        </span>
      </div>
      <div className="max-h-72 overflow-auto px-5 py-4 font-mono text-xs leading-6">
        {entries.length === 0 ? (
          <p className="text-white/40">[IDLE] Waiting for a request.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-1 border-b border-white/6 py-2 last:border-b-0 sm:flex-row sm:items-start sm:gap-3">
              <span className="shrink-0 text-white/35">{formatTimestamp(entry.timestamp)}</span>
              <span className={`shrink-0 font-semibold uppercase tracking-[0.22em] ${LEVEL_STYLES[entry.level]}`}>
                [{entry.level}]
              </span>
              <span className="text-white/70">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

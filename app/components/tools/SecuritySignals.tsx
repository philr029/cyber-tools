import type { ReactNode } from "react";

interface SecuritySignalsProps {
  compact?: boolean;
}

function SignalBadge({ icon, label, tone }: { icon: ReactNode; label: string; tone: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase ${tone}`}>
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-black/20">
        {icon}
      </span>
      {label}
    </span>
  );
}

export default function SecuritySignals({ compact = false }: SecuritySignalsProps) {
  const containerClass = compact ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2.5";

  return (
    <div className={containerClass}>
      <SignalBadge
        tone="border-emerald-500/20 bg-emerald-500/8 text-emerald-200"
        label="Connection Encrypted"
        icon={
          <svg className="h-3.5 w-3.5 text-emerald-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 1.5A4.5 4.5 0 005.5 6v1.25H5A2 2 0 003 9.25v6.5a2 2 0 002 2h10a2 2 0 002-2v-6.5a2 2 0 00-2-2h-.5V6A4.5 4.5 0 0010 1.5zM7 6a3 3 0 116 0v1.25H7V6z" clipRule="evenodd" />
          </svg>
        }
      />
      <SignalBadge
        tone="border-cyan-500/20 bg-cyan-500/8 text-cyan-100"
        label="No-Logs Policy"
        icon={
          <svg className="h-3.5 w-3.5 text-cyan-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
          </svg>
        }
      />
    </div>
  );
}

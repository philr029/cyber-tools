import Link from "next/link";
import type { ReactNode } from "react";

interface SecuritySuiteCardProps {
  href: string;
  title: string;
  description: string;
  category: string;
  badge: string;
  cornerTag?: string;
  size?: "square" | "wide";
  emphasis?: "cyan" | "violet" | "emerald" | "amber" | "rose";
  active?: boolean;
  preview?: boolean;
  icon: ReactNode;
}

const EMPHASIS_STYLES: Record<NonNullable<SecuritySuiteCardProps["emphasis"]>, string> = {
  cyan: "from-cyan-500/18 via-cyan-400/8 to-transparent text-cyan-200",
  violet: "from-violet-500/18 via-violet-400/8 to-transparent text-violet-200",
  emerald: "from-emerald-500/18 via-emerald-400/8 to-transparent text-emerald-200",
  amber: "from-amber-500/18 via-amber-400/8 to-transparent text-amber-200",
  rose: "from-rose-500/18 via-rose-400/8 to-transparent text-rose-200",
};

export default function SecuritySuiteCard({
  href,
  title,
  description,
  category,
  badge,
  cornerTag,
  size = "square",
  emphasis = "cyan",
  active = false,
  preview = false,
  icon,
}: SecuritySuiteCardProps) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-[rgba(255,255,255,0.045)] ${size === "wide" ? "md:col-span-2" : ""}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${EMPHASIS_STYLES[emphasis]}`} aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/8" aria-hidden="true" />
      {cornerTag && (
        <span className="absolute right-4 top-4 z-10 max-w-[12rem] rounded-full border border-amber-300/30 bg-amber-500/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-amber-100">
          {cornerTag}
        </span>
      )}
      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            {icon}
          </div>
          <div className="flex flex-wrap justify-end gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{category}</span>
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{badge}</span>
            {active && <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-amber-200">Active</span>}
            {preview && <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-violet-200">Preview</span>}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-white transition group-hover:text-cyan-100">{title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-white/62">{description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-white/45">
          <span>{size === "wide" ? "Priority Suite" : "Security Module"}</span>
          <span className="inline-flex items-center gap-2 text-white/60 transition group-hover:text-cyan-200">
            Open
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

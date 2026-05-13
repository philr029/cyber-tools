"use client";

import { useId } from "react";

type BrandLogoProps = {
  /** Text beside mark */
  showWordmark?: boolean;
  /** Smaller for mobile */
  compact?: boolean;
  className?: string;
};

/**
 * Original mark — abstract shield / scope glyph (not a third-party trademark).
 */
function LogoMark({ className = "w-5 h-5" }: { className?: string }) {
  const gid = useId().replace(/:/g, "");
  const gradId = `ss-logo-grad-${gid}`;
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--ss-accent)" />
          <stop offset="1" stopColor="var(--accent-blue)" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="8" fill={`url(#${gradId})`} opacity="0.22" />
      <path
        d="M16 5.2 26 9.4v7.4c0 5.6-3.8 10.6-10 13.2-.3.1-.6.1-.9 0C9 27.4 5 22.4 5 16.8V9.4L16 5.2Z"
        stroke={`url(#${gradId})`}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="color-mix(in_srgb,var(--ss-page)_35%,transparent)"
      />
      <path
        d="M16 11v10M12.5 16.5h7"
        stroke={`url(#${gradId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BrandLogo({ showWordmark = true, compact = false, className = "" }: BrandLogoProps) {
  const box = compact ? "w-8 h-8 rounded-[0.7rem]" : "w-9 h-9 rounded-[0.85rem]";
  return (
    <span className={`inline-flex items-center gap-2.5 min-w-0 ${className}`}>
      <span
        className={`flex flex-shrink-0 items-center justify-center ${box} bg-gradient-to-br from-[var(--ss-accent)] to-[var(--accent-blue)] shadow-[0_10px_28px_color-mix(in_srgb,var(--ss-accent)_32%,transparent)] motion-safe:transition-[box-shadow,transform] motion-safe:duration-300 group-hover:shadow-[0_14px_40px_color-mix(in_srgb,var(--ss-accent)_48%,transparent)] motion-safe:group-hover:scale-[1.03] brand-logo-mark`}
      >
        <LogoMark className={compact ? "w-4 h-4 text-white" : "w-5 h-5 text-white"} />
      </span>
      {showWordmark ? (
        <span className="flex flex-col leading-none min-w-0">
          <span
            className={`font-semibold tracking-tight text-[var(--ss-text)] truncate ${compact ? "text-sm" : "text-base sm:text-lg"}`}
          >
            <span className="text-[var(--ss-text)]">Secure</span>
            <span className="bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] bg-clip-text text-transparent">Scope</span>
          </span>
          {!compact && (
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ss-text-secondary)] mt-0.5 hidden sm:block">
              Cyber toolkit · command centre
            </span>
          )}
        </span>
      ) : null}
    </span>
  );
}

export function BrandMarkOnly({ className }: { className?: string }) {
  return (
    <span className={`inline-flex ${className ?? ""}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] bg-gradient-to-br from-[var(--ss-accent)] to-[var(--accent-blue)] shadow-[0_8px_22px_color-mix(in_srgb,var(--ss-accent)_28%,transparent)]">
        <LogoMark />
      </span>
    </span>
  );
}

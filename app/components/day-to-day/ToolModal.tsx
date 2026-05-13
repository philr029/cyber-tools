"use client";

import { useEffect, useId, useRef } from "react";

export default function ToolModal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center p-0 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--ss-page)_55%,#000)] backdrop-blur-md motion-safe:animate-ss-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="relative w-full max-w-3xl max-h-[min(92dvh,900px)] sm:max-h-[90vh] flex flex-col rounded-t-[1.5rem] sm:rounded-[1.5rem] border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-elevated-solid)_96%,transparent)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] motion-safe:animate-ss-modal-panel"
      >
        <header className="flex-shrink-0 flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-[var(--ss-border)]">
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="text-lg font-semibold text-[var(--ss-text)] tracking-tight truncate">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-sm text-[var(--ss-text-secondary)] line-clamp-2">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 flex items-center justify-center size-10 rounded-full border border-[var(--ss-border)] text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] motion-safe:transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

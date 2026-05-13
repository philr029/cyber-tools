"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import { useFocusTrap } from "@/components/messaging/use-focus-trap";

export interface PlatformModalProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  /** When false, backdrop clicks do nothing (safer for confirmations). Default true. */
  closeOnBackdrop?: boolean;
  /** Visually stronger panel for warnings */
  tone?: "default" | "security";
}

export default function PlatformModal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  tone = "default",
}: PlatformModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useFocusTrap(open, panelRef);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  if (!open || typeof document === "undefined") return null;

  const panelRing =
    tone === "security"
      ? "ring-1 ring-amber-500/35 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      : "ring-1 ring-[var(--ss-border-strong)] shadow-[0_24px_80px_rgba(0,0,0,0.35)]";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] animate-ss-modal-backdrop"
        onClick={() => {
          if (closeOnBackdrop) onClose();
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`relative z-[101] mb-0 flex max-h-[min(92vh,880px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[var(--ss-border)] bg-[var(--ss-elevated-solid)] animate-ss-modal-panel sm:mb-0 sm:rounded-3xl ${panelRing}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--ss-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-[var(--ss-text)]">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-sm leading-relaxed text-[var(--ss-text-secondary)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--ss-text-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] hover:text-[var(--ss-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" weight="bold" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)] px-5 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

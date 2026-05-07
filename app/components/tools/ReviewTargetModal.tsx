"use client";

import { useEffect, useMemo, useState } from "react";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";

interface ReviewTargetModalProps {
  open: boolean;
  target: string;
  targetLabel: string;
  permissionChecked: boolean;
  onPermissionChange: (checked: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ReviewTargetModal({
  open,
  target,
  targetLabel,
  permissionChecked,
  onPermissionChange,
  onCancel,
  onConfirm,
  loading = false,
}: ReviewTargetModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const safeTarget = useMemo(() => sanitizeSingleLineInput(target, { maxLength: 4096 }), [target]);
  const targetVerified = safeTarget.length > 0 && confirmationInput === safeTarget;

  useEffect(() => {
    if (!open) {
      setConfirmationInput("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close review target modal"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Review target"
        className="relative w-full max-w-xl rounded-[30px] border border-white/10 bg-[#050505] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Two-Step Confirmation</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Review Target & Confirm Authorization</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Verify the destination exactly as shown below, then acknowledge that you have permission to test it.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Step 1 · Verify Target</p>
            <p className="mt-2 break-all font-mono text-sm text-cyan-200">{safeTarget || "—"}</p>
            <label className="mt-4 block">
              <span className="text-xs text-white/55">Type the target exactly to continue</span>
              <input
                type="text"
                value={confirmationInput}
                onChange={(event) => setConfirmationInput(sanitizeSingleLineInput(event.target.value, { trim: false, maxLength: 4096 }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                placeholder={safeTarget}
              />
            </label>
            <p className={`mt-2 text-xs ${targetVerified ? "text-emerald-300" : "text-white/40"}`}>
              {targetVerified ? "Target verified." : "Awaiting exact target match."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Step 2 · Permission to Test</p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/8 p-4">
              <input
                type="checkbox"
                checked={permissionChecked}
                onChange={(e) => onPermissionChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/15 bg-black/30 text-cyan-400 focus:ring-cyan-400"
              />
              <span className="text-sm leading-6 text-cyan-50">
                I confirm that I am authorized to test this target and understand this action generates live network traffic.
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!targetVerified || !permissionChecked || loading}
            className="rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Starting…" : `Confirm ${targetLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}

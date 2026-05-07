"use client";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close review target modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Review target"
        className="relative w-full max-w-md rounded-2xl border border-[#1e2d4a] bg-[#0d1321] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        <h2 className="text-base font-semibold text-slate-100">Review Target</h2>
        <p className="mt-1 text-sm text-slate-400">Please confirm the destination before running this active tool.</p>

        <div className="mt-4 rounded-xl border border-[#1e2d4a] bg-[#0b0f1a] p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">{targetLabel}</p>
          <p className="mt-1 break-all text-sm font-mono text-cyan-300">{target || "—"}</p>
        </div>

        <label className="mt-4 flex items-start gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={permissionChecked}
            onChange={(e) => onPermissionChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#1e2d4a] bg-[#0b0f1a] text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-xs text-cyan-200">I have permission to scan this target.</span>
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#1e2d4a] text-slate-300 hover:text-slate-100 hover:border-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!permissionChecked || loading}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Starting…" : "Confirm & Run"}
          </button>
        </div>
      </div>
    </div>
  );
}

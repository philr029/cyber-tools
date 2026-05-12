interface LoadingSpinnerProps {
  label?: string;
  sublabel?: string;
}

export default function LoadingSpinner({
  label = "Scanning target…",
  sublabel = "This may take a few seconds.",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="relative w-12 h-12 mb-5" role="status" aria-live="polite">
        <div className="absolute inset-0 rounded-full border-2 border-[color-mix(in_srgb,var(--ss-accent)_15%,transparent)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--ss-accent)] motion-safe:animate-spin" />
      </div>
      <p className="text-sm font-semibold tracking-tight text-[var(--ss-text)]">{label}</p>
      <p className="text-xs text-[var(--ss-text-secondary)] mt-1.5 max-w-xs leading-relaxed">{sublabel}</p>
    </div>
  );
}

interface LoadingSpinnerProps {
  label?: string;
  sublabel?: string;
}

export default function LoadingSpinner({
  label = "Scanning target…",
  sublabel = "This may take a few seconds.",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-cyan-500 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-200">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
    </div>
  );
}

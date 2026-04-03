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
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
    </div>
  );
}

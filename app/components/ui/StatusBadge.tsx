import type { StatusLevel } from "@/lib/types";

interface StatusBadgeProps {
  status: StatusLevel;
  size?: "sm" | "md";
}

const CONFIG: Record<
  StatusLevel,
  { label: string; classes: string; dot: string }
> = {
  safe: {
    label: "Safe",
    classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  warning: {
    label: "Warning",
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  },
  risk: {
    label: "Risk",
    classes: "bg-red-50 text-red-700 ring-1 ring-red-200",
    dot: "bg-red-500",
  },
  unknown: {
    label: "Unknown",
    classes: "bg-gray-50 text-gray-600 ring-1 ring-gray-200",
    dot: "bg-gray-400",
  },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { label, classes, dot } = CONFIG[status];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

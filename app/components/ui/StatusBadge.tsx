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
    classes: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30",
    dot: "bg-emerald-400",
  },
  warning: {
    label: "Warning",
    classes: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30",
    dot: "bg-amber-400",
  },
  risk: {
    label: "Risk",
    classes: "bg-red-500/10 text-red-400 ring-1 ring-red-500/30",
    dot: "bg-red-400",
  },
  unknown: {
    label: "Unknown",
    classes: "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30",
    dot: "bg-slate-500",
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

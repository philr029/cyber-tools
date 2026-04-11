import type { ReactNode } from "react";

interface ToolEmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
}

const DefaultIcon = (
  <svg
    className="w-10 h-10 text-cyan-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.804 15.803z"
    />
  </svg>
);

export default function ToolEmptyState({
  icon = DefaultIcon,
  title = "Enter a target to get started",
  description = "Results will appear here once you submit a query.",
}: ToolEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-5 shadow-[0_0_20px_rgba(6,182,212,0.08)]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
    </div>
  );
}

import type { ReactNode } from "react";

interface CardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export default function Card({
  title,
  icon,
  children,
  className = "",
  headerRight,
}: CardProps) {
  return (
    <div
      className={`bg-[#0f1629] rounded-2xl border border-[#1e2d4a] overflow-hidden card-lift shadow-[0_4px_24px_rgba(0,0,0,0.3)] ${className}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#162038]">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400">
              {icon}
            </span>
          )}
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

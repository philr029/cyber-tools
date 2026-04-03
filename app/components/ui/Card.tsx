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
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
              {icon}
            </span>
          )}
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

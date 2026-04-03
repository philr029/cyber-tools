"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import MockDataBanner from "@/app/components/ui/MockDataBanner";

interface ToolPageLayoutProps {
  title: string;
  description: string;
  isMock?: boolean | null;
  children: ReactNode;
}

const BackIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

export default function ToolPageLayout({
  title,
  description,
  isMock,
  children,
}: ToolPageLayoutProps) {
  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            {BackIcon}
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-800">{title}</span>
        </div>

        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-lg">{description}</p>
          </div>
          {isMock !== null && isMock !== undefined && (
            <div className="flex-shrink-0 mt-1">
              <MockDataBanner isMock={isMock} />
            </div>
          )}
        </div>

        {children}
      </div>
    </main>
  );
}

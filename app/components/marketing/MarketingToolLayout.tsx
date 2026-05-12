"use client";

import type { ReactNode } from "react";
import Link from "next/link";

const BackIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
      clipRule="evenodd"
    />
  </svg>
);

interface MarketingToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function MarketingToolLayout({ title, description, children }: MarketingToolLayoutProps) {
  return (
    <main className="flex-1 bg-[#050505]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-transparent p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/45">
            <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-200">
              {BackIcon}
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/marketing-tools" className="transition-colors hover:text-cyan-200">
              Marketing Tools
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-white/70">{title}</span>
          </div>

          <header className="mb-8 border-b border-white/10 pb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Marketing tool</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">{description}</p>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}

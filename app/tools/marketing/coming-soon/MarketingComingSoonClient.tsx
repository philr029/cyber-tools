"use client";

import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { getMarketingToolBySlug } from "@/lib/marketing-tools/catalog";
import { MarketingCategoryIcon } from "@/app/components/marketing/MarketingCategoryIcon";

export default function MarketingComingSoonClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const tool = getMarketingToolBySlug(slug);

  const title = tool?.name ?? "Marketing tool";
  const categoryId = tool?.categoryId;
  const status = tool?.status ?? "coming-soon";

  return (
    <main className="flex-1 bg-[#050505]">
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-10">
          {categoryId ? (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/40 ring-1 ring-white/10">
              <MarketingCategoryIcon id={categoryId} />
            </div>
          ) : (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/20" aria-hidden>
              <Sparkle className="h-7 w-7" weight="duotone" />
            </div>
          )}

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
            {status === "beta" ? "Beta preview" : "Marketing tools"}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            {status === "beta"
              ? "This module is in beta on our roadmap. The full experience is shipping soon — thank you for your patience."
              : "We are building this experience with the same care as the rest of SecureScope. Check back soon, or explore the tools that are already live."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/marketing-tools"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(6,182,212,0.22)] transition hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              Back to Marketing Tools
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              All tools
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import MarketingComingSoonClient from "./MarketingComingSoonClient";

export const metadata: Metadata = {
  title: "Coming soon — Marketing Tools",
  description: "This marketing tool is on the roadmap. Browse the rest of the SecureScope marketing toolkit.",
};

export default function MarketingComingSoonPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-[#050505] px-4 py-20">
          <p className="text-sm text-white/50">Loading…</p>
        </main>
      }
    >
      <MarketingComingSoonClient />
    </Suspense>
  );
}

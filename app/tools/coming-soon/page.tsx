import type { Metadata } from "next";
import { Suspense } from "react";
import ToolsComingSoonClient from "./ToolsComingSoonClient";

export const metadata: Metadata = {
  title: "Coming soon — Tools",
  description: "This SecureScope module is on the roadmap. Browse live tools and the full toolkit index.",
};

export default function ToolsComingSoonPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-[var(--ss-page)] px-4 py-20">
          <p className="text-sm text-[var(--ss-text-secondary)]">Loading…</p>
        </main>
      }
    >
      <ToolsComingSoonClient />
    </Suspense>
  );
}

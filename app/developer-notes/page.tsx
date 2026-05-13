import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developer notes – SecureScope",
  description: "High-level architecture for contributors: Next.js App Router, auth, messaging, and tools catalog.",
};

export default function DeveloperNotesPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-14 animate-page-enter">
      <h1 className="text-3xl font-semibold text-[var(--ss-text)]">Developer notes</h1>
      <p className="mt-3 text-sm text-[var(--ss-text-secondary)] leading-relaxed">
        SecureScope is a Next.js 16 App Router project. UI tokens live in <code className="text-xs font-mono">app/globals.css</code>.
        Navigation data is split between <code className="text-xs font-mono">lib/navigation/app-menu.ts</code> and the tool catalog in{" "}
        <code className="text-xs font-mono">lib/tools/site-catalog.ts</code>.
      </p>
      <ul className="mt-8 space-y-3 text-sm text-[var(--ss-text-secondary)] list-disc pl-5">
        <li>Auth: Supabase via <code className="font-mono text-xs">lib/auth-context.tsx</code> and middleware in <code className="font-mono text-xs">proxy.ts</code>.</li>
        <li>Messaging: banners/popups under <code className="font-mono text-xs">components/messaging/</code> with configs in <code className="font-mono text-xs">lib/messaging/</code>.</li>
        <li>Forms: client validation in <code className="font-mono text-xs">PlatformForm.tsx</code>, server handler in <code className="font-mono text-xs">app/api/platform-forms/route.ts</code>.</li>
        <li>Day-to-day hub: client panels under <code className="font-mono text-xs">app/components/day-to-day/</code>.</li>
      </ul>
      <p className="mt-8 text-sm">
        <Link href="/docs" className="text-[var(--ss-accent)] font-semibold hover:underline">
          ← Back to docs
        </Link>
      </p>
    </main>
  );
}

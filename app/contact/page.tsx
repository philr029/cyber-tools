import type { Metadata } from "next";
import Link from "next/link";
import PlatformForm from "@/components/messaging/PlatformForm";

export const metadata: Metadata = {
  title: "Contact – SecureScope",
  description: "Get in touch about SecureScope, enterprise pilots, and product feedback.",
};

export default function ContactPage() {
  return (
    <main className="flex-1 bg-[var(--ss-page)] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-3xl">Contact</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ss-text-secondary)]">
          For sales, security review packets, or pilot access, use the enterprise page. You can also send a structured
          request below — submissions are validated server-side; connect <code className="text-xs">FORM_WEBHOOK_URL</code>{" "}
          in production to forward to your inbox or CRM.
        </p>

        <div className="mt-10 space-y-4 rounded-2xl border border-[var(--ss-border)] bg-[var(--ss-elevated-solid)] p-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--ss-text)]">Enterprise & pilots</h2>
            <p className="text-sm text-[var(--ss-text-secondary)] mt-1">Plans, procurement-friendly summaries, and rollout support.</p>
            <Link
              href="/enterprise"
              className="inline-flex mt-3 text-sm font-medium text-[var(--ss-accent)] hover:underline transition-colors"
            >
              Visit Enterprise →
            </Link>
          </div>
          <div className="border-t border-[var(--ss-border)] pt-4">
            <h2 className="text-sm font-semibold text-[var(--ss-text)]">Plans & limits</h2>
            <p className="text-sm text-[var(--ss-text-secondary)] mt-1">Compare tiers and daily scan allowances.</p>
            <Link href="/pricing" className="inline-flex mt-3 text-sm font-medium text-[var(--ss-accent)] hover:underline transition-colors">
              View pricing →
            </Link>
          </div>
          <div className="border-t border-[var(--ss-border)] pt-4">
            <h2 className="text-sm font-semibold text-[var(--ss-text)]">About the platform</h2>
            <p className="text-sm text-[var(--ss-text-secondary)] mt-1">Architecture, security posture, and roadmap context.</p>
            <Link href="/about" className="inline-flex mt-3 text-sm font-medium text-[var(--ss-accent)] hover:underline transition-colors">
              Read about SecureScope →
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Send a request</h2>
          <p className="mt-1 text-sm text-[var(--ss-text-secondary)]">
            Prefer{" "}
            <Link href="/feedback" className="font-medium text-[var(--ss-accent)] hover:underline">
              product feedback
            </Link>{" "}
            or{" "}
            <Link href="/report/bug" className="font-medium text-[var(--ss-accent)] hover:underline">
              bug reports
            </Link>{" "}
            when that fits better.
          </p>
          <div className="ss-card mt-6 rounded-2xl border border-[var(--ss-border)] bg-[var(--ss-elevated-solid)] p-6 sm:p-8">
            <PlatformForm formId="contact" />
          </div>
        </div>
      </div>
    </main>
  );
}

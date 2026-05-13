import type { Metadata } from "next";
import PlatformForm from "@/components/messaging/PlatformForm";

export const metadata: Metadata = {
  title: "Feedback – SecureScope",
  description: "Share feedback on SecureScope tools and workflows.",
};

export default function FeedbackPage() {
  return (
    <main className="flex-1 bg-[var(--ss-page)] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-3xl">Tool feedback</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ss-text-secondary)]">
          Tell us what worked, what felt rough, or what you wish existed. No API keys or passwords in this form.
        </p>
        <div className="ss-card mt-8 rounded-2xl border border-[var(--ss-border)] bg-[var(--ss-elevated-solid)] p-6 sm:p-8">
          <PlatformForm formId="tool-feedback" />
        </div>
      </div>
    </main>
  );
}

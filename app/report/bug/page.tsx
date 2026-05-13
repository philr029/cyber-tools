import type { Metadata } from "next";
import PlatformForm from "@/components/messaging/PlatformForm";

export const metadata: Metadata = {
  title: "Report a bug – SecureScope",
  description: "Report issues with SecureScope tools and the dashboard.",
};

export default function ReportBugPage() {
  return (
    <main className="flex-1 bg-[var(--ss-page)] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ss-text)] sm:text-3xl">Bug report</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ss-text-secondary)]">
          Include steps to reproduce and the page URL when possible. Do not paste secrets, tokens, or full exports.
        </p>
        <div className="ss-card mt-8 rounded-2xl border border-[var(--ss-border)] bg-[var(--ss-elevated-solid)] p-6 sm:p-8">
          <PlatformForm formId="bug-report" />
        </div>
      </div>
    </main>
  );
}

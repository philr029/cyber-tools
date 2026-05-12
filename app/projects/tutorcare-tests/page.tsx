import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TutorCare tests – SecureScope",
  description: "QA scaffolding for the TutorCare programme — forms, uptime, and accessibility passes.",
};

export default function TutorCareTestsPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Link href="/projects" className="text-sm font-semibold text-[var(--ss-accent)] hover:underline">
          ← Projects
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--ss-text)]">TutorCare tests</h1>
        <p className="mt-4 text-[var(--ss-text-secondary)] leading-relaxed">
          Use the Website Form Automation and Website Tester hubs to log field coverage, analytics hooks, and mobile
          breakpoints. Pair `/tools/website-form-tester` with `/tools/qa/accessibility` for release gates.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-[var(--ss-text)]">
          <li>
            <Link className="text-[var(--ss-accent)] font-semibold hover:underline" href="/tools/website-form-tester">
              Website form tester
            </Link>
          </li>
          <li>
            <Link className="text-[var(--ss-accent)] font-semibold hover:underline" href="/web-tools">
              Website testing hub
            </Link>
          </li>
          <li>
            <Link className="text-[var(--ss-accent)] font-semibold hover:underline" href="/tools/uptime-checker">
              Uptime checker
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}

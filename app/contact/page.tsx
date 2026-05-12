import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact – SecureScope",
  description: "Get in touch about SecureScope, enterprise pilots, and product feedback.",
};

export default function ContactPage() {
  return (
    <main className="flex-1 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100">Contact</h1>
        <p className="text-slate-400 mt-3 leading-relaxed">
          For sales, security review packets, or pilot access, use the enterprise page. For general product questions,
          open a discussion with your team lead or security contact — this demo app ships without a live mailbox.
        </p>

        <div className="mt-10 space-y-4 rounded-2xl border border-[#1e2d4a] bg-[#0d1321] p-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Enterprise & pilots</h2>
            <p className="text-sm text-slate-500 mt-1">Plans, procurement-friendly summaries, and rollout support.</p>
            <Link
              href="/enterprise"
              className="inline-flex mt-3 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Visit Enterprise →
            </Link>
          </div>
          <div className="border-t border-[#1e2d4a] pt-4">
            <h2 className="text-sm font-semibold text-slate-200">Plans & limits</h2>
            <p className="text-sm text-slate-500 mt-1">Compare tiers and daily scan allowances.</p>
            <Link href="/pricing" className="inline-flex mt-3 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
              View pricing →
            </Link>
          </div>
          <div className="border-t border-[#1e2d4a] pt-4">
            <h2 className="text-sm font-semibold text-slate-200">About the platform</h2>
            <p className="text-sm text-slate-500 mt-1">Architecture, security posture, and roadmap context.</p>
            <Link href="/about" className="inline-flex mt-3 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
              Read about SecureScope →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

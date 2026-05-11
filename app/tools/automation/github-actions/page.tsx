"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

const PRESETS: Record<string, string> = {
  "Every 15 min": "*/15 * * * *",
  "Every hour": "0 * * * *",
  "Daily at 03:00 UTC": "0 3 * * *",
  "Weekdays 09:00 UTC": "0 9 * * 1-5",
  "Weekly Mon 06:00 UTC": "0 6 * * 1",
};

export default function GithubActionsPage() {
  const [name, setName] = useState("Scheduled site checks");
  const [cron, setCron] = useState("0 3 * * *");
  const [job, setJob] = useState("uptime-check");
  const [step, setStep] = useState("curl -sSf https://example.com > /dev/null");

  const yaml = useMemo(() => {
    return `# .github/workflows/scheduled.yml
name: ${name}
on:
  schedule:
    - cron: "${cron}"
  workflow_dispatch:

jobs:
  ${job}:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Run check
        run: |
          ${step}
      - name: Notify on failure
        if: failure()
        run: echo "::error::${name} failed at $GITHUB_RUN_NUMBER"
`;
  }, [name, cron, job, step]);

  async function copy() {
    try { await navigator.clipboard.writeText(yaml); } catch {}
  }

  return (
    <ToolPageLayout
      title="GitHub Actions Schedule Generator"
      description="Generate a clean .github/workflows YAML for scheduled jobs — cron syntax, workflow_dispatch, and failure handling already wired in."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Workflow name" value={name} onChange={setName} />
        <Field label="Job id" value={job} onChange={setJob} hint="kebab-case, no spaces" />
        <Field label="Cron expression" value={cron} onChange={setCron} mono hint="UTC. Example: 0 3 * * * = daily 03:00 UTC" />
        <Field label="Step command" value={step} onChange={setStep} mono />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([label, expr]) => (
          <button
            key={label}
            type="button"
            onClick={() => setCron(expr)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              cron === expr
                ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
                : "border-white/10 bg-white/5 text-white/70 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Demo YAML</p>
          <button onClick={copy} className="rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-400">Copy YAML</button>
        </div>
        <pre className="max-h-96 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 font-mono whitespace-pre-wrap">{yaml}</pre>
      </div>
    </ToolPageLayout>
  );
}

function Field({ label, value, onChange, hint, mono }: { label: string; value: string; onChange: (v: string) => void; hint?: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-white/70 mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${mono ? "font-mono text-cyan-100" : ""}`}
      />
      {hint && <span className="mt-1 block text-[11px] text-white/45">{hint}</span>}
    </label>
  );
}

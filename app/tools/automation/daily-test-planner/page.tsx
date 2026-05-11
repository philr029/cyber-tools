"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

interface ScheduledTest {
  id: string;
  label: string;
  cadence: string;
  cmd: string;
}

const DEFAULT_TESTS: ScheduledTest[] = [
  { id: "t-status", label: "HTTP status check (homepage)", cadence: "*/15 * * * *", cmd: "curl -s -o /dev/null -w '%{http_code}\\n' https://example.com" },
  { id: "t-ssl", label: "SSL expiry check", cadence: "0 8 * * *", cmd: "openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -enddate" },
  { id: "t-dns", label: "DNS record sanity check", cadence: "0 */6 * * *", cmd: "dig +short example.com A; dig +short example.com MX" },
  { id: "t-form", label: "Lead form smoke test", cadence: "0 7 * * 1-5", cmd: "curl -s -X POST https://example.com/api/lead -d '{\"name\":\"test\"}'" },
  { id: "t-perf", label: "Lighthouse performance budget", cadence: "0 3 * * 1", cmd: "npx lighthouse https://example.com --quiet --chrome-flags='--headless' --output=json --output-path=./lh.json" },
];

export default function DailyTestPlannerPage() {
  const [domain, setDomain] = useState("example.com");
  const [tests, setTests] = useState<ScheduledTest[]>(DEFAULT_TESTS);

  const output = useMemo(() => {
    const lines: string[] = [];
    lines.push("# Daily Website Test Plan");
    lines.push(`> Target: ${domain || "example.com"}`);
    lines.push("");
    lines.push("## Suggested cron schedule (UTC)");
    lines.push("```cron");
    for (const t of tests) {
      const cmd = t.cmd.replaceAll("example.com", domain || "example.com");
      lines.push(`${t.cadence} ${cmd}`);
    }
    lines.push("```");
    lines.push("");
    lines.push("## Notes");
    lines.push("- Use a hosted scheduler (GitHub Actions, Vercel Cron, Power Automate) if you don't run a server.");
    lines.push("- Alert on three consecutive failures, not the first — flaps are noisy.");
    lines.push("- Page-speed runs are heavy; once a week is plenty.");
    return lines.join("\n");
  }, [domain, tests]);

  function update(i: number, field: keyof ScheduledTest, value: string) {
    setTests((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  }

  function remove(i: number) {
    setTests((prev) => prev.filter((_, idx) => idx !== i));
  }

  function add() {
    setTests((prev) => [...prev, { id: `t-${Date.now()}`, label: "Custom check", cadence: "0 9 * * *", cmd: "curl -s https://example.com" }]);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(output); } catch {}
  }

  return (
    <ToolPageLayout
      title="Daily Website Test Planner"
      description="Generate a cron-friendly plan of automated daily checks for your website — uptime, SSL, DNS, lead form, performance."
    >
      <div className="mb-6 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <label className="block text-xs font-medium text-white/70 mb-1">Target website</label>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        />
      </div>

      <div className="space-y-3">
        {tests.map((t, i) => (
          <div key={t.id} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
            <div className="grid gap-2 sm:grid-cols-[1.4fr_0.7fr_2fr_auto]">
              <input value={t.label} onChange={(e) => update(i, "label", e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white" />
              <input value={t.cadence} onChange={(e) => update(i, "cadence", e.target.value)} className="font-mono rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-cyan-200" />
              <input value={t.cmd} onChange={(e) => update(i, "cmd", e.target.value)} className="font-mono rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white/70" />
              <button type="button" onClick={() => remove(i)} className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={add} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white">Add check</button>
        <button type="button" onClick={copy} className="rounded-lg bg-cyan-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-400">Copy plan</button>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45 mb-2">Demo plan output</p>
        <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/75 whitespace-pre-wrap">{output}</pre>
      </div>
    </ToolPageLayout>
  );
}

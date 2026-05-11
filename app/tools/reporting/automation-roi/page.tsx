"use client";

import { useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);
}

export default function AutomationRoiPage() {
  const [hoursPerWeek, setHoursPerWeek] = useState("4");
  const [hourlyCost, setHourlyCost] = useState("35");
  const [setupHours, setSetupHours] = useState("12");
  const [setupCost, setSetupCost] = useState("0");
  const [name, setName] = useState("Automated daily site health checks");
  const [copied, setCopied] = useState(false);

  const monthlySaving = useMemo(() => num(hoursPerWeek) * 4.33 * num(hourlyCost), [hoursPerWeek, hourlyCost]);
  const annualSaving = useMemo(() => num(hoursPerWeek) * 52 * num(hourlyCost), [hoursPerWeek, hourlyCost]);
  const totalSetupCost = useMemo(() => num(setupHours) * num(hourlyCost) + num(setupCost), [setupHours, hourlyCost, setupCost]);
  const monthsToPayback = useMemo(() => {
    if (monthlySaving <= 0) return null;
    return totalSetupCost / monthlySaving;
  }, [monthlySaving, totalSetupCost]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const report = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# Automation ROI — ${name}`);
    lines.push("");
    lines.push(`**Hours saved / week:** ${num(hoursPerWeek)}`);
    lines.push(`**Loaded hourly cost:** £${num(hourlyCost)}`);
    lines.push(`**Setup effort:** ${num(setupHours)}h${num(setupCost) > 0 ? ` + £${num(setupCost)} tooling` : ""}`);
    lines.push("");
    lines.push("## Outcome");
    lines.push(`- **Monthly saving:** £${fmt(monthlySaving)}`);
    lines.push(`- **Annual saving:** £${fmt(annualSaving)}`);
    lines.push(`- **Setup cost:** £${fmt(totalSetupCost)}`);
    lines.push(`- **Payback:** ${monthsToPayback === null ? "—" : `${monthsToPayback.toFixed(1)} month(s)`}`);
    lines.push("");
    lines.push("## Assumptions");
    lines.push("- Saved hours are reinvested into higher-value work (not absorbed as idle time).");
    lines.push("- Hourly cost is fully loaded (salary, on-costs, tooling).");
    lines.push("- Maintenance overhead of the automation is ≤ 10% of the saved time.");
    lines.push("");
    lines.push("---");
    lines.push("_Numbers are estimates. Track actuals for 1 quarter to validate._");
    return lines.join("\n");
  }, [name, hoursPerWeek, hourlyCost, setupHours, setupCost, monthlySaving, annualSaving, totalSetupCost, monthsToPayback]);

  async function copy() {
    try { await navigator.clipboard.writeText(report); setCopied(true); } catch { setCopied(false); }
  }

  return (
    <ToolPageLayout
      title="Automation ROI Calculator"
      description="Estimate monthly savings, annual savings and payback period for an automation project. Use as a starter business case."
    >
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <Meta label="Skill demonstrated" body="ROI analysis, business case writing." accent="cyan" />
        <Meta label="Why it's useful" body="Turns 'this will save time' into numbers leadership can decide on." accent="violet" />
        <Meta label="Future API hook" body="Pair with finance tooling to validate hourly cost inputs." accent="emerald" />
      </div>

      <div className="mb-6 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Automation name" value={name} onChange={setName} placeholder="e.g. SLA-breach detector" full />
          <Field label="Hours saved / week" value={hoursPerWeek} onChange={setHoursPerWeek} type="number" />
          <Field label="Loaded hourly cost (£)" value={hourlyCost} onChange={setHourlyCost} type="number" />
          <Field label="Setup effort (hours)" value={setupHours} onChange={setSetupHours} type="number" />
          <Field label="Additional setup cost (£)" value={setupCost} onChange={setSetupCost} type="number" hint="Tooling / licence / contractor cost" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        <Stat label="Monthly saving" value={`£${fmt(monthlySaving)}`} tone="cyan" />
        <Stat label="Annual saving" value={`£${fmt(annualSaving)}`} tone="emerald" />
        <Stat label="Setup cost" value={`£${fmt(totalSetupCost)}`} tone="amber" />
        <Stat label="Payback" value={monthsToPayback === null ? "—" : `${monthsToPayback.toFixed(1)} mo`} tone="violet" />
      </div>

      <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Business case (Markdown)</p>
          <button onClick={copy} className="rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-400 transition-colors">{copied ? "Copied!" : "Copy"}</button>
        </div>
        <pre className="max-h-96 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 font-mono whitespace-pre-wrap">{report}</pre>
      </div>
    </ToolPageLayout>
  );
}

function Field({ label, value, onChange, hint, type, placeholder, full }: { label: string; value: string; onChange: (v: string) => void; hint?: string; type?: string; placeholder?: string; full?: boolean }) {
  return (
    <label className={`block text-xs text-white/60 ${full ? "sm:col-span-2" : ""}`}>
      <span className="block mb-1 font-medium text-white/70">{label}</span>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
      />
      {hint && <span className="mt-1 block text-[11px] text-white/45">{hint}</span>}
    </label>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "cyan" | "emerald" | "amber" | "violet" }) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    violet: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Meta({ label, body, accent }: { label: string; body: string; accent: "cyan" | "violet" | "emerald" }) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}

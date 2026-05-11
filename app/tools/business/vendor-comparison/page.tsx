"use client";

import { useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

interface VendorRow {
  name: string;
  monthlyCost: string;
  features: string;
  risk: "Low" | "Medium" | "High" | "";
  notes: string;
}

function emptyRow(): VendorRow {
  return { name: "", monthlyCost: "", features: "", risk: "", notes: "" };
}

function scoreVendor(v: VendorRow) {
  const cost = Number(String(v.monthlyCost).replace(/[^0-9.]/g, ""));
  const featureCount = v.features.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean).length;
  const riskPenalty: Record<string, number> = { Low: 0, Medium: 15, High: 40, "": 5 };
  const featureScore = Math.min(60, featureCount * 6);
  const costScore = !Number.isFinite(cost) || cost <= 0 ? 30 : Math.max(0, 40 - Math.min(40, cost / 25));
  const raw = featureScore + costScore - (riskPenalty[v.risk] ?? 5);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export default function VendorComparisonPage() {
  const [rows, setRows] = useState<VendorRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [criteria, setCriteria] = useState("Cost, features, security posture");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  function update(i: number, patch: Partial<VendorRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  const filled = rows.filter((r) => r.name.trim().length > 0);
  const scored = useMemo(
    () => filled.map((r) => ({ ...r, score: scoreVendor(r) })).sort((a, b) => b.score - a.score),
    [filled],
  );
  const winner = scored[0];

  const markdown = useMemo(() => {
    if (filled.length === 0) return "Add at least one vendor row to see the comparison matrix.";
    const lines: string[] = [];
    lines.push("# Vendor Comparison Matrix");
    lines.push("");
    if (criteria) lines.push(`**Evaluation criteria:** ${criteria}`);
    lines.push("");
    lines.push("| Vendor | Monthly cost | Features | Risk | Score | Notes |");
    lines.push("| ------ | ------------ | -------- | ---- | ----- | ----- |");
    for (const r of scored) {
      lines.push(`| ${r.name} | ${r.monthlyCost || "—"} | ${r.features || "—"} | ${r.risk || "—"} | ${r.score} | ${r.notes || ""} |`);
    }
    lines.push("");
    if (winner) {
      lines.push("## Recommendation");
      lines.push(`- **Preferred vendor:** ${winner.name} (score ${winner.score}/100).`);
      lines.push("- Validate with proof-of-concept, security review and reference call before commit.");
      lines.push("- Re-score in 6 months to catch pricing or feature drift.");
    }
    lines.push("");
    lines.push("---");
    lines.push("_Demo scoring is a starting point — weight criteria for your context._");
    return lines.join("\n");
  }, [filled.length, scored, criteria, winner]);

  async function copy() {
    try { await navigator.clipboard.writeText(markdown); setCopied(true); } catch { setCopied(false); }
  }

  return (
    <ToolPageLayout
      title="Vendor Comparison Matrix"
      description="Score vendors on cost, features and risk. Produces a clean matrix and a recommendation you can copy into procurement docs."
    >
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <Meta label="Skill demonstrated" body="Procurement, vendor risk scoring." accent="cyan" />
        <Meta label="Why it's useful" body="Forces apples-to-apples comparison before buying." accent="violet" />
        <Meta label="Future API hook" body="Pull pricing + feature signals from G2 or vendor public APIs." accent="emerald" />
      </div>

      <div className="mb-6 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <label className="block text-xs text-white/60">
          <span className="block mb-1 font-medium text-white/70">Evaluation criteria summary</span>
          <input
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="Cost, features, support, security"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
        </label>
      </div>

      <div className="mb-6 space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Vendor name" value={r.name} onChange={(v) => update(i, { name: v })} placeholder="Vendor A" />
              <Field label="Monthly cost" value={r.monthlyCost} onChange={(v) => update(i, { monthlyCost: v })} placeholder="£250" />
              <Field label="Key features" value={r.features} onChange={(v) => update(i, { features: v })} placeholder="SSO, audit log, SOC 2" />
              <SelectField
                label="Risk"
                value={r.risk}
                onChange={(v) => update(i, { risk: v as VendorRow["risk"] })}
                options={["", "Low", "Medium", "High"]}
              />
              <Field label="Notes" value={r.notes} onChange={(v) => update(i, { notes: v })} placeholder="Optional" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-white/45">Score (auto): {r.name ? scoreVendor(r) : "—"}/100</span>
              <button type="button" onClick={() => removeRow(i)} className="text-[11px] text-rose-300 hover:text-rose-200">Remove</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addRow} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:border-white/30 transition-colors">
          + Add vendor
        </button>
      </div>

      {winner && (
        <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-100">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">Recommendation</p>
          <p className="mt-2 text-xl font-bold">{winner.name} · score {winner.score}/100</p>
          <p className="mt-1 text-sm opacity-80">Validate with PoC, security review and reference call before commit.</p>
        </div>
      )}

      <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Matrix (Markdown)</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-300/80">Demo result · weight criteria for your context</span>
            <button onClick={copy} className="rounded-lg bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-400 transition-colors">{copied ? "Copied!" : "Copy"}</button>
          </div>
        </div>
        <pre className="max-h-96 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 font-mono whitespace-pre-wrap">{markdown}</pre>
      </div>
    </ToolPageLayout>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-xs text-white/60">
      <span className="block mb-1 font-medium text-white/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block text-xs text-white/60">
      <span className="block mb-1 font-medium text-white/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
      >
        {options.map((o) => <option key={o || "unset"} value={o}>{o || "Select…"}</option>)}
      </select>
    </label>
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

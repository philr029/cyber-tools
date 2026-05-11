"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

const TRIGGERS = [
  "New form submission (Microsoft Forms)",
  "New lead in HubSpot / Dynamics",
  "New email arrives (shared mailbox)",
  "New Teams channel message",
  "Scheduled — recurrence",
  "Manual trigger (button)",
];

const ACTIONS = [
  "Post to Teams channel",
  "Send email (Outlook / shared mailbox)",
  "Create SharePoint list item",
  "Create planner task",
  "Add row to Excel / Dataverse",
  "Create incident in ServiceNow",
  "HTTP request to webhook (Slack, custom API)",
];

interface Step {
  id: string;
  kind: "trigger" | "action" | "condition";
  label: string;
}

export default function PowerAutomatePage() {
  const [name, setName] = useState("Lead → Teams + Planner");
  const [steps, setSteps] = useState<Step[]>([
    { id: "s1", kind: "trigger", label: "New form submission (Microsoft Forms)" },
    { id: "s2", kind: "condition", label: "Country == 'United Kingdom'" },
    { id: "s3", kind: "action", label: "Post to Teams channel" },
    { id: "s4", kind: "action", label: "Create planner task" },
  ]);

  function addStep(kind: Step["kind"]) {
    setSteps((prev) => [
      ...prev,
      { id: `s-${Date.now()}`, kind, label: kind === "trigger" ? "Choose a trigger…" : kind === "action" ? "Choose an action…" : "Condition expression" },
    ]);
  }

  function update(i: number, value: string) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, label: value } : s)));
  }

  function remove(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  const summary = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# Power Automate flow plan: ${name}`);
    lines.push("");
    steps.forEach((s, i) => {
      const prefix = s.kind === "trigger" ? "🔌 Trigger" : s.kind === "condition" ? "❓ Condition" : "⚙️ Action";
      lines.push(`${i + 1}. **${prefix}** — ${s.label}`);
    });
    lines.push("");
    lines.push("## Connectors required");
    const connectors = new Set<string>();
    steps.forEach((s) => {
      if (s.label.includes("Teams")) connectors.add("Microsoft Teams");
      if (s.label.includes("SharePoint")) connectors.add("SharePoint Online");
      if (s.label.includes("planner") || s.label.includes("Planner")) connectors.add("Planner");
      if (s.label.includes("Forms")) connectors.add("Microsoft Forms");
      if (s.label.includes("Outlook") || s.label.includes("email")) connectors.add("Office 365 Outlook");
      if (s.label.includes("Excel")) connectors.add("Excel Online (Business)");
      if (s.label.includes("Dataverse")) connectors.add("Microsoft Dataverse");
      if (s.label.includes("HTTP")) connectors.add("HTTP (premium)");
      if (s.label.includes("ServiceNow")) connectors.add("ServiceNow (premium)");
    });
    if (connectors.size === 0) connectors.add("(none detected — review steps)");
    connectors.forEach((c) => lines.push(`- ${c}`));
    return lines.join("\n");
  }, [name, steps]);

  async function copy() { try { await navigator.clipboard.writeText(summary); } catch {} }

  return (
    <ToolPageLayout
      title="Power Automate Workflow Planner"
      description="Sketch a Power Automate flow before you build it — pick a trigger, lay out conditions and actions, and get a plan you can paste into a ticket or design doc."
    >
      <div className="mb-4 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <label className="block text-xs font-medium text-white/70 mb-1">Flow name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30" />
      </div>

      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={s.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider ${
                  s.kind === "trigger" ? "bg-violet-500/20 text-violet-200" : s.kind === "condition" ? "bg-amber-500/20 text-amber-200" : "bg-cyan-500/20 text-cyan-200"
                }`}
              >
                {s.kind}
              </span>
              {s.kind === "trigger" ? (
                <select value={s.label} onChange={(e) => update(i, e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white">
                  {TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : s.kind === "action" ? (
                <select value={s.label} onChange={(e) => update(i, e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white">
                  {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <input value={s.label} onChange={(e) => update(i, e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white" />
              )}
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} className="px-2 py-1 text-xs text-white/60 hover:text-white">↑</button>
                <button type="button" onClick={() => move(i, 1)} className="px-2 py-1 text-xs text-white/60 hover:text-white">↓</button>
                <button type="button" onClick={() => remove(i)} className="px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10 rounded">×</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => addStep("trigger")} className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-500/15">+ Trigger</button>
        <button type="button" onClick={() => addStep("action")} className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-500/15">+ Action</button>
        <button type="button" onClick={() => addStep("condition")} className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/15">+ Condition</button>
        <button type="button" onClick={copy} className="rounded-lg bg-cyan-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-400">Copy plan</button>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45 mb-2">Demo plan output</p>
        <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/80 whitespace-pre-wrap">{summary}</pre>
      </div>
    </ToolPageLayout>
  );
}

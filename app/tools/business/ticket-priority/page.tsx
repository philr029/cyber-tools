"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const IMPACT = [
  { value: "1", label: "1 — Cosmetic / single user inconvenienced" },
  { value: "2", label: "2 — Workaround exists / individual blocked" },
  { value: "3", label: "3 — Team / department blocked" },
  { value: "4", label: "4 — Whole site / business unit blocked" },
  { value: "5", label: "5 — Revenue, safety or compliance at risk" },
];

const URGENCY = [
  { value: "1", label: "1 — Can wait until next business day" },
  { value: "2", label: "2 — Needed within today" },
  { value: "3", label: "3 — Needed within 4 hours" },
  { value: "4", label: "4 — Needed within 1 hour" },
  { value: "5", label: "5 — Immediate response required" },
];

const PRIORITIES = [
  { tier: "P1", label: "Critical", sla: "Acknowledge: 15 min · Resolve target: 4h · Hourly comms" },
  { tier: "P2", label: "High", sla: "Acknowledge: 30 min · Resolve target: 8h · 2-hour comms" },
  { tier: "P3", label: "Medium", sla: "Acknowledge: 2h · Resolve target: 2 business days · Daily comms" },
  { tier: "P4", label: "Low", sla: "Acknowledge: 1 business day · Resolve target: 5 business days" },
  { tier: "P5", label: "Planned", sla: "Schedule into backlog; no SLA" },
];

function pickPriority(impact: number, urgency: number, users: number) {
  let score = impact * urgency;
  if (users > 500) score += 4;
  else if (users > 100) score += 3;
  else if (users > 20) score += 2;
  else if (users > 5) score += 1;
  if (score >= 25) return 0; // P1
  if (score >= 16) return 1; // P2
  if (score >= 9) return 2;  // P3
  if (score >= 4) return 3;  // P4
  return 4;                  // P5
}

export default function TicketPriorityPage() {
  return (
    <GeneratorTool
      title="IT Ticket Priority Calculator"
      description="Drop impact, urgency and affected users in — get a deterministic priority and matching response SLA."
      skill="ITIL incident management, SLA design."
      why="Subjective P1s drown queues and ruin trust. Numbers force consistency."
      futureApi="Wire to ServiceNow / Jira Service Management API to auto-set priority on ticket creation."
      outputBadge="Demo output · pair with your existing SLA table"
      inputs={[
        { id: "summary", label: "Ticket summary", placeholder: "e.g. Mailbox migration causing delivery failures", span: "full", required: true },
        { id: "impact", label: "Impact (1–5)", type: "select", options: IMPACT, defaultValue: "3", required: true },
        { id: "urgency", label: "Urgency (1–5)", type: "select", options: URGENCY, defaultValue: "3", required: true },
        { id: "users", label: "Affected users", type: "number", placeholder: "0", defaultValue: "5" },
      ]}
      renderResult={(v) => {
        const impact = Number(v.impact || 1);
        const urgency = Number(v.urgency || 1);
        const users = Number(v.users || 0);
        if (!v.summary) return null;
        const idx = pickPriority(impact, urgency, users);
        const p = PRIORITIES[idx];
        const tone = idx === 0 ? "rose" : idx === 1 ? "amber" : idx === 2 ? "yellow" : idx === 3 ? "cyan" : "emerald";
        const cls: Record<string, string> = {
          rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
          amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
          yellow: "border-yellow-400/30 bg-yellow-500/10 text-yellow-200",
          cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
          emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
        };
        return (
          <div className={`rounded-2xl border p-5 ${cls[tone]}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">Priority</p>
            <p className="mt-2 text-3xl font-bold">{p.tier} — {p.label}</p>
            <p className="mt-1 text-sm">{p.sla}</p>
          </div>
        );
      }}
      generate={(v) => {
        if (!v.summary) return "";
        const impact = Number(v.impact || 1);
        const urgency = Number(v.urgency || 1);
        const users = Number(v.users || 0);
        const idx = pickPriority(impact, urgency, users);
        const p = PRIORITIES[idx];
        const lines: string[] = [];
        lines.push(`# Ticket triage`);
        lines.push("");
        lines.push(`**Summary:** ${v.summary}`);
        lines.push(`**Impact:** ${impact}/5 · **Urgency:** ${urgency}/5 · **Affected users:** ${users}`);
        lines.push(`**Priority:** ${p.tier} — ${p.label}`);
        lines.push(`**SLA:** ${p.sla}`);
        lines.push("");
        lines.push("## Response recommendation");
        if (idx === 0) {
          lines.push("- Spin up a Major Incident channel and assign an Incident Commander.");
          lines.push("- Notify leadership and affected service owners within 15 minutes.");
          lines.push("- Hourly written updates until resolution.");
        } else if (idx === 1) {
          lines.push("- Assign to on-call engineer; aim for resolution within the business day.");
          lines.push("- Stakeholder update every 2 hours.");
        } else if (idx === 2) {
          lines.push("- Acknowledge within 2 hours; resolve within 2 business days.");
          lines.push("- Comms once per day or on state change.");
        } else if (idx === 3) {
          lines.push("- Acknowledge next business day; resolve within 5 business days.");
          lines.push("- No proactive comms required unless requester asks.");
        } else {
          lines.push("- Add to backlog and schedule with the requester.");
        }
        lines.push("");
        lines.push("---");
        lines.push("_Generated by SecureScope. Compare against your tenant's SLA matrix before quoting external customers._");
        return lines.join("\n");
      }}
    />
  );
}

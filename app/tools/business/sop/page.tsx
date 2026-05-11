"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

function bullets(s: string): string[] {
  return (s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function SopGeneratorPage() {
  return (
    <GeneratorTool
      title="SOP Generator"
      description="Generate a formal Standard Operating Procedure (SOP) covering purpose, scope, ownership, steps, review and references."
      skill="Operational excellence."
      why="The SOP is the difference between IT being a heroic effort and IT being a service."
      storageKey="ss.sop"
      fields={[
        { id: "title", label: "SOP title", placeholder: "Provisioning a new starter Microsoft 365 account" },
        { id: "id", label: "SOP ID / version", placeholder: "SOP-IT-014 v1.0", defaultValue: "SOP-IT-001 v1.0" },
        { id: "purpose", label: "Purpose (one paragraph)", type: "textarea", rows: 3, placeholder: "Why this SOP exists." },
        { id: "scope", label: "Scope", type: "textarea", rows: 2, placeholder: "Who and what it applies to." },
        { id: "owner", label: "Process owner", placeholder: "IT Operations Manager" },
        { id: "approver", label: "Approver", placeholder: "Head of IT" },
        { id: "review", label: "Next review date", type: "date" },
        { id: "steps", label: "Steps (one per line)", type: "textarea", rows: 8, placeholder: "Confirm hire approval in HRIS\nCreate the Entra ID user\nAssign licence and groups\nSchedule day-1 welcome call" },
        { id: "refs", label: "References (one per line)", type: "textarea", rows: 3 },
      ]}
      generate={(v) => {
        const steps = bullets(v.steps).map((l, i) => `${i + 1}. ${l}`);
        const refs = bullets(v.refs).map((l) => `- ${l}`);
        const md = [
          `# ${v.title || "Standard Operating Procedure"}`,
          ``,
          `**SOP ID:** ${v.id || "(set an ID)"}`,
          `**Owner:** ${v.owner || "(set an owner)"}`,
          `**Approver:** ${v.approver || "(not set)"}`,
          `**Next review:** ${v.review || "(set a review date)"}`,
          ``,
          `## 1. Purpose`,
          v.purpose || "_(one paragraph explaining why this SOP exists)_",
          ``,
          `## 2. Scope`,
          v.scope || "_(who and what this applies to)_",
          ``,
          `## 3. Steps`,
          ...(steps.length ? steps : ["1. _(add at least one step)_"]),
          ``,
          `## 4. References`,
          ...(refs.length ? refs : ["- _(none yet)_"]),
          ``,
          `_Generated ${new Date().toISOString().slice(0, 10)} via the SecureScope IT/Cyber Toolkit._`,
        ].join("\n");
        return [{ label: "SOP (Markdown)", value: md, language: "markdown" }];
      }}
    />
  );
}

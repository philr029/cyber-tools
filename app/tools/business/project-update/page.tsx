"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

function bullets(s: string): string[] {
  return (s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function ProjectUpdatePage() {
  return (
    <GeneratorTool
      title="Project Update Generator"
      description="Turn raw progress notes into a clean weekly status update with completed work, in-progress items, blockers and next steps."
      skill="Project comms, stakeholder management."
      why="A consistent, skimmable update means execs stop pinging you for status."
      storageKey="ss.project-update"
      fields={[
        { id: "project", label: "Project name", placeholder: "M365 Tenant Hardening" },
        { id: "owner", label: "Project lead", placeholder: "@you" },
        { id: "week", label: "Week ending", type: "date" },
        {
          id: "rag",
          label: "Overall RAG",
          type: "select",
          options: [
            { value: "🟢 Green", label: "🟢 Green — on track" },
            { value: "🟡 Amber", label: "🟡 Amber — at risk" },
            { value: "🔴 Red", label: "🔴 Red — off track" },
          ],
          defaultValue: "🟢 Green",
        },
        { id: "summary", label: "Headline", placeholder: "One sentence stakeholders will remember." },
        { id: "completed", label: "Completed (one per line)", type: "textarea", rows: 4, defaultValue: "Rolled out CA policy 'Block legacy auth' to all users\nMigrated 14 users to Defender for Office 365 P2" },
        { id: "inProgress", label: "In progress (one per line)", type: "textarea", rows: 4, defaultValue: "BitLocker compliance push to Sales devices\nIntune compliance dashboard review" },
        { id: "blockers", label: "Blockers (one per line)", type: "textarea", rows: 3, defaultValue: "Procurement sign-off on E5 add-on (waiting on Finance)" },
        { id: "next", label: "Next week (one per line)", type: "textarea", rows: 4, defaultValue: "Pilot phishing-resistant MFA with admins\nFinish Defender ASR rule rollout" },
      ]}
      generate={(v) => {
        const md = [
          `# ${v.project || "Project"} — Weekly update`,
          ``,
          `**Week ending:** ${v.week || new Date().toISOString().slice(0, 10)}`,
          `**Owner:** ${v.owner || "(not set)"}`,
          `**Overall:** ${v.rag || "🟢 Green"}`,
          ``,
          `## Headline`,
          v.summary || "_(one-line headline goes here)_",
          ``,
          `## ✅ Completed this week`,
          ...(bullets(v.completed).length ? bullets(v.completed).map((s) => `- ${s}`) : ["- _(nothing completed yet)_"]),
          ``,
          `## ⏳ In progress`,
          ...(bullets(v.inProgress).length ? bullets(v.inProgress).map((s) => `- ${s}`) : ["- _(nothing yet)_"]),
          ``,
          `## ⛔ Blockers`,
          ...(bullets(v.blockers).length ? bullets(v.blockers).map((s) => `- ${s}`) : ["- None"]),
          ``,
          `## ➡️ Next week`,
          ...(bullets(v.next).length ? bullets(v.next).map((s) => `- ${s}`) : ["- _(planning in progress)_"]),
        ].join("\n");
        return [{ label: "Status update (Markdown)", value: md, language: "markdown" }];
      }}
    />
  );
}

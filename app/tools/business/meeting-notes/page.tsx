"use client";

import MultiOutputTool from "@/app/components/tools/MultiOutputTool";

function bullets(s: string): string[] {
  return (s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function MeetingNotesPage() {
  return (
    <MultiOutputTool
      title="Meeting Notes Generator"
      description="Paste rough notes from a meeting and get a structured write-up: summary, decisions, actions, owners and deadlines."
      skill="Facilitation, follow-through."
      why="Decisions only stick when they're written somewhere everyone can find them."
      storageKey="ss.meeting-notes"
      fields={[
        { id: "title", label: "Meeting title", placeholder: "Q4 Security review", defaultValue: "Weekly IT sync" },
        { id: "date", label: "Date", type: "date" },
        { id: "attendees", label: "Attendees (comma separated)", placeholder: "Jane, Alex, Sam" },
        { id: "summary", label: "One-line summary", placeholder: "Roadmap aligned, two follow-ups outstanding." },
        { id: "decisions", label: "Decisions (one per line)", type: "textarea", rows: 4, defaultValue: "Approved E3→E5 trial for Defender users\nMoved BitLocker rollout deadline to April" },
        { id: "actions", label: "Actions (one per line: 'who — what — when')", type: "textarea", rows: 5, defaultValue: "Jane — finalise CA policy draft — 21 Feb\nAlex — book vendor demo — 19 Feb\nSam — close out leaver ticket #4421 — EOD" },
        { id: "risks", label: "Risks / open questions (one per line)", type: "textarea", rows: 4 },
      ]}
      generate={(v) => {
        const acts = bullets(v.actions).map((line) => {
          const parts = line.split("—").map((s) => s.trim());
          if (parts.length >= 3) return `- **${parts[0]}** — ${parts[1]} — _due ${parts[2]}_`;
          if (parts.length === 2) return `- **${parts[0]}** — ${parts[1]}`;
          return `- ${line}`;
        });

        const md = [
          `# ${v.title || "Meeting notes"}`,
          ``,
          `**Date:** ${v.date || new Date().toISOString().slice(0, 10)}`,
          `**Attendees:** ${v.attendees || "(not listed)"}`,
          ``,
          `## Summary`,
          v.summary || "_(one or two sentences)_",
          ``,
          `## Decisions`,
          ...(bullets(v.decisions).length ? bullets(v.decisions).map((d) => `- ${d}`) : ["- (none recorded)"]),
          ``,
          `## Actions`,
          ...(acts.length ? acts : ["- (none recorded)"]),
          ``,
          `## Risks / open questions`,
          ...(bullets(v.risks).length ? bullets(v.risks).map((d) => `- ${d}`) : ["- (none)"]),
        ].join("\n");
        return [{ label: "Meeting notes (Markdown)", value: md, language: "markdown" }];
      }}
    />
  );
}

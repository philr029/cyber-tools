"use client";

import MultiOutputTool from "@/app/components/tools/MultiOutputTool";

export default function BugReportGeneratorPage() {
  return (
    <MultiOutputTool
      title="Bug Report Generator"
      description="Take a messy bug description and turn it into a clean ticket: summary, steps, expected vs actual, environment and priority."
      skill="QA discipline, incident triage."
      why="Tickets that explain themselves get triaged in hours, not weeks."
      storageKey="ss.bug-report"
      fields={[
        { id: "title", label: "Short summary", placeholder: "Login button does nothing on mobile Safari" },
        { id: "steps", label: "Steps to reproduce (one per line)", type: "textarea", rows: 5, placeholder: "Open https://example.com on iPhone Safari\nTap the Sign in button\nObserve no action" },
        { id: "expected", label: "Expected result", type: "textarea", rows: 2, placeholder: "Sign in modal opens." },
        { id: "actual", label: "Actual result", type: "textarea", rows: 2, placeholder: "Nothing happens. No console errors." },
        { id: "url", label: "Affected URL (optional)", type: "url", placeholder: "https://example.com/login" },
        { id: "env", label: "Environment", placeholder: "iPhone 15, iOS 17.5, Safari", defaultValue: "Chrome 128 on macOS 14" },
        {
          id: "priority",
          label: "Priority",
          type: "select",
          options: [
            { value: "P1", label: "P1 — site down / data loss" },
            { value: "P2", label: "P2 — major feature broken" },
            { value: "P3", label: "P3 — minor feature broken" },
            { value: "P4", label: "P4 — cosmetic / nice-to-have" },
          ],
          defaultValue: "P3",
        },
      ]}
      generate={(v) => {
        const steps = (v.steps || "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l, i) => `${i + 1}. ${l}`)
          .join("\n");

        const md = [
          `# 🐞 ${v.title || "Untitled bug"}`,
          "",
          `**Priority:** ${v.priority || "P3"}`,
          v.url ? `**URL:** ${v.url}` : "",
          `**Environment:** ${v.env || "(not specified)"}`,
          "",
          "## Steps to reproduce",
          steps || "_(no steps provided)_",
          "",
          "## Expected result",
          v.expected || "_(not specified)_",
          "",
          "## Actual result",
          v.actual || "_(not specified)_",
          "",
          "## Triage notes",
          "- [ ] Reproduced on a clean profile",
          "- [ ] Console / network log captured",
          "- [ ] Owner assigned",
          "- [ ] Linked to release / hotfix",
        ]
          .filter(Boolean)
          .join("\n");
        return [{ label: "Bug report (Markdown)", value: md, language: "markdown" }];
      }}
    />
  );
}

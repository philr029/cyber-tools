"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const TYPES = [
  { value: "feat", label: "feat — new feature" },
  { value: "fix", label: "fix — bug fix" },
  { value: "perf", label: "perf — performance" },
  { value: "refactor", label: "refactor — internal change" },
  { value: "docs", label: "docs — documentation" },
  { value: "test", label: "test — tests" },
  { value: "chore", label: "chore — maintenance" },
  { value: "ci", label: "ci — CI/CD" },
  { value: "build", label: "build — build system" },
];

function shorten(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

export default function CommitMessagePage() {
  return (
    <GeneratorTool
      title="Commit Message Generator"
      description="Turn a rough change summary into a clean Conventional Commit with a short subject and an optional body — ready to paste into git commit -m."
      skill="Git, Conventional Commits."
      why="Cleaner commit history = better changelogs, easier blame, faster releases."
      fields={[
        {
          id: "type",
          label: "Type",
          type: "select",
          options: TYPES,
          defaultValue: "feat",
        },
        { id: "scope", label: "Scope (optional)", placeholder: "auth, api, ui…" },
        {
          id: "summary",
          label: "What changed?",
          placeholder: "Add MFA enforcement for admin sign-ins",
          defaultValue: "Add MFA enforcement for admin sign-ins",
        },
        {
          id: "details",
          label: "Detail / motivation (optional)",
          type: "textarea",
          rows: 4,
          defaultValue:
            "Apply Conditional Access policy to require MFA on all Global and Privileged Role Admins. Document the break-glass exception. Resolves SEC-142.",
        },
        { id: "breaking", label: "Breaking change note (optional)", placeholder: "removes /v1/users endpoint" },
        { id: "issue", label: "Issue reference (optional)", placeholder: "SEC-142, #34" },
      ]}
      generate={(v) => {
        const scope = v.scope ? `(${v.scope})` : "";
        const subject = `${v.type || "feat"}${scope}: ${shorten(v.summary || "describe the change", 72 - (v.type?.length ?? 0) - scope.length - 2)}`;
        const shortMsg = shorten(v.summary || "describe the change", 72);
        const body = (v.details || "").trim();
        const breaking = v.breaking?.trim()
          ? `\n\nBREAKING CHANGE: ${v.breaking.trim()}`
          : "";
        const refs = v.issue?.trim() ? `\n\nRefs: ${v.issue.trim()}` : "";
        const conventional = `${subject}${body ? `\n\n${body}` : ""}${breaking}${refs}`;

        return [
          { label: "Short subject (50–72 chars)", value: shortMsg, language: "text" },
          { label: "Conventional Commit", value: conventional, language: "git" },
          {
            label: "git command",
            value: `git commit -m ${JSON.stringify(subject)}${body ? ` \\\n  -m ${JSON.stringify(body)}` : ""}${breaking ? ` \\\n  -m ${JSON.stringify(`BREAKING CHANGE: ${v.breaking?.trim()}`)}` : ""}`,
            language: "bash",
          },
        ];
      }}
    />
  );
}

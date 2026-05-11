"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function CodeReviewChecklistPage() {
  return (
    <ChecklistTool
      title="Code Review Checklist"
      description="A structured pass over every PR covering security, performance, accessibility, error handling, naming, comments, testing and mobile."
      skill="Code review discipline."
      why="Consistent reviews stop the same drift from happening over and over."
      storageKey="ss.code-review-checklist"
      futureApi="Optional: post the rendered output as a sticky PR comment via a GitHub App through a serverless function."
      inputs={[
        { id: "pr", label: "PR title or number", placeholder: "#42 — Add MFA enforcement" },
        { id: "author", label: "Author", placeholder: "@octocat" },
        { id: "reviewer", label: "Reviewer", placeholder: "@you" },
      ]}
      sections={[
        {
          title: "Security",
          items: [
            { id: "sec-1", label: "No secrets, tokens, or keys committed (env vars + serverless only)" },
            { id: "sec-2", label: "User input validated and escaped at every trust boundary" },
            { id: "sec-3", label: "Auth/authorisation checked on every protected route or action" },
            { id: "sec-4", label: "Dependencies up to date, no high/critical advisories" },
          ],
        },
        {
          title: "Performance",
          items: [
            { id: "perf-1", label: "No obvious N+1 queries or unbounded loops" },
            { id: "perf-2", label: "Images sized correctly with lazy-loading where appropriate" },
            { id: "perf-3", label: "Heavy work runs server-side or in a worker, not on render" },
          ],
        },
        {
          title: "Accessibility",
          items: [
            { id: "a11y-1", label: "All interactive elements are reachable by keyboard" },
            { id: "a11y-2", label: "Form fields have associated labels and visible focus states" },
            { id: "a11y-3", label: "Colour contrast meets WCAG AA" },
            { id: "a11y-4", label: "ARIA used only where native semantics are insufficient" },
          ],
        },
        {
          title: "Error handling",
          items: [
            { id: "err-1", label: "Errors are surfaced to the user with helpful, non-leaky messages" },
            { id: "err-2", label: "Try/catch wraps any external call that can fail" },
            { id: "err-3", label: "Logs include enough context (ids, timing) without sensitive data" },
          ],
        },
        {
          title: "Naming & comments",
          items: [
            { id: "name-1", label: "Functions and variables read out loud sensibly" },
            { id: "name-2", label: "Comments explain why, not what" },
            { id: "name-3", label: "Dead code, console.log and TODOs removed or ticketed" },
          ],
        },
        {
          title: "Testing",
          items: [
            { id: "test-1", label: "Happy path covered by automated tests" },
            { id: "test-2", label: "At least one error/edge-case test" },
            { id: "test-3", label: "Manual test plan included for UI changes" },
          ],
        },
        {
          title: "Mobile & responsive",
          items: [
            { id: "mob-1", label: "Tested at 375px, 768px and 1280px widths" },
            { id: "mob-2", label: "Touch targets ≥ 44×44 px" },
            { id: "mob-3", label: "No horizontal scrolling on mobile" },
          ],
        },
      ]}
    />
  );
}

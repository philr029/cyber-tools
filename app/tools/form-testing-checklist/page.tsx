"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function FormTestingChecklistPage() {
  return (
    <ChecklistTool
      title="Form Testing Checklist"
      description="A robust regression checklist for any HTML form — validation, edge cases, accessibility, integrations and analytics."
      skill="Web QA, accessibility, integration testing"
      why="Forms are deceptively complex — a checklist is faster than writing dozens of bespoke test cases and catches the edge cases most teams forget."
      inputs={[{ id: "form", label: "Form URL", placeholder: "https://example.com/signup" }]}
      sections={[
        {
          title: "Validation",
          items: [
            { id: "ft-v1", label: "Empty required fields show inline errors and block submit" },
            { id: "ft-v2", label: "Invalid email / phone / postcode rejected" },
            { id: "ft-v3", label: "Max-length and min-length enforced and errors are friendly" },
            { id: "ft-v4", label: "Server validates everything the client validates (don't trust the client)" },
            { id: "ft-v5", label: "Errors clear when the user fixes the input" },
          ],
        },
        {
          title: "Edge cases",
          items: [
            { id: "ft-e1", label: "Unicode, emoji, RTL characters accepted in text fields" },
            { id: "ft-e2", label: "Browser back / refresh does not double-submit (POST-redirect-GET)" },
            { id: "ft-e3", label: "Slow network: button disabled, no duplicate POST" },
            { id: "ft-e4", label: "Network failure: clear error and submitted data is preserved" },
            { id: "ft-e5", label: "Autofill (1Password / iCloud / Chrome) works without breaking layout" },
          ],
        },
        {
          title: "Accessibility",
          items: [
            { id: "ft-a1", label: "Every input has a visible <label> or aria-label" },
            { id: "ft-a2", label: "Tab order is logical and a visible focus ring is present" },
            { id: "ft-a3", label: "Errors are linked via aria-describedby" },
            { id: "ft-a4", label: "Submit announces success / failure via aria-live region" },
            { id: "ft-a5", label: "Form is usable with keyboard only and a screen reader" },
          ],
        },
        {
          title: "Integration & analytics",
          items: [
            { id: "ft-i1", label: "Submitted data lands in the database / CRM / inbox correctly" },
            { id: "ft-i2", label: "Email / Slack / Teams notification fires" },
            { id: "ft-i3", label: "Analytics event recorded (GA4 / PostHog / Plausible)" },
            { id: "ft-i4", label: "Confirmation email goes to user and does not land in spam" },
            { id: "ft-i5", label: "Rate-limiting / spam protection verified" },
          ],
        },
      ]}
    />
  );
}

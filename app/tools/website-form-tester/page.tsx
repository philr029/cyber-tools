"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function WebsiteFormTesterPage() {
  return (
    <ToolkitPlaceholder
      title="Website Form Tester"
      description="Plan and execute high-signal form passes — validation, error UX, analytics hooks, and security headers — before you wire a live relay."
      category="Web QA"
      bullets={[
        "Map required fields, optional fields, and dependency rules.",
        "Exercise client + server validation paths with edge-case payloads.",
        "Confirm error messages are helpful, accessible, and consistent.",
      ]}
      primaryAction={{ href: "/tools/form-tester", label: "Open live form tester" }}
      related={[
        { href: "/tools/form-testing-checklist", label: "Form testing checklist" },
        { href: "/tools/form-test-plan", label: "Form test plan generator" },
      ]}
    />
  );
}

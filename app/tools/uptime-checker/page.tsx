"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function UptimeCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="Uptime Checker"
      description="Reliability checklist for synthetic checks, status pages, and alert routing — complements the automated monitoring hub."
      category="Web QA"
      bullets={[
        "Define SLIs/SLOs and error budgets in plain language.",
        "Multi-region probe strategy and noisy-alert dampening.",
        "Runbook links for common false positives.",
      ]}
      primaryAction={{ href: "/tools/automated-monitoring", label: "Open monitoring hub" }}
      related={[
        { href: "/tools/website-status", label: "Website status" },
        { href: "/automation-tools", label: "Automation hub" },
      ]}
    />
  );
}

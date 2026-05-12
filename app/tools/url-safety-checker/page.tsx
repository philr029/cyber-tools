"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function UrlSafetyCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="URL Safety Checker"
      description="Heuristic-first review for suspicious URLs — ideal for analysts who need a structured pass before opening in sandboxes."
      category="Security"
      bullets={[
        "Protocol, redirect, and homograph signal checklist.",
        "Safe triage prompts for phishing desks.",
        "Vendor-backed deep analysis when keys are configured.",
      ]}
      primaryAction={{ href: "/tools/url-analysis", label: "Open URL analysis" }}
      related={[
        { href: "/tools/suspicious-url", label: "Suspicious URL checker" },
        { href: "/tools/phishing-url-checklist", label: "Phishing URL heuristics" },
      ]}
    />
  );
}

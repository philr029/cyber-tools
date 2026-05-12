"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function EmailSubjectLineTesterPage() {
  return (
    <ToolkitPlaceholder
      title="Email Subject Line Tester"
      description="Length, curiosity, and preview-text checklist for high-stakes sends — routes into the subject line generator."
      category="Marketing"
      bullets={[
        "Mobile preview width and power-word audit.",
        "Personalisation token safety check.",
        "Spam-trigger heuristics without vendor lock-in.",
      ]}
      primaryAction={{ href: "/tools/marketing/subject-line-generator", label: "Open subject line generator" }}
      related={[
        { href: "/tools/business/email", label: "Professional email generator" },
        { href: "/marketing-tools", label: "Marketing hub" },
      ]}
    />
  );
}

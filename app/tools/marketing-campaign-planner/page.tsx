"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function MarketingCampaignPlannerPage() {
  return (
    <ToolkitPlaceholder
      title="Marketing Campaign Planner"
      description="Channel mix, measurement, and creative matrix for launches — complements UTM hygiene and attribution tooling."
      category="Marketing"
      bullets={[
        "Objectives, audiences, and KPI tree.",
        "Creative variants per channel with CTA mapping.",
        "Budget guardrails and experiment backlog.",
      ]}
      primaryAction={{ href: "/marketing-tools", label: "Open marketing hub" }}
      related={[
        { href: "/tools/marketing/utm-builder", label: "UTM builder" },
        { href: "/tools/marketing/blog-title-generator", label: "Blog title generator" },
      ]}
    />
  );
}

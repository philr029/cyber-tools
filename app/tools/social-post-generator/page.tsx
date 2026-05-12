"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function SocialPostGeneratorPage() {
  return (
    <ToolkitPlaceholder
      title="Social Media Post Generator"
      description="Hooks, tone, and CTA prompts per platform — portfolio route alongside the LinkedIn-specific generator."
      category="Marketing"
      bullets={[
        "Character-aware drafts for LinkedIn, X, and Threads.",
        "Hashtag discipline and brand safety pass.",
        "UTM-aware CTA linking patterns.",
      ]}
      primaryAction={{ href: "/tools/marketing/linkedin-post-generator", label: "Open LinkedIn generator" }}
      related={[
        { href: "/marketing-tools", label: "Marketing hub" },
        { href: "/tools/meta-preview", label: "Meta preview" },
      ]}
    />
  );
}

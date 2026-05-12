"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function KeywordCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="Keyword Checker"
      description="Editorial and SEO checklist for intent, cannibalisation, and SERP snippet fit — no black-box scoring, just disciplined prompts."
      category="Marketing"
      bullets={[
        "Map primary vs secondary intent for each URL.",
        "Detect overlapping targets across sections.",
        "Snippet and heading alignment pass.",
      ]}
      related={[
        { href: "/tools/qa/seo-meta", label: "SEO meta tag checker" },
        { href: "/tools/meta-preview", label: "Meta preview" },
        { href: "/marketing-tools", label: "Marketing hub" },
      ]}
    />
  );
}

"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function SeoMetaCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="SEO Meta Checker"
      description="Portfolio-friendly alias into the structured SEO meta pass — titles, robots, canonical, hreflang, and social cards."
      category="Web QA"
      bullets={[
        "Indexability and duplicate canonical checks.",
        "Open Graph / Twitter card completeness.",
        "Hreflang pairing sanity for multilingual sites.",
      ]}
      primaryAction={{ href: "/tools/qa/seo-meta", label: "Open SEO meta tag checker" }}
      related={[
        { href: "/tools/meta-preview", label: "Meta preview" },
        { href: "/web-tools", label: "Website testing hub" },
      ]}
    />
  );
}

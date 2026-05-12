"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function SitemapCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="Sitemap Checker"
      description="Structured review for XML sitemaps — coverage, priority noise, and indexation signals before you ship SEO changes."
      category="Web QA"
      bullets={[
        "Validate lastmod cadence vs real content churn.",
        "Spot orphan clusters and oversized URL lists.",
        "Cross-check robots.txt allow/disallow conflicts.",
      ]}
      related={[
        { href: "/tools/broken-links", label: "Broken link checker" },
        { href: "/tools/qa/seo-meta", label: "SEO meta tag checker" },
        { href: "/web-tools", label: "Website testing hub" },
      ]}
    />
  );
}

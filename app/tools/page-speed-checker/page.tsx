"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function PageSpeedCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="Page Speed Checker"
      description="Lab-style checklist for LCP, CLS, INP, and TTFB — pairs with the page speed checklist for release gates."
      category="Web QA"
      bullets={[
        "Image, font, and script budget prompts.",
        "Third-party tag governance and consent impacts.",
        "Measurement plan for field vs lab data.",
      ]}
      primaryAction={{ href: "/tools/page-speed-checklist", label: "Open page speed checklist" }}
      related={[
        { href: "/tools/mobile-responsiveness", label: "Mobile responsiveness" },
        { href: "/web-tools", label: "Website testing hub" },
      ]}
    />
  );
}

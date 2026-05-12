"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function MxDnsCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="MX / DNS Checker"
      description="Mail-focused DNS pass — MX priority, SPF alignment, DKIM selectors, and DMARC policy tone."
      category="DNS"
      bullets={[
        "Validate MX targets and TTL expectations.",
        "Cross-check SPF include chains for risky flattening.",
        "DMARC alignment mode vs your sending sources.",
      ]}
      primaryAction={{ href: "/tools/dns-lookup", label: "Open DNS lookup" }}
      related={[
        { href: "/tools/email-deliverability", label: "Email deliverability" },
        { href: "/tools/email-security-checklist", label: "Email security checklist" },
      ]}
    />
  );
}

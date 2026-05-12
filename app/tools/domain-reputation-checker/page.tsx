"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function DomainReputationCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="Domain Reputation Checker"
      description="Portfolio landing page for domain verdict workflows — jump straight into the live multi-engine reputation cards."
      category="DNS"
      bullets={[
        "Compare passive DNS, WHOIS age, and vendor verdicts side by side.",
        "Capture registrar and nameserver drift for renewals.",
        "Export-ready notes for SOC triage.",
      ]}
      primaryAction={{ href: "/tools/domain-lookup", label: "Open domain reputation" }}
      related={[
        { href: "/tools/security/domain-reputation", label: "Vendor API domain reputation" },
        { href: "/domain-ip-tools", label: "Domain & IP hub" },
      ]}
    />
  );
}

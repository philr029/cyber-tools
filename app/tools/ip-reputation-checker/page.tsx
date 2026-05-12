"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function IpReputationCheckerPage() {
  return (
    <ToolkitPlaceholder
      title="IP Reputation Checker"
      description="Focused entry point for ASN, abuse desk, and geolocation context — routes into the live IP reputation module."
      category="Security"
      bullets={[
        "Abuse score, ASN, and country signals in one pass.",
        "Compare passive vs active telemetry where available.",
        "Export-friendly narrative for tickets.",
      ]}
      primaryAction={{ href: "/tools/ip-lookup", label: "Open IP reputation" }}
      related={[
        { href: "/tools/geo-lookup", label: "IP geolocation" },
        { href: "/domain-ip-tools", label: "Domain & IP hub" },
      ]}
    />
  );
}

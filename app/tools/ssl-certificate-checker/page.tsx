"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function SslCertificateCheckerAliasPage() {
  return (
    <ToolkitPlaceholder
      title="SSL Certificate Checker"
      description="Alias route for portfolios and deep links — identical functionality to the live SSL module."
      category="Security"
      bullets={[
        "Inspect chain completeness, SAN coverage, and expiry windows.",
        "Note protocol and cipher posture against modern baselines.",
        "Track renewal owners and comms templates.",
      ]}
      primaryAction={{ href: "/tools/ssl-checker", label: "Open SSL checker" }}
      related={[
        { href: "/tools/ssl-checklist", label: "SSL renewal checklist" },
        { href: "/cyber-tools", label: "Security hub" },
      ]}
    />
  );
}

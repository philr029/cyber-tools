"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function EmailHeaderAnalyserPage() {
  return (
    <ToolkitPlaceholder
      title="Email Header Analyser"
      description="UK-spelling route into the same header forensics toolkit — SPF, DKIM, DMARC, and routing hops."
      category="DNS"
      bullets={[
        "Paste raw headers for authentication alignment checks.",
        "Surface suspicious routing hops and mailing lists.",
        "Pair with deliverability checklist for bounces.",
      ]}
      primaryAction={{ href: "/tools/email-headers", label: "Open email headers tool" }}
      related={[
        { href: "/tools/phishing-email-analyser", label: "Phishing email analyser" },
        { href: "/tools/email-security-checklist", label: "Email security checklist" },
      ]}
    />
  );
}

"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

export default function EmailDeliverabilityPage() {
  return (
    <GeneratorTool
      title="Email Deliverability Checker"
      description="Generate a demo deliverability report for a sending domain — SPF, DKIM, DMARC, MX, and blacklist exposure checklist."
      skill="Email auth, DNS, deliverability troubleshooting."
      why="Quickest way to diagnose 'why are my emails landing in spam?' before opening a deeper investigation."
      futureApi="Wire to Google DoH / dns.google for SPF, DKIM, DMARC records, and HetrixTools / MxToolbox for live blacklist data."
      outputBadge="Demo result · run DNS Lookup for live records"
      inputs={[
        { id: "domain", label: "Sending domain", placeholder: "example.com", required: true, span: "full" },
        { id: "selector", label: "DKIM selector(s)", placeholder: "selector1, google" },
      ]}
      generate={(v) => {
        if (!v.domain) return "";
        const lines: string[] = [];
        lines.push(`# Email Deliverability Report — ${v.domain} (Demo)`);
        lines.push("");
        lines.push("## SPF");
        lines.push(`- [ ] TXT record at \`${v.domain}\` starts with \`v=spf1\`.`);
        lines.push("- [ ] Includes every legitimate sender (M365, Mailgun, Postmark, marketing platform).");
        lines.push("- [ ] Ends with `-all` once policy is stable.");
        lines.push("- [ ] Under the 10-DNS-lookup limit.");
        lines.push("");
        lines.push("## DKIM");
        const selectors = (v.selector || "selector1, selector2").split(/[\s,]+/).filter(Boolean);
        for (const s of selectors) {
          lines.push(`- [ ] CNAME / TXT at \`${s}._domainkey.${v.domain}\` resolves to a public key.`);
        }
        lines.push("- [ ] At least one selector signs every outbound message (check headers).");
        lines.push("- [ ] Key rotated within the last 12 months.");
        lines.push("");
        lines.push("## DMARC");
        lines.push(`- [ ] TXT record at \`_dmarc.${v.domain}\` exists.`);
        lines.push("- [ ] Policy at least `p=quarantine` (preferably `p=reject`).");
        lines.push("- [ ] `rua=mailto:...` reporting address monitored.");
        lines.push("- [ ] `pct=100` once aligned reports look clean.");
        lines.push("");
        lines.push("## MX");
        lines.push(`- [ ] MX records at \`${v.domain}\` point to the intended mail gateway.`);
        lines.push("- [ ] No stale records from previous mail platforms.");
        lines.push("- [ ] Backup/lower-priority MX is documented and intentional.");
        lines.push("");
        lines.push("## Blacklist exposure");
        lines.push("- [ ] Sender IPs not present on Spamhaus, Barracuda or SORBS (demo placeholder).");
        lines.push("- [ ] Sending domain has no blacklist hits in the last 30 days.");
        lines.push("- [ ] Daily blacklist check scheduled (see /tools/blacklist-monitor).");
        lines.push("");
        lines.push("## Bonus");
        lines.push(`- [ ] MTA-STS policy published at \`https://mta-sts.${v.domain}/.well-known/mta-sts.txt\`.`);
        lines.push(`- [ ] TLS-RPT TXT record at \`_smtp._tls.${v.domain}\` to receive failure reports.`);
        lines.push("- [ ] BIMI considered once DMARC is `p=reject` enforced.");
        lines.push("");
        lines.push("---");
        lines.push("_Demo data — wire to dns.google + MxToolbox / HetrixTools for live records & blacklist status._");
        return lines.join("\n");
      }}
    />
  );
}

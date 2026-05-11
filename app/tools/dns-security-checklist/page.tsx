"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

export default function DnsSecurityChecklistPage() {
  return (
    <GeneratorTool
      title="DNS Security Checklist"
      description="Generate a demo DNS hardening checklist for a domain — SPF, DKIM, DMARC, MX, TXT, CAA and DNSSEC. Use /tools/dns-lookup for live records."
      skill="DNS internals, email auth (SPF/DKIM/DMARC), DNSSEC, CAA."
      why="DNS is the foundation of every mail and reputation conversation — get the records right or lose deliverability."
      futureApi="Wire to dns.google / 1.1.1.1 DoH endpoints or Cloudflare API to pull live records."
      outputBadge="Demo result · run DNS Lookup tool for live records"
      inputs={[
        { id: "domain", label: "Domain", placeholder: "example.com", required: true, span: "full" },
        {
          id: "provider",
          label: "Mail provider",
          type: "select",
          options: [
            { value: "m365", label: "Microsoft 365" },
            { value: "gws", label: "Google Workspace" },
            { value: "other", label: "Other / unknown" },
          ],
          defaultValue: "m365",
        },
      ]}
      generate={(v) => {
        if (!v.domain) return "";
        const isM365 = v.provider === "m365";
        const isGws = v.provider === "gws";
        const lines: string[] = [];
        lines.push(`# DNS Security Checklist for ${v.domain} (Demo)`);
        lines.push("");
        lines.push("## SPF (TXT record)");
        if (isM365) {
          lines.push("- [ ] `v=spf1 include:spf.protection.outlook.com -all` (M365 baseline).");
        } else if (isGws) {
          lines.push("- [ ] `v=spf1 include:_spf.google.com ~all` (Google Workspace baseline).");
        } else {
          lines.push("- [ ] Single SPF record present. Use `include:` for each legitimate sender.");
        }
        lines.push("- [ ] No more than 10 DNS lookups in total (else SPF will permerror).");
        lines.push("- [ ] Use `-all` once the policy is stable. Avoid `+all` and `?all`.");
        lines.push("");
        lines.push("## DKIM");
        if (isM365) {
          lines.push("- [ ] Enable DKIM in the Defender portal for both selector1 and selector2.");
          lines.push("- [ ] CNAMEs `selector1._domainkey.${v.domain}` and `selector2._domainkey.${v.domain}` resolve.");
        } else if (isGws) {
          lines.push("- [ ] Generate the DKIM key in Admin → Apps → Gmail → Authenticate Email.");
          lines.push("- [ ] TXT record `google._domainkey.${v.domain}` published with the public key.");
        } else {
          lines.push("- [ ] At least one selector publishes a public key. Rotate annually.");
        }
        lines.push("");
        lines.push("## DMARC");
        lines.push(`- [ ] TXT record at \`_dmarc.${v.domain}\` exists.`);
        lines.push("- [ ] Start at `p=none` with rua/ruf reporting addresses to baseline the data.");
        lines.push("- [ ] Move to `p=quarantine` after 2–4 weeks of clean SPF/DKIM alignment.");
        lines.push("- [ ] Finish at `p=reject` once all senders are aligned.");
        lines.push("- [ ] Consider DMARC reporting service (e.g. Postmark, dmarcian, Valimail).");
        lines.push("");
        lines.push("## MX");
        if (isM365) {
          lines.push(`- [ ] \`${v.domain.replace(/\./g, "-")}.mail.protection.outlook.com\` priority 0.`);
        } else if (isGws) {
          lines.push("- [ ] `smtp.google.com` priority 1 (single record — Google Workspace 2023+).");
        } else {
          lines.push("- [ ] Lowest priority MX points to the correct mail gateway.");
        }
        lines.push("- [ ] No duplicate / orphan MX records left over from previous providers.");
        lines.push("");
        lines.push("## Other hardening");
        lines.push("- [ ] CAA records limit which CA can issue certificates for this domain.");
        lines.push("- [ ] DNSSEC enabled at the registrar (DS records published in the parent zone).");
        lines.push("- [ ] TXT verification entries (Microsoft, Google, Atlassian etc.) are still needed — prune stale entries annually.");
        lines.push("- [ ] No wildcard A or MX records unless explicitly required.");
        lines.push("");
        lines.push("## MTA-STS / TLS-RPT");
        lines.push("- [ ] Publish an MTA-STS policy file at `https://mta-sts.${v.domain}/.well-known/mta-sts.txt`.");
        lines.push("- [ ] Add `_mta-sts.${v.domain}` and `_smtp._tls.${v.domain}` TXT records.");
        lines.push("- [ ] Forward TLS-RPT reports to a monitored mailbox.");
        lines.push("");
        lines.push("---");
        lines.push("_Demo checklist — pair with /tools/dns-lookup or /tools/email-security-checklist for live confirmation._");
        return lines.join("\n");
      }}
    />
  );
}

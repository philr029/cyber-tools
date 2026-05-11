"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

function daysFromToday(date: string): number | null {
  if (!date) return null;
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

export default function SslChecklistPage() {
  return (
    <GeneratorTool
      title="SSL Certificate Checklist"
      description="Plan certificate renewal — issuer placeholder, expiry reminder, HTTPS posture and renewal actions. Use the live SSL Checker if you need real chain data."
      skill="TLS lifecycle, ACME / Let's Encrypt automation, HSTS strategy."
      why="Expired certs cause the worst customer experience — a full browser interstitial."
      futureApi="Wire to Qualys SSL Labs (api.ssllabs.com) or crt.sh for live chain, OCSP, and grade data."
      outputBadge="Demo result · no live cert fetched"
      inputs={[
        { id: "domain", label: "Domain", placeholder: "example.com", required: true, span: "full" },
        { id: "issuer", label: "Expected issuer (optional)", placeholder: "e.g. Let's Encrypt, DigiCert" },
        { id: "expiry", label: "Cert expiry date", type: "date" },
      ]}
      generate={(v) => {
        if (!v.domain) return "";
        const days = daysFromToday(v.expiry);
        const lines: string[] = [];
        lines.push(`# SSL Certificate Renewal Checklist (Demo)`);
        lines.push("");
        lines.push(`**Domain:** ${v.domain}`);
        lines.push(`**Issuer:** ${v.issuer || "_placeholder — connect crt.sh / SSL Labs to confirm_"}`);
        lines.push(`**HTTPS expected:** Yes — redirect all HTTP to HTTPS with 301.`);
        if (days === null) {
          lines.push(`**Expiry:** _not provided_`);
        } else if (days < 0) {
          lines.push(`**Expiry:** Expired ${Math.abs(days)} day(s) ago — emergency renewal required.`);
        } else if (days <= 14) {
          lines.push(`**Expiry:** ${days} day(s) — within renewal window, act now.`);
        } else if (days <= 30) {
          lines.push(`**Expiry:** ${days} day(s) — schedule renewal this week.`);
        } else {
          lines.push(`**Expiry:** ${days} day(s) remaining.`);
        }
        lines.push("");
        lines.push("## Pre-renewal checks");
        lines.push("- [ ] Confirm DNS CAA record allows the chosen issuer.");
        lines.push("- [ ] Confirm renewal automation (ACME / Cloudflare / load-balancer) is healthy.");
        lines.push("- [ ] Verify all SANs and wildcards are still required — remove unused names.");
        lines.push("- [ ] Document private-key custody (HSM, secret manager, deployment pipeline).");
        lines.push("");
        lines.push("## Renewal actions");
        lines.push("- [ ] Issue new certificate at least 14 days before expiry.");
        lines.push("- [ ] Deploy to all hosts and CDN edges — confirm with `openssl s_client -connect <host>:443`.");
        lines.push("- [ ] Verify chain order and intermediate certificates are served.");
        lines.push("- [ ] Confirm HSTS header still present and max-age unchanged.");
        lines.push("- [ ] Update monitoring/alerting with new expiry date.");
        lines.push("");
        lines.push("## Post-renewal validation");
        lines.push("- [ ] SSL Labs grade A or better.");
        lines.push("- [ ] OCSP stapling enabled where supported.");
        lines.push("- [ ] No mixed-content warnings reported by Lighthouse.");
        lines.push("- [ ] CT log entry visible in crt.sh within 1 hour.");
        lines.push("");
        lines.push("---");
        lines.push("_Demo output — use /tools/ssl-checker for live chain, key strength and protocol data._");
        return lines.join("\n");
      }}
    />
  );
}

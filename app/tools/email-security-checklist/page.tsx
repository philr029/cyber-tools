"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function EmailSecurityChecklistPage() {
  return (
    <ChecklistTool
      title="Email Security Checklist"
      description="Verify a domain is well configured for email authentication, anti-phishing, and inbound spoofing protection — SPF, DKIM, DMARC, MTA-STS, TLS-RPT and Defender for Office 365 controls."
      skill="Email authentication, DNS, Microsoft 365 mail flow"
      why="Most business email compromise still relies on weak SPF/DKIM/DMARC. A simple checklist closes the easy wins that mail security teams actually act on."
      futureApi="Wire to DNS-over-HTTPS for live SPF/DMARC/MX lookup, plus EOP / Defender for Office 365 PowerShell to verify transport rules and protection policies."
      inputs={[{ id: "domain", label: "Sending domain", placeholder: "contoso.com" }]}
      sections={[
        {
          title: "Authentication records",
          items: [
            { id: "es-a1", label: "SPF record exists, ends in -all (hard fail), and does not exceed 10 DNS lookups" },
            { id: "es-a2", label: "DKIM enabled with at least 1024-bit (ideally 2048-bit) keys for every sending platform" },
            { id: "es-a3", label: "DMARC record exists with policy p=quarantine or p=reject (not p=none)" },
            { id: "es-a4", label: "DMARC reporting addresses set (rua=) and the inbox is monitored" },
            { id: "es-a5", label: "BIMI record published (optional — improves brand trust)" },
          ],
        },
        {
          title: "Transport hardening",
          items: [
            { id: "es-t1", label: "MX records resolve and point only to approved providers" },
            { id: "es-t2", label: "MTA-STS policy published with mode=enforce" },
            { id: "es-t3", label: "TLS-RPT record published; reports forwarded to a monitored mailbox" },
            { id: "es-t4", label: "Inbound and outbound TLS forced (no opportunistic-only)" },
          ],
        },
        {
          title: "Microsoft 365 / Exchange Online",
          items: [
            { id: "es-m1", label: "Defender for Office 365 Standard / Strict preset policy applied" },
            { id: "es-m2", label: "Anti-phishing impersonation protection enabled with key VIPs added" },
            { id: "es-m3", label: "Safe Links / Safe Attachments enabled, including Teams/SharePoint" },
            { id: "es-m4", label: "Mail flow rule disallows auto-forwarding to external addresses" },
            { id: "es-m5", label: "Users have one-click Report Phishing button in Outlook" },
          ],
        },
        {
          title: "Operational",
          items: [
            { id: "es-o1", label: "Quarterly review of all third-party sending services (review SPF includes)" },
            { id: "es-o2", label: "Phishing simulation runs at least quarterly" },
            { id: "es-o3", label: "Incident response runbook for compromised mailbox is documented" },
            { id: "es-o4", label: "Mailbox audit logging enabled on all mailboxes" },
          ],
        },
      ]}
    />
  );
}

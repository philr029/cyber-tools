"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

export default function SharedMailboxPage() {
  return (
    <GeneratorTool
      title="Shared Mailbox Request Generator"
      description="Capture a shared mailbox request and get the admin checklist plus copy-paste PowerShell commands."
      skill="Exchange Online administration."
      why="Stops 'who approved this?' moments six months later and standardises permissions."
      futureApi="Wire to Microsoft Graph (/groups + Exchange Online cmdlets) via a serverless function to auto-create the mailbox and apply permissions."
      storageKey="ss.shared-mailbox"
      fields={[
        { id: "name", label: "Mailbox display name", placeholder: "Service Desk", defaultValue: "Service Desk" },
        { id: "address", label: "Email address", type: "email", placeholder: "service-desk@contoso.com", defaultValue: "service-desk@contoso.com" },
        { id: "owner", label: "Business owner", placeholder: "Jane Smith" },
        {
          id: "fullAccess",
          label: "Full Access users (comma separated)",
          placeholder: "alice@contoso.com, bob@contoso.com",
          defaultValue: "alice@contoso.com, bob@contoso.com",
        },
        {
          id: "sendAs",
          label: "Send As users (comma separated)",
          placeholder: "alice@contoso.com",
          defaultValue: "alice@contoso.com",
        },
        { id: "approval", label: "Approval reference / ticket #", placeholder: "REQ-1234" },
      ]}
      generate={(v) => {
        const fa = (v.fullAccess || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
        const sa = (v.sendAs || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

        const checklist = [
          `# Shared mailbox request — ${v.name || "(name)"}`,
          "",
          `**Address:** ${v.address || "(missing)"}`,
          `**Owner:** ${v.owner || "(missing)"}`,
          `**Approval:** ${v.approval || "(missing)"}`,
          "",
          "## Admin checklist",
          "- [ ] Verify approval recorded in ticket / change record",
          "- [ ] Confirm the address is available and matches naming convention",
          "- [ ] Create the mailbox as **shared** (no licence required up to 50 GB)",
          "- [ ] Add Full Access members",
          "- [ ] Add Send As members (only where genuinely needed)",
          "- [ ] Hide from GAL if internal-only",
          "- [ ] Add the address to monitoring / DLP scope",
          "- [ ] Notify users with sign-in instructions",
          "- [ ] Schedule a quarterly access review",
        ].join("\n");

        const ps = [
          `# PowerShell — Exchange Online`,
          `# Run after: Connect-ExchangeOnline`,
          ``,
          `New-Mailbox -Shared -Name "${v.name || "Shared Mailbox"}" -DisplayName "${v.name || "Shared Mailbox"}" -PrimarySmtpAddress "${v.address || "mailbox@contoso.com"}"`,
          ``,
          ...fa.map(
            (u) =>
              `Add-MailboxPermission -Identity "${v.address || "mailbox@contoso.com"}" -User "${u}" -AccessRights FullAccess -InheritanceType All`,
          ),
          ...sa.map(
            (u) =>
              `Add-RecipientPermission -Identity "${v.address || "mailbox@contoso.com"}" -Trustee "${u}" -AccessRights SendAs -Confirm:$false`,
          ),
          ``,
          `# Verify`,
          `Get-MailboxPermission -Identity "${v.address || "mailbox@contoso.com"}" | Where-Object {$_.User -notlike "NT AUTHORITY*"}`,
        ].join("\n");

        const note = [
          `# Approval / change note`,
          ``,
          `Approval reference: ${v.approval || "(not set)"}`,
          `Owner: ${v.owner || "(not set)"}`,
          `Permissions granted on ${new Date().toISOString().slice(0, 10)}:`,
          `- Full Access: ${fa.join(", ") || "(none)"}`,
          `- Send As: ${sa.join(", ") || "(none)"}`,
        ].join("\n");

        return [
          { label: "Admin checklist", value: checklist, language: "markdown" },
          { label: "PowerShell commands", value: ps, language: "powershell" },
          { label: "Approval note", value: note, language: "markdown" },
        ];
      }}
    />
  );
}

"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function ForwardingAuditPage() {
  return (
    <ChecklistTool
      title="Email Forwarding Rule Audit"
      description="Step-by-step audit for detecting and remediating suspicious mailbox forwarding — a classic post-compromise persistence technique."
      skill="Exchange Online, mailbox forensics."
      why="External mail forwarding is one of the highest-signal indicators of a compromised mailbox."
      storageKey="ss.forwarding-audit"
      futureApi="Wire to Graph (/users/{id}/mailFolders/inbox/messageRules) and Exchange Online cmdlets to pull rules in bulk via a serverless function."
      inputs={[
        { id: "scope", label: "Scope (tenant / OU / user)", placeholder: "Whole tenant" },
        { id: "owner", label: "Investigator", placeholder: "@you" },
      ]}
      sections={[
        {
          title: "Tenant-wide controls",
          items: [
            { id: "tw-1", label: "Outbound spam policy blocks automatic external forwarding (AutoForwardEnabled = false)" },
            { id: "tw-2", label: "Remote-domain default policy disables auto-forward" },
            { id: "tw-3", label: "Transport rule alerts on new external forwarding rules" },
          ],
        },
        {
          title: "Per-mailbox detection",
          items: [
            { id: "pm-1", label: "Get-Mailbox -ResultSize Unlimited | ?{$_.ForwardingSmtpAddress} reviewed" },
            { id: "pm-2", label: "Get-InboxRule for any mailbox with elevated risk reviewed" },
            { id: "pm-3", label: "Defender Email Explorer filtered for ForwardingSmtpAddress changes (last 30 days)" },
            { id: "pm-4", label: "Compare current rules against last known good baseline" },
          ],
        },
        {
          title: "Suspicious rule indicators",
          items: [
            { id: "si-1", label: "Forwards to external address user does not own" },
            { id: "si-2", label: "Rule name is blank, single letter, or a special character" },
            { id: "si-3", label: "Rule moves and deletes mail (hides activity from user)" },
            { id: "si-4", label: "Keywords on financial / vendor / password reset topics" },
          ],
        },
        {
          title: "Containment & remediation",
          items: [
            { id: "rm-1", label: "Disable the rule and document a copy" },
            { id: "rm-2", label: "Revoke active sessions for the affected user" },
            { id: "rm-3", label: "Reset password and re-register MFA methods" },
            { id: "rm-4", label: "Review sign-in logs and consent grants for the user" },
            { id: "rm-5", label: "Search and purge messages sent to the external address" },
            { id: "rm-6", label: "Notify the user, security lead and any affected counterparties" },
          ],
        },
      ]}
    />
  );
}

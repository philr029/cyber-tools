"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function LeaverPage() {
  return (
    <ChecklistTool
      title="Microsoft 365 Leaver Checklist"
      description="Generate a safe and auditable offboarding checklist when a user leaves the organisation — sign-in revocation, data retention, mailbox handover, and licence reclaim."
      skill="Identity lifecycle, data retention, audit-ready offboarding"
      why="Most data leakage and ex-employee incidents happen because steps are missed at offboarding. A checklist makes sure access is fully revoked and data is retained legally."
      futureApi="Microsoft Graph: revokeSignInSessions, /users/{id}/manager, /me/messages export, Compliance Center retention policies, Intune wipe/retire actions."
      inputs={[
        { id: "leaver", label: "Leaver full name", placeholder: "John Doe", required: true },
        { id: "upn", label: "UPN / primary email", placeholder: "john.doe@contoso.com" },
        { id: "lastDay", label: "Last working day", type: "date" },
        { id: "delegate", label: "Mailbox delegate / data owner", placeholder: "Manager or successor" },
        { id: "reason", label: "Reason (resignation / contract end / dismissal)", placeholder: "Resignation" },
      ]}
      deriveSummary={(v) => {
        const out: string[] = [];
        if (v.leaver) out.push(`Offboarding **${v.leaver}**${v.reason ? ` (${v.reason})` : ""}.`);
        if (v.lastDay) out.push(`Last working day: ${v.lastDay}`);
        if (v.delegate) out.push(`Data delegate / handover owner: ${v.delegate}`);
        return out;
      }}
      sections={[
        {
          title: "Immediate sign-in revocation",
          description: "Run these on or before the last day — sequence matters.",
          items: [
            { id: "lv-1", label: "Disable Entra ID sign-in (Block sign-in = Yes)" },
            { id: "lv-2", label: "Revoke all active sessions / refresh tokens" },
            { id: "lv-3", label: "Reset password to a long random value (do not share)" },
            { id: "lv-4", label: "Remove authentication methods (Authenticator, FIDO2, phone)" },
            { id: "lv-5", label: "Disable any service-account or app delegated tokens they owned" },
          ],
        },
        {
          title: "Data, mailbox & licences",
          items: [
            { id: "lv-d1", label: "Convert mailbox to shared (free of licence cost) once delegate access verified" },
            { id: "lv-d2", label: "Grant manager / delegate Full Access + Send As permissions for handover period" },
            { id: "lv-d3", label: "Forward mail to delegate during handover (with retention compliance)" },
            { id: "lv-d4", label: "Transfer OneDrive ownership to manager (retention period configured)" },
            { id: "lv-d5", label: "Reassign Teams / SharePoint site ownership where they were sole owner" },
            { id: "lv-d6", label: "Reclaim Microsoft 365 licence after data preservation period" },
          ],
        },
        {
          title: "Device & endpoint",
          items: [
            { id: "lv-dev1", label: "Issue Intune Retire / Wipe on corporate-managed devices" },
            { id: "lv-dev2", label: "Remove Autopilot device assignment if hardware is being recycled" },
            { id: "lv-dev3", label: "Confirm physical device return, log asset tag in asset register" },
          ],
        },
        {
          title: "Compliance & audit trail",
          items: [
            { id: "lv-c1", label: "Apply retention / litigation hold if required for legal or HR reasons" },
            { id: "lv-c2", label: "Export Entra ID audit log entries for the account" },
            { id: "lv-c3", label: "Remove from all distribution lists and dynamic groups" },
            { id: "lv-c4", label: "Notify line-of-business app owners (CRM, finance, ticketing) to revoke access" },
            { id: "lv-c5", label: "File offboarding ticket with sign-off from HR and IT manager" },
          ],
        },
      ]}
    />
  );
}

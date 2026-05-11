"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function NewStarterPage() {
  return (
    <ChecklistTool
      title="Microsoft 365 New Starter Checklist"
      description="Generate a comprehensive onboarding checklist for provisioning a new Microsoft 365 user — covering identity, licensing, mailbox, device, and security baselines."
      skill="Microsoft 365 identity & lifecycle administration"
      why="A consistent new-starter process prevents over-licensing, forgotten access, and security gaps on day one. Hiring managers, IT, and security teams all rely on the same playbook."
      futureApi="Wire to Microsoft Graph (/users, /groups, assignLicense, /me/teamwork) to auto-create the account, assign license SKUs and groups, and verify MFA enrolment status."
      inputs={[
        { id: "starter", label: "Starter full name", placeholder: "Jane Smith", required: true },
        { id: "upn", label: "User principal name (UPN)", placeholder: "jane.smith@contoso.com", type: "email" },
        { id: "role", label: "Job role / team", placeholder: "Service Desk Engineer" },
        { id: "manager", label: "Line manager", placeholder: "Alex Lee" },
        { id: "start", label: "Start date", type: "date" },
      ]}
      deriveSummary={(v) => {
        const out: string[] = [];
        if (v.starter) out.push(`Onboarding **${v.starter}** as **${v.role || "new starter"}**.`);
        if (v.upn) out.push(`Primary UPN: ${v.upn}`);
        if (v.manager) out.push(`Reports to: ${v.manager}`);
        if (v.start) out.push(`Start date: ${v.start}`);
        return out;
      }}
      sections={[
        {
          title: "Identity & account",
          description: "Create the account once, then everything else hangs off it.",
          items: [
            { id: "ns-1", label: "Create Entra ID / Microsoft 365 user with correct UPN and display name", hint: "Use firstname.lastname format unless an exception is documented." },
            { id: "ns-2", label: "Set initial password and force change on first sign-in" },
            { id: "ns-3", label: "Confirm usage location and preferred language" },
            { id: "ns-4", label: "Assign to the appropriate department / dynamic security group" },
            { id: "ns-5", label: "Set manager attribute (drives access reviews and approvals)" },
          ],
        },
        {
          title: "Licensing & mailbox",
          items: [
            { id: "ns-l1", label: "Assign correct Microsoft 365 / Business / E3 / E5 SKU" },
            { id: "ns-l2", label: "Verify Exchange Online mailbox provisioned and has the right alias addresses" },
            { id: "ns-l3", label: "Confirm OneDrive provisioned and storage quota is appropriate" },
            { id: "ns-l4", label: "Set out-of-office / signature template if applicable" },
            { id: "ns-l5", label: "Add to required shared mailboxes / distribution lists" },
          ],
        },
        {
          title: "Security baseline",
          items: [
            { id: "ns-s1", label: "Enforce MFA via Conditional Access (no per-user MFA legacy state)" },
            { id: "ns-s2", label: "Register Microsoft Authenticator or a passkey before first sign-in" },
            { id: "ns-s3", label: "Confirm Self-Service Password Reset (SSPR) registration" },
            { id: "ns-s4", label: "Verify Conditional Access policy assignment (block legacy auth, require compliant device)" },
            { id: "ns-s5", label: "Enrol device into Intune / Autopilot with compliance policies applied" },
          ],
        },
        {
          title: "Apps, collaboration & access",
          items: [
            { id: "ns-a1", label: "Add to Teams teams and channels relevant to their role" },
            { id: "ns-a2", label: "Grant SharePoint site permissions (use AD/security groups, not direct user grants)" },
            { id: "ns-a3", label: "Provision line-of-business app access (CRM, ticketing, finance, etc.)" },
            { id: "ns-a4", label: "Send welcome pack: sign-in guide, MFA setup, security policy, helpdesk contact" },
            { id: "ns-a5", label: "Schedule 7-day check-in with line manager and IT" },
          ],
        },
      ]}
    />
  );
}

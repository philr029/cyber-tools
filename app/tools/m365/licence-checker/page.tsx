"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const MOCK_LICENCE_TABLE: Record<string, { assigned: string[]; missing: string[]; status: string }> = {
  "jane.smith@contoso.com": {
    assigned: ["Microsoft 365 Business Premium", "Microsoft Defender for Business"],
    missing: ["Microsoft Teams Phone Standard"],
    status: "Active",
  },
  "leaver@contoso.com": {
    assigned: ["Microsoft 365 Business Basic"],
    missing: ["Exchange Online Plan 2", "Power BI Pro"],
    status: "Sign-in blocked",
  },
};

function fakeForEmail(email: string) {
  const key = email.toLowerCase().trim();
  if (MOCK_LICENCE_TABLE[key]) return MOCK_LICENCE_TABLE[key];
  // Deterministic mock based on email
  const seed = key.length % 3;
  const assignedSets = [
    ["Microsoft 365 E3", "Microsoft Intune Plan 1", "Power BI Pro"],
    ["Microsoft 365 Business Standard", "Visio Plan 2"],
    ["Microsoft 365 E5", "Defender for Office 365 (Plan 2)", "Microsoft Teams Phone Standard"],
  ];
  const missingSets = [
    ["Microsoft Defender for Endpoint P2"],
    ["Microsoft Teams Phone Standard", "Microsoft Stream"],
    ["Microsoft Viva Suite"],
  ];
  return {
    assigned: assignedSets[seed],
    missing: missingSets[seed],
    status: "Active",
  };
}

export default function M365LicenceCheckerPage() {
  return (
    <GeneratorTool
      title="Microsoft 365 Licence Checker"
      description="Look up demo licence assignments for a user — including assigned products, missing add-ons commonly needed for their role, and a recommended action."
      skill="Microsoft Graph (subscribedSkus, assignLicense) integration design."
      why="Stops you provisioning the wrong SKU and wasting £8–£40 per user per month."
      futureApi="Wire to Microsoft Graph: GET /users/{id}/licenseDetails and /subscribedSkus to read real licence state and surface reclaim candidates."
      outputBadge="Demo result · no live tenant connected"
      inputs={[
        {
          id: "email",
          label: "User email (UPN)",
          placeholder: "jane.smith@contoso.com",
          type: "email",
          required: true,
          span: "full",
        },
        {
          id: "role",
          label: "Job role (optional)",
          placeholder: "e.g. Service Desk Engineer",
        },
      ]}
      validate={(v) => {
        if (!v.email) return [];
        if (!v.email.includes("@")) return ["Email must contain '@'."];
        return [];
      }}
      generate={(v) => {
        if (!v.email) return "";
        const data = fakeForEmail(v.email);
        const lines: string[] = [];
        lines.push(`# Microsoft 365 Licence Report (Demo)`);
        lines.push("");
        lines.push(`**User:** ${v.email}`);
        if (v.role) lines.push(`**Role:** ${v.role}`);
        lines.push(`**Status:** ${data.status}`);
        lines.push("");
        lines.push(`## Assigned products`);
        for (const p of data.assigned) lines.push(`- ${p}`);
        lines.push("");
        lines.push(`## Missing / suggested add-ons`);
        if (data.missing.length === 0) lines.push("- None — looks fully provisioned for the role.");
        for (const m of data.missing) lines.push(`- ${m}`);
        lines.push("");
        lines.push(`## Suggested action`);
        if (data.status === "Sign-in blocked") {
          lines.push("- Reclaim and reassign licences — user is currently blocked.");
          lines.push("- Confirm leaver / offboarding workflow has completed.");
        } else if (data.missing.length > 0) {
          lines.push("- Open a licence request for the missing add-ons listed above.");
          lines.push("- Verify business approval / cost-centre before assigning.");
        } else {
          lines.push("- No changes recommended.");
        }
        lines.push("");
        lines.push("---");
        lines.push("_Demo data — connect Microsoft Graph (Directory.Read.All, LicenseAssignment.ReadWrite.All) to replace._");
        return lines.join("\n");
      }}
    />
  );
}

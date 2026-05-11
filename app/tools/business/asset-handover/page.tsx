"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function AssetHandoverPage() {
  return (
    <ChecklistTool
      title="Asset Handover Checklist"
      description="Hand a laptop and accounts over to a new starter (or recover them from a leaver) with a clean audit trail."
      skill="IT asset lifecycle, evidence-based offboarding."
      why="Hardware and account loose ends are the most common offboarding blunders — and the easiest data-loss prevention win."
      futureApi="Wire to your asset management tool (Snipe-IT, Lansweeper, Jamf) to pull the actual asset record automatically."
      inputs={[
        { id: "employee", label: "Employee name", placeholder: "Jane Smith", required: true },
        { id: "email", label: "User email", placeholder: "jane.smith@contoso.com", type: "email" },
        { id: "device", label: "Device type / model", placeholder: "Dell Latitude 7440" },
        { id: "tag", label: "Asset tag / serial", placeholder: "ASS-1234 / 5CG12345AB" },
        { id: "date", label: "Handover date", type: "date" },
      ]}
      deriveSummary={(v) => {
        const out: string[] = [];
        if (v.employee && v.device) out.push(`Handing over **${v.device}** to **${v.employee}**.`);
        if (v.tag) out.push(`Asset tag: ${v.tag}`);
        if (v.email) out.push(`Primary account: ${v.email}`);
        if (v.date) out.push(`Handover date: ${v.date}`);
        return out;
      }}
      sections={[
        {
          title: "Hardware",
          items: [
            { id: "hw-1", label: "Laptop sanitised / re-imaged (if reissue)" },
            { id: "hw-2", label: "Charger and country-correct power lead included" },
            { id: "hw-3", label: "Docking station or USB-C hub (if assigned)" },
            { id: "hw-4", label: "Headset or webcam (if applicable)" },
            { id: "hw-5", label: "Carry case / sleeve" },
            { id: "hw-6", label: "Asset tag attached and matches asset register" },
          ],
        },
        {
          title: "Accounts & access",
          items: [
            { id: "acc-1", label: "Microsoft 365 / Entra ID account active and licensed" },
            { id: "acc-2", label: "Initial password handed over securely (out-of-band)" },
            { id: "acc-3", label: "Force change at first sign-in enabled" },
            { id: "acc-4", label: "Self-Service Password Reset (SSPR) enrolment guided" },
            { id: "acc-5", label: "Required line-of-business apps verified (CRM, ticketing, finance)" },
          ],
        },
        {
          title: "Security baseline",
          items: [
            { id: "sec-1", label: "MFA registered (Authenticator / FIDO2)" },
            { id: "sec-2", label: "Device enrolled in Intune / Autopilot" },
            { id: "sec-3", label: "Compliance policy confirms green status" },
            { id: "sec-4", label: "BitLocker enabled; recovery key escrowed to Entra" },
            { id: "sec-5", label: "Defender for Endpoint onboarded — last seen today" },
          ],
        },
        {
          title: "Policies & acknowledgements",
          items: [
            { id: "pol-1", label: "Acceptable Use Policy signed" },
            { id: "pol-2", label: "Data Protection / GDPR briefing acknowledged" },
            { id: "pol-3", label: "Asset Loan Agreement signed (this checklist)" },
            { id: "pol-4", label: "Security awareness training scheduled / completed" },
          ],
        },
        {
          title: "Sign-off",
          items: [
            { id: "so-1", label: "User confirmed device boots, signs in, and apps work" },
            { id: "so-2", label: "Photo / receipt evidence stored against asset record" },
            { id: "so-3", label: "Helpdesk ticket closed with handover note" },
            { id: "so-4", label: "Manager / HR notified of completion" },
          ],
        },
      ]}
    />
  );
}

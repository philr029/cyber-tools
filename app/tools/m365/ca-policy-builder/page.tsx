"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

export default function M365CaPolicyBuilderPage() {
  return (
    <GeneratorTool
      title="Conditional Access Policy Builder"
      description="Sketch a Conditional Access policy from a small set of inputs — user group, target app, location, device state. Produces a clean, named-policy summary you can copy into a change request."
      skill="Entra ID Conditional Access design, Zero Trust baseline."
      why="CA sprawl is the #1 governance problem in M365. A small, well-named baseline beats dozens of overlapping policies."
      futureApi="Wire to Microsoft Graph: POST /identity/conditionalAccess/policies to provision policies in report-only mode."
      outputBadge="Demo output · review and create in report-only mode first"
      inputs={[
        {
          id: "userGroup",
          label: "User group / assignment",
          placeholder: "e.g. All staff, Finance, Privileged Roles",
          required: true,
        },
        {
          id: "app",
          label: "Cloud app",
          placeholder: "e.g. Office 365, Azure portal, Salesforce",
          required: true,
        },
        {
          id: "location",
          label: "Network location",
          type: "select",
          options: [
            { value: "any", label: "Any location" },
            { value: "trusted", label: "Trusted (named) locations only" },
            { value: "untrusted", label: "Untrusted / outside trusted countries" },
          ],
          defaultValue: "any",
        },
        {
          id: "device",
          label: "Device compliance",
          type: "select",
          options: [
            { value: "any", label: "Any device" },
            { value: "compliant", label: "Require Intune-compliant device" },
            { value: "hybrid", label: "Hybrid-joined or compliant device" },
          ],
          defaultValue: "compliant",
        },
        {
          id: "grant",
          label: "Grant control",
          type: "select",
          options: [
            { value: "mfa", label: "Require MFA" },
            { value: "mfa+compliant", label: "Require MFA AND compliant device" },
            { value: "block", label: "Block access" },
            { value: "passkey", label: "Require phishing-resistant MFA (passkey/FIDO2)" },
          ],
          defaultValue: "mfa+compliant",
        },
        {
          id: "mode",
          label: "Roll-out mode",
          type: "select",
          options: [
            { value: "report", label: "Report-only" },
            { value: "on", label: "On (enforcing)" },
            { value: "off", label: "Off" },
          ],
          defaultValue: "report",
        },
      ]}
      generate={(v) => {
        if (!v.userGroup || !v.app) return "";
        const locationLabel = {
          any: "Any location",
          trusted: "Trusted (named) locations",
          untrusted: "Untrusted / outside trusted countries",
        }[v.location] ?? "Any location";
        const deviceLabel = {
          any: "Any device",
          compliant: "Intune-compliant device required",
          hybrid: "Hybrid-joined or compliant device required",
        }[v.device] ?? "Any device";
        const grantLabel = {
          mfa: "Require MFA",
          "mfa+compliant": "Require MFA AND compliant device",
          block: "Block access",
          passkey: "Require phishing-resistant MFA (passkey / FIDO2)",
        }[v.grant] ?? "Require MFA";
        const modeLabel = { report: "Report-only", on: "On", off: "Off" }[v.mode] ?? "Report-only";

        const policyName = `CA-${slug(v.userGroup)}-${slug(v.app)}-${v.grant === "block" ? "Block" : "Require" + (v.grant === "passkey" ? "Passkey" : "Mfa")}`;

        const lines: string[] = [];
        lines.push(`# Conditional Access policy: ${policyName}`);
        lines.push("");
        lines.push(`> Naming convention: CA-<scope>-<app>-<intent>. Keep policy names short, predictable, and unique.`);
        lines.push("");
        lines.push("## Assignments");
        lines.push(`- **Users:** ${v.userGroup}`);
        lines.push(`- **Cloud apps:** ${v.app}`);
        lines.push(`- **Locations:** ${locationLabel}`);
        lines.push(`- **Device platforms:** All`);
        lines.push("");
        lines.push("## Conditions");
        lines.push(`- **Client apps:** Browser + Modern auth clients (block legacy auth separately).`);
        lines.push(`- **Sign-in risk:** Not configured (add risk-based policy as a separate baseline).`);
        lines.push("");
        lines.push("## Access controls");
        lines.push(`- **Grant:** ${grantLabel}`);
        lines.push(`- **Device:** ${deviceLabel}`);
        lines.push(`- **Session:** Use sign-in frequency 8h for privileged roles (optional).`);
        lines.push("");
        lines.push("## Roll-out");
        lines.push(`- **State:** ${modeLabel}`);
        lines.push(`- Pilot with a small group (5–10 users) before enabling tenant-wide.`);
        lines.push(`- Always exclude a documented break-glass account from CA.`);
        lines.push(`- Monitor sign-in logs (CA result = failure) for 7 days before flipping to On.`);
        lines.push("");
        lines.push("## Change-management notes");
        lines.push(`- **Rollback:** Set state back to Off; CA changes apply within ~10 minutes.`);
        lines.push(`- **Communication:** Notify affected users 48h before enforcement.`);
        lines.push(`- **Validation:** Use What If tool to confirm policy hits intended sign-ins only.`);
        return lines.join("\n");
      }}
    />
  );
}

function slug(s: string) {
  return s.trim().replace(/[^a-zA-Z0-9]+/g, "");
}

"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

function fakeForDevice(name: string) {
  const seed = name.toLowerCase().length % 3;
  const sets = [
    {
      enrolment: "Enrolled (Autopilot)",
      compliance: "Compliant",
      encryption: "BitLocker enabled — recovery key escrowed",
      defender: "Defender for Endpoint onboarded · last seen 2h ago",
      updates: "Up to date · last patch 6 days ago",
      risk: "Low",
    },
    {
      enrolment: "Enrolled (manual)",
      compliance: "Non-compliant (out-of-date OS)",
      encryption: "BitLocker enabled",
      defender: "Defender onboarded · EDR active",
      updates: "Missing 2 monthly patches",
      risk: "Medium",
    },
    {
      enrolment: "Not enrolled",
      compliance: "Unknown",
      encryption: "BitLocker not detected",
      defender: "Not onboarded",
      updates: "Unknown — no telemetry available",
      risk: "High",
    },
  ];
  return sets[seed];
}

export default function M365DeviceReadinessPage() {
  return (
    <GeneratorTool
      title="Intune Device Readiness Checker"
      description="Generate a demo device-readiness report — enrolment, compliance, encryption, Defender posture and update status — for a given device."
      skill="Microsoft Intune, Defender for Endpoint, device compliance baselines."
      why="A device that isn't enrolled, encrypted and patched is the most common Conditional Access blocker."
      futureApi="Wire to Microsoft Graph: /deviceManagement/managedDevices and /security/deviceCompliancePolicySettingStateSummaries."
      outputBadge="Demo result · no live tenant connected"
      inputs={[
        {
          id: "device",
          label: "Device name or serial",
          placeholder: "e.g. SS-LAPTOP-042 or 5CG12345AB",
          required: true,
          span: "full",
        },
        {
          id: "user",
          label: "Primary user (optional)",
          placeholder: "user@contoso.com",
          type: "email",
        },
      ]}
      generate={(v) => {
        if (!v.device) return "";
        const d = fakeForDevice(v.device);
        const lines: string[] = [];
        lines.push(`# Device Readiness Report (Demo)`);
        lines.push("");
        lines.push(`**Device:** ${v.device}`);
        if (v.user) lines.push(`**Primary user:** ${v.user}`);
        lines.push(`**Overall risk:** ${d.risk}`);
        lines.push("");
        lines.push("## Posture");
        lines.push(`- **Enrolment:** ${d.enrolment}`);
        lines.push(`- **Compliance:** ${d.compliance}`);
        lines.push(`- **Encryption:** ${d.encryption}`);
        lines.push(`- **Defender:** ${d.defender}`);
        lines.push(`- **Updates:** ${d.updates}`);
        lines.push("");
        lines.push("## Recommended actions");
        if (d.risk === "High") {
          lines.push("- Enrol device into Intune via Autopilot or company-portal join.");
          lines.push("- Apply baseline compliance policy and Defender for Endpoint onboarding.");
          lines.push("- Enable BitLocker with key escrow to Entra ID.");
        } else if (d.risk === "Medium") {
          lines.push("- Push outstanding monthly updates / feature update ring.");
          lines.push("- Re-evaluate compliance status after patches install.");
        } else {
          lines.push("- No action required. Continue scheduled monitoring.");
        }
        lines.push("");
        lines.push("---");
        lines.push("_Demo data — wire to Microsoft Graph / Intune to replace._");
        return lines.join("\n");
      }}
    />
  );
}

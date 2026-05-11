"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function IntuneOnboardingPage() {
  return (
    <ChecklistTool
      title="Intune Device Onboarding Checklist"
      description="Step-by-step Intune enrolment, compliance, and Autopilot rollout checklist for Windows and mobile devices — covering MDM authority, profiles, compliance policies, and Conditional Access integration."
      skill="Microsoft Intune / endpoint management"
      why="Skipping any step here usually shows up as devices not receiving updates, Conditional Access blocking users, or apps failing to install."
      futureApi="Microsoft Graph: /deviceManagement/managedDevices, /deviceCompliancePolicies, /windowsAutopilotDeviceIdentities for live state."
      sections={[
        {
          title: "Tenant prerequisites",
          items: [
            { id: "in-p1", label: "Confirm Intune licences (or Microsoft 365 Business Premium / E3 / E5)" },
            { id: "in-p2", label: "Set MDM and MAM authority to Intune" },
            { id: "in-p3", label: "Set Automatic Enrollment for Entra-joined Windows devices" },
            { id: "in-p4", label: "Configure Apple MDM Push certificate (for iOS/macOS)" },
            { id: "in-p5", label: "Configure Android Enterprise enrolment (Managed Google Play)" },
          ],
        },
        {
          title: "Windows Autopilot",
          items: [
            { id: "in-w1", label: "Upload Autopilot hardware hashes from supplier / device" },
            { id: "in-w2", label: "Create Autopilot deployment profile (User-driven or Self-deploying)" },
            { id: "in-w3", label: "Configure Enrollment Status Page (ESP) — block until critical apps install" },
            { id: "in-w4", label: "Build Windows update rings (Pilot / Broad / Critical)" },
            { id: "in-w5", label: "Define LAPS / local admin policy" },
          ],
        },
        {
          title: "Compliance policies",
          items: [
            { id: "in-c1", label: "Require BitLocker on Windows / FileVault on macOS" },
            { id: "in-c2", label: "Require Secure Boot and TPM 2.0" },
            { id: "in-c3", label: "Minimum OS version and patch level" },
            { id: "in-c4", label: "Antivirus / Defender required and tamper protection on" },
            { id: "in-c5", label: "Block jailbroken / rooted devices on mobile" },
          ],
        },
        {
          title: "Apps & configuration",
          items: [
            { id: "in-a1", label: "Deploy Microsoft 365 Apps for Enterprise via Intune" },
            { id: "in-a2", label: "Deploy required line-of-business apps to user / device groups" },
            { id: "in-a3", label: "Configure App Protection Policies (MAM) for iOS and Android" },
            { id: "in-a4", label: "Configure Edge / browser settings, OneDrive Known Folder Move" },
            { id: "in-a5", label: "Apply Defender for Endpoint baseline policy" },
          ],
        },
        {
          title: "Validation",
          items: [
            { id: "in-v1", label: "Pilot enrol a fresh device end-to-end" },
            { id: "in-v2", label: "Verify Conditional Access marks the device compliant" },
            { id: "in-v3", label: "Verify required apps install during ESP" },
            { id: "in-v4", label: "Run a test wipe / retire on a non-prod device" },
            { id: "in-v5", label: "Publish help docs: how to reset, how to BYOD-enrol" },
          ],
        },
      ]}
    />
  );
}

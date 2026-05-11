"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function DeviceBuildPage() {
  return (
    <ChecklistTool
      title="Device Build Checklist"
      description="Every step needed to ship a Windows laptop to a user with confidence — patching, encryption, AV, Office, browser, remote access and Intune enrolment."
      skill="Endpoint engineering."
      why="A consistent build is your easiest reliability and security win."
      storageKey="ss.device-build"
      inputs={[
        { id: "asset", label: "Asset tag", placeholder: "CON-LT-0042" },
        { id: "user", label: "Primary user", placeholder: "jane.smith@contoso.com" },
        { id: "model", label: "Model", placeholder: "Dell Latitude 7440" },
      ]}
      sections={[
        {
          title: "OS & updates",
          items: [
            { id: "os-1", label: "Windows clean install or Autopilot reset complete" },
            { id: "os-2", label: "All Windows updates applied (cumulative + drivers)" },
            { id: "os-3", label: "OEM firmware / BIOS up to date" },
            { id: "os-4", label: "Time zone, locale and keyboard set" },
          ],
        },
        {
          title: "Security baseline",
          items: [
            { id: "sec-1", label: "BitLocker enabled and recovery key escrowed to Entra ID" },
            { id: "sec-2", label: "Microsoft Defender real-time protection on" },
            { id: "sec-3", label: "Defender ASR rules applied" },
            { id: "sec-4", label: "Optional: Malwarebytes / EDR agent enrolled" },
            { id: "sec-5", label: "Windows Firewall on (Domain, Private, Public)" },
            { id: "sec-6", label: "TPM 2.0 healthy and Secure Boot enabled" },
          ],
        },
        {
          title: "Applications",
          items: [
            { id: "app-1", label: "Microsoft 365 Apps installed and activated" },
            { id: "app-2", label: "Browser (Edge / Chrome) signed in to work profile" },
            { id: "app-3", label: "Required line-of-business apps deployed via Intune" },
            { id: "app-4", label: "PDF reader and any compliance tooling installed" },
          ],
        },
        {
          title: "Remote access",
          items: [
            { id: "vpn-1", label: "VPN client installed and a test tunnel works" },
            { id: "vpn-2", label: "Remote support agent (TeamViewer / RMM) enrolled" },
            { id: "vpn-3", label: "Conditional Access compliance check passes" },
          ],
        },
        {
          title: "Intune & ownership",
          items: [
            { id: "in-1", label: "Device enrolled in Intune and shown as compliant" },
            { id: "in-2", label: "Primary user assigned" },
            { id: "in-3", label: "Asset tag recorded in CMDB / asset register" },
          ],
        },
        {
          title: "Local accounts",
          items: [
            { id: "la-1", label: "No standing local admin accounts left enabled" },
            { id: "la-2", label: "Built-in administrator disabled or LAPS managed" },
            { id: "la-3", label: "User signs in once to confirm OneDrive Known Folder Move" },
          ],
        },
      ]}
    />
  );
}

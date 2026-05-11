"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function IntuneCompliancePage() {
  return (
    <ChecklistTool
      title="Intune Device Compliance Checklist"
      description="Per-device health check covering enrolment, compliance policy, BitLocker, Defender, firewall, OS patching and primary user assignment."
      skill="Endpoint compliance, Intune."
      why="A compliant device gates Conditional Access — when this fails, real work stops."
      storageKey="ss.intune-compliance"
      futureApi="Wire to Graph /deviceManagement/managedDevices to pull compliance state automatically per asset tag."
      inputs={[
        { id: "asset", label: "Asset tag", placeholder: "CON-LT-0042" },
        { id: "user", label: "Primary user", placeholder: "jane.smith@contoso.com" },
        { id: "platform", label: "Platform", placeholder: "Windows 11 23H2" },
      ]}
      sections={[
        {
          title: "Enrolment",
          items: [
            { id: "en-1", label: "Device shown in Intune as managed" },
            { id: "en-2", label: "Hybrid join or Entra join confirmed" },
            { id: "en-3", label: "Last check-in <24 hours" },
            { id: "en-4", label: "Primary user set correctly" },
          ],
        },
        {
          title: "Policies applied",
          items: [
            { id: "po-1", label: "Compliance policy targeted and result = Compliant" },
            { id: "po-2", label: "Configuration profiles applied (Defender, BitLocker, Firewall)" },
            { id: "po-3", label: "App protection / Endpoint privilege policies applied as needed" },
          ],
        },
        {
          title: "Security state",
          items: [
            { id: "se-1", label: "BitLocker enabled with key escrowed to Entra ID" },
            { id: "se-2", label: "Defender real-time + cloud protection on, signatures fresh" },
            { id: "se-3", label: "Firewall on across Domain, Private and Public profiles" },
            { id: "se-4", label: "Secure Boot enabled and TPM 2.0 healthy" },
            { id: "se-5", label: "No critical CVEs from Defender for Endpoint vulnerability dashboard" },
          ],
        },
        {
          title: "Operating system",
          items: [
            { id: "os-1", label: "Latest cumulative update installed" },
            { id: "os-2", label: "OEM drivers / firmware up to date" },
            { id: "os-3", label: "Operating system supported (not EOL)" },
          ],
        },
        {
          title: "User & access",
          items: [
            { id: "us-1", label: "Conditional Access compliance test passes" },
            { id: "us-2", label: "User can sign in to Company Portal" },
            { id: "us-3", label: "Asset register / CMDB updated" },
          ],
        },
      ]}
    />
  );
}

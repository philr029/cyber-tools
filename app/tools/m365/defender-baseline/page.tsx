"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function DefenderBaselinePage() {
  return (
    <ChecklistTool
      title="Defender Security Baseline Checklist"
      description="Hardening checklist for Microsoft Defender across identity, endpoints, email, cloud apps and Office — based on the Microsoft Secure Score baseline."
      skill="Microsoft Defender XDR, secure score, baseline policy"
      why="A new tenant starts with sensible defaults but is not hardened. This checklist closes the most common gaps that show up in Secure Score and CIS audits."
      futureApi="Defender APIs: /security/secureScores, /security/alerts, /security/incidents, plus EOP/MDO PowerShell for policy management."
      sections={[
        {
          title: "Identity (Defender for Identity / Entra)",
          items: [
            { id: "df-i1", label: "Enable Microsoft Defender for Identity sensors on Domain Controllers" },
            { id: "df-i2", label: "Enable Entra Identity Protection user-risk and sign-in-risk policies" },
            { id: "df-i3", label: "Enforce phishing-resistant MFA for privileged roles" },
            { id: "df-i4", label: "Enable Privileged Identity Management (PIM) for admin roles" },
            { id: "df-i5", label: "Review and remove stale admin role assignments quarterly" },
          ],
        },
        {
          title: "Endpoints (Defender for Endpoint)",
          items: [
            { id: "df-e1", label: "Onboard all Windows / macOS / Linux endpoints to MDE" },
            { id: "df-e2", label: "Enable EDR in block mode and tamper protection" },
            { id: "df-e3", label: "Configure Attack Surface Reduction (ASR) rules in audit, then block" },
            { id: "df-e4", label: "Enable controlled folder access and network protection" },
            { id: "df-e5", label: "Apply Defender security baseline through Intune" },
          ],
        },
        {
          title: "Email & collaboration (Defender for Office 365)",
          items: [
            { id: "df-o1", label: "Apply Standard or Strict Preset Security Policies" },
            { id: "df-o2", label: "Enable Safe Links, Safe Attachments and Anti-phishing impersonation protection" },
            { id: "df-o3", label: "Verify SPF / DKIM / DMARC for all sending domains (DMARC at least p=quarantine)" },
            { id: "df-o4", label: "Enable Submissions feature for users to report phishing" },
            { id: "df-o5", label: "Configure attack simulation training schedule" },
          ],
        },
        {
          title: "Cloud apps (Defender for Cloud Apps)",
          items: [
            { id: "df-c1", label: "Enable Cloud Discovery via MDE log integration" },
            { id: "df-c2", label: "Sanction / unsanction key SaaS apps and document the rationale" },
            { id: "df-c3", label: "Configure session policies for high-risk SaaS apps" },
            { id: "df-c4", label: "Tune anomaly detection alerts and assign owners" },
          ],
        },
        {
          title: "Monitoring & response",
          items: [
            { id: "df-m1", label: "Forward Defender alerts to a SIEM / Sentinel workspace" },
            { id: "df-m2", label: "Define incident severity, owners and SLAs" },
            { id: "df-m3", label: "Run a tabletop exercise simulating a phishing-led account compromise" },
            { id: "df-m4", label: "Track Secure Score monthly and document remediations" },
          ],
        },
      ]}
    />
  );
}

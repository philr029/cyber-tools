import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Microsoft 365 Tools — SecureScope Toolkit",
  description: "Microsoft 365 lifecycle, MFA, Conditional Access, Teams Phone, Intune, and Defender checklists.",
};

export default function M365ToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Microsoft 365"
      title="Microsoft 365 Tools"
      intro="Practical checklists and generators for the workflows that fill an IT engineer's day — onboarding, offboarding, licensing, MFA, Conditional Access, Teams Phone, Intune and Defender."
      tools={[
        {
          href: "/tools/m365/licence-checker",
          title: "User Licence Checker",
          description: "Look up demo licence assignments, missing add-ons, and a suggested action for any UPN.",
          badge: "Generator",
          why: "Stops you provisioning the wrong SKU or paying for unused ones.",
          skill: "Microsoft Graph licensing model.",
        },
        {
          href: "/tools/m365/new-starter",
          title: "New Starter Checklist",
          description: "Provision a Microsoft 365 user end-to-end — identity, licensing, security baseline, and welcome pack.",
          badge: "Checklist",
          why: "Consistent onboarding prevents licence waste and access gaps.",
          skill: "M365 identity & lifecycle.",
        },
        {
          href: "/tools/m365/leaver",
          title: "Leaver Checklist",
          description: "Safely offboard a user — session revocation, data retention, mailbox handover, licence reclaim.",
          badge: "Checklist",
          why: "Offboarding is where most data leakage starts.",
          skill: "Identity lifecycle, data retention.",
        },
        {
          href: "/tools/m365/mfa-readiness",
          title: "MFA Readiness",
          description: "Roll out phishing-resistant MFA without a wave of helpdesk tickets.",
          badge: "Checklist",
          why: "Biggest single control against account compromise.",
          skill: "Conditional Access, change management.",
        },
        {
          href: "/tools/m365/mfa-status",
          title: "MFA Status Checker",
          description: "Generate a demo per-user MFA posture review — registered methods, risky gaps and next actions.",
          badge: "Generator",
          why: "Surfaces who's still on SMS or has no backup factor.",
          skill: "Entra ID authentication methods.",
        },
        {
          href: "/tools/m365/conditional-access",
          title: "Conditional Access Baseline",
          description: "Plan and name a clean CA policy set instead of letting policies sprawl.",
          badge: "Checklist",
          why: "Zero Trust starts with a small, auditable CA baseline.",
          skill: "Entra Conditional Access design.",
        },
        {
          href: "/tools/m365/ca-policy-builder",
          title: "Conditional Access Policy Builder",
          description: "Sketch a CA policy from group, app, location and device inputs. Produces a named, auditable summary.",
          badge: "Generator",
          why: "Avoids CA sprawl — small baseline beats dozens of overlapping policies.",
          skill: "Conditional Access design.",
        },
        {
          href: "/tools/m365/safe-links",
          title: "Defender Safe Links Explainer",
          description: "Decode a Safe Links wrapper to reveal the original URL and explain what Defender actually does.",
          badge: "Decoder",
          why: "End users see scary URLs daily — give them a clear answer.",
          skill: "Email security, user awareness.",
        },
        {
          href: "/tools/m365/forwarding-audit",
          title: "Email Forwarding Rule Audit",
          description: "Step-by-step audit for detecting and remediating suspicious mailbox forwarding.",
          badge: "Checklist",
          why: "External forwarding is one of the highest-signal indicators of mailbox compromise.",
          skill: "Mailbox forensics.",
        },
        {
          href: "/tools/m365/admin-role-review",
          title: "Admin Role Review",
          description: "Quarterly pass over Global, Exchange, SharePoint, Teams, Security and Billing admin roles.",
          badge: "Checklist",
          why: "A small admin footprint is the cheapest hardening control you have.",
          skill: "Privileged access management.",
        },
        {
          href: "/tools/m365/intune-compliance",
          title: "Intune Device Compliance Check",
          description: "Per-device check covering enrolment, policies, BitLocker, Defender, firewall and OS patching.",
          badge: "Checklist",
          why: "When this fails, Conditional Access blocks real work.",
          skill: "Endpoint compliance.",
        },
        {
          href: "/tools/m365/incident-response",
          title: "M365 Incident Response Report",
          description: "Form-driven incident report with type, impact, timeline, actions and recommendations.",
          badge: "Generator",
          why: "Auditors and execs both want the same report — generate it once.",
          skill: "Incident response.",
        },
        {
          href: "/tools/m365/teams-phone",
          title: "Teams Phone Setup",
          description: "End-to-end checklist: numbers, calling policies, emergency calling, auto-attendants, go-live.",
          badge: "Checklist",
          why: "Voice projects are heavy on detail — front-load the awkward parts.",
          skill: "Teams Phone, telecoms migration.",
        },
        {
          href: "/tools/m365/intune-onboarding",
          title: "Intune Device Onboarding",
          description: "Windows Autopilot, compliance, app deployment, and validation steps.",
          badge: "Checklist",
          why: "Skipping a step here means Conditional Access blocks users.",
          skill: "Microsoft Intune / endpoint management.",
        },
        {
          href: "/tools/m365/device-readiness",
          title: "Intune Device Readiness Checker",
          description: "Per-device demo readiness — enrolment, compliance, encryption, Defender, updates.",
          badge: "Generator",
          why: "An unenrolled or unpatched device is the most common Conditional Access blocker.",
          skill: "Intune / Defender for Endpoint operations.",
        },
        {
          href: "/tools/m365/defender-baseline",
          title: "Defender Security Baseline",
          description: "Hardening checklist across Defender for Identity, Endpoint, Office 365 and Cloud Apps.",
          badge: "Checklist",
          why: "Closes the most common Secure Score gaps.",
          skill: "Defender XDR.",
        },
      ]}
    />
  );
}

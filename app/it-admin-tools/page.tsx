import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "IT Admin Automation Tools — SecureScope Toolkit",
  description:
    "Lifecycle, licensing, ticketing, device build and software install checklists for busy IT teams.",
};

export default function ItAdminToolsPage() {
  return (
    <CategoryIndex
      eyebrow="IT Operations"
      title="IT Admin Automation Tools"
      intro="Repeatable playbooks for the routine work — onboarding, offboarding, shared mailbox requests, licence planning, ticket triage, device build, software install — designed so any technician can pick them up."
      tools={[
        {
          href: "/tools/m365/new-starter",
          title: "New Starter Automation Builder",
          description: "Identity, licensing, mailbox, device and welcome checklist for any new starter.",
          badge: "Generator",
          why: "First impressions matter — and so does avoiding licensing waste.",
          skill: "Identity & lifecycle administration.",
        },
        {
          href: "/tools/m365/leaver",
          title: "Leaver Automation Builder",
          description: "Block sign-in, revoke sessions, convert mailbox, transfer OneDrive, recover the device.",
          badge: "Generator",
          why: "Leavers are a top source of data exfiltration and licence cost waste.",
          skill: "Offboarding, data governance.",
        },
        {
          href: "/tools/it-admin/shared-mailbox",
          title: "Shared Mailbox Request Generator",
          description: "Capture the request, generate the admin checklist and PowerShell commands.",
          badge: "Generator",
          why: "Stops 'who approved this?' moments six months later.",
          skill: "Exchange administration.",
        },
        {
          href: "/tools/it-admin/licence-planner",
          title: "Microsoft 365 Licence Planner",
          description: "Plan SKU counts and see monthly / yearly cost — prices editable and saved locally.",
          badge: "Calculator",
          why: "Forecast licensing before renewals catch you.",
          skill: "Licensing, FinOps.",
        },
        {
          href: "/tools/it-admin/access-review",
          title: "User Access Review Tool",
          description: "Structured pass over active users, admins, shared mailboxes, guests, MFA and groups.",
          badge: "Checklist",
          why: "Quarterly access reviews are an audit and security baseline.",
          skill: "Governance, IAM.",
        },
        {
          href: "/tools/it-admin/ticket-triage",
          title: "IT Ticket Triage Tool",
          description: "Suggest category, priority, owner team and first troubleshooting steps from a description.",
          badge: "Generator",
          why: "Service desk consistency without forcing everyone to learn the runbook.",
          skill: "Service management.",
        },
        {
          href: "/tools/it-admin/device-build",
          title: "Device Build Checklist",
          description: "Windows update, BitLocker, Defender, Intune, browser, VPN and local-admin checks.",
          badge: "Checklist",
          why: "A consistent build is your easiest security and reliability win.",
          skill: "Endpoint engineering.",
        },
        {
          href: "/tools/it-admin/software-install",
          title: "Software Install Checklist",
          description: "Pick a department, get the standard apps, save custom items locally.",
          badge: "Checklist",
          why: "Onboarding apps takes minutes when the list already exists.",
          skill: "Endpoint provisioning.",
        },
      ]}
    />
  );
}

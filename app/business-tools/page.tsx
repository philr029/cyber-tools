import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Business & IT Productivity Tools — SecureScope Toolkit",
  description:
    "Email tone, meeting notes, project updates, SOPs, risk register, ticket prioritisation, root cause analysis, change requests, asset handover, vendor comparison.",
};

export default function BusinessToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Business / IT productivity"
      title="Business & IT Productivity Tools"
      intro="Generators and checklists for the non-glamorous work that keeps IT teams effective — clear writing, structured meetings and updates, plus ITIL-style ticket triage, RCA, change governance, asset handover and vendor comparison."
      tools={[
        {
          href: "/tools/business/email",
          title: "Professional Email Generator",
          description: "Pick a tone (friendly, formal, direct, apologetic, follow-up) and turn rough notes into a polished draft.",
          badge: "Generator",
          why: "Stops you spending 20 minutes on a 5-sentence email.",
          skill: "Business writing.",
        },
        {
          href: "/tools/business/meeting-notes",
          title: "Meeting Notes Generator",
          description: "Notes in → structured summary, decisions, actions, owners and deadlines out.",
          badge: "Generator",
          why: "Meeting attendees only remember what was written down.",
          skill: "Facilitation, follow-through.",
        },
        {
          href: "/tools/business/project-update",
          title: "Project Update Generator",
          description: "Compose a weekly RAG-style update with completed, in-progress, blockers and next steps.",
          badge: "Generator",
          why: "Status updates that stakeholders can actually skim.",
          skill: "Project comms.",
        },
        {
          href: "/tools/business/sop",
          title: "SOP Generator",
          description: "Turn a process name and steps into a complete Standard Operating Procedure with purpose, scope, owner and review date.",
          badge: "Generator",
          why: "Operational knowledge that survives the team rotating.",
          skill: "Operations engineering.",
        },
        {
          href: "/tools/business/risk-register",
          title: "Risk Register Builder",
          description: "Capture risks with impact, likelihood, owner, mitigation and status — exports a clean Markdown table.",
          badge: "Builder",
          why: "Auditors love a register. So do CFOs.",
          skill: "Risk management.",
        },
        {
          href: "/tools/business/ticket-priority",
          title: "IT Ticket Priority Calculator",
          description: "Convert impact × urgency × affected-user count into a deterministic priority and response SLA.",
          badge: "Calculator",
          why: "Removes the 'everything is P1' problem.",
          skill: "ITIL incident management.",
        },
        {
          href: "/tools/business/root-cause",
          title: "Root Cause Analysis Generator",
          description: "Drive a problem to its root cause with the 5 Whys, then surface a corrective action and prevention step.",
          badge: "Generator",
          why: "Stops you treating symptoms instead of causes.",
          skill: "Problem management, lean RCA.",
        },
        {
          href: "/tools/business/change-request",
          title: "Change Request Template Generator",
          description: "Produce a professional CAB-ready change request — scope, risk, rollback, approvals, validation.",
          badge: "Generator",
          why: "Avoids weekend-rollback heroics.",
          skill: "Change management, release governance.",
        },
        {
          href: "/tools/business/asset-handover",
          title: "Asset Handover Checklist",
          description: "Laptop, charger, accounts, MFA, policy acceptance and sign-off in one auditable doc.",
          badge: "Checklist",
          why: "Hardware and account loose ends are the most common offboarding blunders.",
          skill: "IT asset lifecycle, evidence trail.",
        },
        {
          href: "/tools/business/vendor-comparison",
          title: "Vendor Comparison Matrix",
          description: "Score vendors on cost, features and risk — produces a clean matrix with a recommendation.",
          badge: "Generator",
          why: "Forces an apples-to-apples view before procurement decisions.",
          skill: "Procurement, vendor risk.",
        },
      ]}
    />
  );
}

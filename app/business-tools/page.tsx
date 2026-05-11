import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Business Productivity Tools — SecureScope Toolkit",
  description: "Email tone, meeting notes, project updates, SOPs and risk register builder.",
};

export default function BusinessToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Business productivity"
      title="Business Productivity Tools"
      intro="The non-glamorous writing that makes IT teams effective — clear emails, structured meeting notes, weekly project updates, well-formed SOPs, and a usable risk register."
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
      ]}
    />
  );
}

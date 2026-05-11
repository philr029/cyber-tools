import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Business / IT Process Tools — SecureScope Toolkit",
  description: "Ticket prioritisation, root cause analysis, change requests, asset handover and vendor comparison.",
};

export default function BusinessToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Business / IT process"
      title="Business & IT Process Tools"
      intro="Everyday business-IT generators — ticket prioritisation, root-cause analysis, change requests, asset handovers and vendor comparison. Built for ITIL-style operations without the overhead."
      tools={[
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

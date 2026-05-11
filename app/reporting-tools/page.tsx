import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Reporting Tools — SecureScope Toolkit",
  description: "Security reports, monthly IT summaries, website QA reports, and automation ROI calculations.",
};

export default function ReportingToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Reporting"
      title="Reporting Tools"
      intro="Generators that turn raw IT and security work into management-friendly artifacts — security reports, monthly summaries, QA reports and automation ROI calculations."
      tools={[
        {
          href: "/tools/reporting/security-report",
          title: "Security Report Generator",
          description: "Turn a list of findings into a professional report with risk levels, affected systems and remediation.",
          badge: "Generator",
          why: "Communicates risk in a way leadership can action.",
          skill: "Risk communication, report writing.",
        },
        {
          href: "/tools/reporting/monthly-it-summary",
          title: "Monthly IT Summary",
          description: "Tickets resolved, issues fixed, improvements made — formatted as a management-friendly monthly IT report.",
          badge: "Generator",
          why: "Stops 'invisible IT'. Shows leadership where time went and what improved.",
          skill: "Operations reporting, executive comms.",
        },
        {
          href: "/tools/reporting/qa-report",
          title: "Website QA Report",
          description: "Convert completed tests, failed items and fixes-required into a polished QA sign-off doc.",
          badge: "Generator",
          why: "Closes the loop between testing and release.",
          skill: "QA reporting, release management.",
        },
        {
          href: "/tools/reporting/automation-roi",
          title: "Automation ROI Calculator",
          description: "Estimate monthly + annual savings and payback period for an automation project.",
          badge: "Calculator",
          why: "Helps build the business case for the next automation.",
          skill: "ROI analysis, business case writing.",
        },
      ]}
    />
  );
}

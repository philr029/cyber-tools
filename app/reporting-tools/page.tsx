import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryCardsWhere } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "Reporting Tools — SecureScope Toolkit",
  description: "Security reports, monthly IT summaries, QA reports, and automation ROI calculators.",
};

export default function ReportingToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Reporting"
      title="Reporting & Executive Summaries"
      intro="Turn operational telemetry into stakeholder-ready narratives — monthly security summaries, IT operations rollups, QA release reports, and automation ROI math."
      tools={categoryCardsWhere((t) => t.href === "/reporting-tools" || t.href.startsWith("/tools/reporting/"))}
    />
  );
}

import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryCardsWhere } from "@/lib/tools/site-catalog";

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
      tools={categoryCardsWhere((t) => t.href === "/business-tools" || t.href.startsWith("/tools/business/"))}
    />
  );
}

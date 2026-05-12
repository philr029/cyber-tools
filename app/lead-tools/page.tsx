import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryCardsWhere } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "Phone & Lead Testing Tools — SecureScope Toolkit",
  description: "Phone validation, lead intelligence and lead-form QA tools.",
};

export default function LeadToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Phone & Lead Testing"
      title="Phone & Lead Testing Tools"
      intro="Validate phone numbers, score inbound leads, and stress-test lead-capture forms before they reach your CRM."
      tools={categoryCardsWhere(
        (t) =>
          t.href === "/lead-tools" ||
          t.href === "/tools/phone-lookup" ||
          t.href === "/tools/lead-intelligence" ||
          t.href === "/tools/automated-monitoring" ||
          t.href === "/tools/automation/lead-form-qa" ||
          t.href === "/tools/form-tester" ||
          t.href === "/tools/email-headers",
      )}
    />
  );
}

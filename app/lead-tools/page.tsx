import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

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
      tools={[
        {
          href: "/tools/phone-lookup",
          title: "Phone Validator",
          description: "Twilio-powered carrier, country and line-type validation for any number.",
          badge: "Twilio",
          why: "Catches bad data at the gate, not after CRM bloat.",
          skill: "Twilio Lookup API integration.",
        },
        {
          href: "/tools/lead-intelligence",
          title: "Lead Intelligence",
          description: "Quick enrichment view for a lead's email, domain and risk signals.",
          badge: "Live",
          why: "Helps sales prioritise without manual research.",
          skill: "Multi-source enrichment.",
        },
        {
          href: "/tools/automation/lead-form-qa",
          title: "Lead Form QA Checklist",
          description: "Functional, anti-spam and accessibility checklist for any marketing form.",
          badge: "Checklist",
          why: "Forms quietly drop pipeline when integrations break.",
          skill: "Web QA, marketing-ops integration.",
        },
        {
          href: "/tools/form-tester",
          title: "Form Tester (server relay)",
          description: "Submit a form through SecureScope's relay and inspect the response.",
          badge: "Live",
          why: "Verify server handling without bypassing security headers.",
          skill: "Secure relay, response auditing.",
        },
        {
          href: "/tools/email-headers",
          title: "Email Header Analyser",
          description: "Paste raw email headers — see hops, SPF/DKIM/DMARC verdicts, and authentication chain.",
          badge: "Live",
          why: "Confirms a lead email actually came from where it claims.",
          skill: "Email forensics.",
        },
      ]}
    />
  );
}

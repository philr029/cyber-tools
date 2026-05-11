"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function LeadFormQAPage() {
  return (
    <ChecklistTool
      title="Lead Form QA Checklist"
      description="A practical pre-launch QA checklist for marketing and lead-capture forms — covering validation, integrations, anti-spam, accessibility, and compliance."
      skill="Web QA, marketing-ops integration, GDPR"
      why="Marketing forms quietly break all the time — recaptcha quotas, broken Zapier hooks, missing UTM tracking. This checklist catches the common ones."
      futureApi="Wire to HubSpot Forms API, Salesforce Pardot API, Zapier webhooks, or Power Automate Forms triggers for live submission tests."
      inputs={[
        { id: "url", label: "Form URL", placeholder: "https://example.com/contact" },
        { id: "owner", label: "Marketing owner", placeholder: "Marketing Ops Lead" },
      ]}
      sections={[
        {
          title: "Functional",
          items: [
            { id: "lf-f1", label: "All required fields rejected when empty (client + server)" },
            { id: "lf-f2", label: "Email validation rejects obviously invalid addresses" },
            { id: "lf-f3", label: "Phone field accepts international format (+44, +1, etc.)" },
            { id: "lf-f4", label: "Submit button disabled while submitting, re-enabled on error" },
            { id: "lf-f5", label: "Success state shows on real submit and route does not re-submit on refresh" },
          ],
        },
        {
          title: "Integrations & data",
          items: [
            { id: "lf-i1", label: "Lead arrives in CRM (HubSpot / Salesforce / Pipedrive) within 60 seconds" },
            { id: "lf-i2", label: "UTM parameters captured and mapped to CRM fields" },
            { id: "lf-i3", label: "Marketing automation triggers correct nurture journey" },
            { id: "lf-i4", label: "Slack / Teams notification fires for new lead" },
            { id: "lf-i5", label: "Email auto-reply sent to the lead from the right sender domain" },
          ],
        },
        {
          title: "Anti-spam",
          items: [
            { id: "lf-s1", label: "reCAPTCHA / hCaptcha / Turnstile is loaded and verifying server-side" },
            { id: "lf-s2", label: "Honeypot hidden field is present and rejected when filled" },
            { id: "lf-s3", label: "Rate limiting on the submit endpoint (e.g. 10/min/IP)" },
            { id: "lf-s4", label: "Disposable-email check or domain reputation gate enabled" },
          ],
        },
        {
          title: "Compliance & privacy",
          items: [
            { id: "lf-c1", label: "Consent checkbox is unticked by default (GDPR-compliant)" },
            { id: "lf-c2", label: "Privacy policy link visible and opens in new tab" },
            { id: "lf-c3", label: "Data Processing record / lawful basis documented" },
            { id: "lf-c4", label: "Cookie banner stops tracking until consent given" },
          ],
        },
        {
          title: "Accessibility & performance",
          items: [
            { id: "lf-a1", label: "All inputs have proper <label> elements" },
            { id: "lf-a2", label: "Tab order is logical and focus state is visible" },
            { id: "lf-a3", label: "Error messages are announced to screen readers" },
            { id: "lf-a4", label: "Form works without JavaScript at a basic level" },
            { id: "lf-a5", label: "Page Largest Contentful Paint < 2.5s on 4G" },
          ],
        },
      ]}
    />
  );
}

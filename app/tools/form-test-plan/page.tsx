"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const FORM_TYPES = [
  { value: "contact", label: "Contact form" },
  { value: "signup", label: "Signup / register" },
  { value: "login", label: "Login" },
  { value: "lead-magnet", label: "Lead magnet / gated download" },
  { value: "checkout", label: "Checkout / payment" },
  { value: "support", label: "Support ticket" },
];

interface TestCase {
  id: string;
  case: string;
  expected: string;
}

const BASE_CASES: TestCase[] = [
  { id: "happy", case: "Submit with all valid fields", expected: "Form submits, success state shown, downstream system receives the submission." },
  { id: "required", case: "Submit with required fields empty", expected: "Validation errors per field; form does not submit." },
  { id: "email", case: "Enter clearly invalid email (`foo@bar`)", expected: "Inline validation error; submit blocked." },
  { id: "xss", case: "Paste `<script>alert(1)</script>` into a text field", expected: "Value is escaped on output; no script executes." },
  { id: "long", case: "Paste 5,000-character string into a text field", expected: "Field enforces sane max length; no crash." },
  { id: "spam", case: "Fill any hidden honeypot field", expected: "Submission silently rejected; not stored." },
  { id: "kb", case: "Tab through the form using only keyboard", expected: "Focus order is logical; all fields reachable and labelled." },
  { id: "sr", case: "Listen with VoiceOver / NVDA", expected: "Field labels announced, error messages associated via `aria-describedby`." },
  { id: "mobile", case: "Submit on a 375px-wide viewport", expected: "Labels, inputs and submit button are all reachable; tap targets ≥ 44px." },
  { id: "double-submit", case: "Click submit twice in quick succession", expected: "Only one submission processed; button disables on click." },
  { id: "back", case: "Submit successfully, hit Back, re-submit", expected: "No duplicate record / no resubmission prompt." },
  { id: "analytics", case: "Verify analytics event fires on success", expected: "Event present in GA4 DebugView / Posthog with the correct properties." },
];

const TYPE_CASES: Record<string, TestCase[]> = {
  contact: [
    { id: "rate", case: "Submit 5 times in 30s from the same IP", expected: "Rate limit / throttle triggers; user shown a friendly message." },
    { id: "notif", case: "Confirm internal recipient inbox receives the message", expected: "Email lands within 1 minute; not in spam." },
  ],
  signup: [
    { id: "weak-pw", case: "Set password `password1`", expected: "Rejected with a clear strength reason." },
    { id: "dup", case: "Sign up with an existing email", expected: "Friendly error; does NOT confirm whether email exists if privacy matters." },
    { id: "verify", case: "Confirm email verification link works and expires sensibly", expected: "Link is single-use, expires within 24h, returns user to a clear state." },
  ],
  login: [
    { id: "bf", case: "Enter wrong password 5 times in a row", expected: "Account lockout / progressive delay applied; no brute-force window." },
    { id: "leak", case: "Confirm 'invalid email or password' is generic", expected: "Error never reveals whether the account exists." },
  ],
  "lead-magnet": [
    { id: "deliver", case: "Confirm the gated asset reaches the user", expected: "Email with download link arrives within 1 minute." },
    { id: "crm", case: "Check submission lands in CRM with UTM data", expected: "Lead is tagged with source, campaign, and consent flag." },
  ],
  checkout: [
    { id: "card-err", case: "Submit declined card", expected: "Clear inline error; no double-charge; analytics tracks `payment_failed`." },
    { id: "tax", case: "Change country and verify VAT/sales tax recalculates", expected: "Total updates instantly; matches tax table." },
  ],
  support: [
    { id: "attach", case: "Upload a 5MB attachment", expected: "Uploads successfully or shows a clear size limit error." },
    { id: "route", case: "Submit with category = 'Billing'", expected: "Ticket routes to the Billing queue with the correct priority." },
  ],
};

export default function FormTestPlanPage() {
  return (
    <GeneratorTool
      title="Form Testing Plan Generator"
      description="Generate a regression-ready test plan for any web form — happy path, validation, security, accessibility and follow-up email checks."
      skill="Web QA, accessibility, secure form handling."
      why="Forms are the #1 silent revenue leak. A repeatable plan catches regressions before users do."
      futureApi="Pair with Playwright / Cypress to convert each row into an automated test."
      outputBadge="Demo result · adapt cases to your form layout"
      inputs={[
        { id: "url", label: "Page URL", placeholder: "https://example.com/contact", required: true, span: "full" },
        { id: "type", label: "Form type", type: "select", options: FORM_TYPES, defaultValue: "contact", required: true },
        { id: "owner", label: "Test owner", placeholder: "Your name" },
      ]}
      generate={(v) => {
        if (!v.url || !v.type) return "";
        const cases = [...BASE_CASES, ...(TYPE_CASES[v.type] ?? [])];
        const label = FORM_TYPES.find((t) => t.value === v.type)?.label ?? "Form";
        const lines: string[] = [];
        lines.push(`# Form Test Plan — ${label}`);
        lines.push("");
        lines.push(`**Page URL:** ${v.url}`);
        if (v.owner) lines.push(`**Test owner:** ${v.owner}`);
        lines.push("");
        lines.push("| # | Test case | Expected result | Pass/Fail | Notes |");
        lines.push("| - | --------- | ---------------- | --------- | ----- |");
        cases.forEach((c, i) => {
          lines.push(`| ${i + 1} | ${c.case} | ${c.expected} | ☐ | |`);
        });
        lines.push("");
        lines.push("## Sign-off");
        lines.push(`- [ ] All cases ${cases.length}/${cases.length} pass`);
        lines.push("- [ ] Issues raised in tracker with screenshots and reproduction steps");
        lines.push("- [ ] Stakeholder sign-off recorded");
        lines.push("");
        lines.push("---");
        lines.push("_Generated checklist — adapt to your specific form fields and downstream integrations._");
        return lines.join("\n");
      }}
    />
  );
}

"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function MfaReadinessPage() {
  return (
    <ChecklistTool
      title="MFA Readiness Checklist"
      description="Assess whether a Microsoft 365 tenant is ready to enforce phishing-resistant multifactor authentication for all users — discovery, communication, rollout, and exception handling."
      skill="Microsoft Entra MFA, Conditional Access, change management"
      why="MFA is the single biggest control against account compromise. Done badly, it generates a deluge of helpdesk tickets — done well it is silent and resilient."
      futureApi="Graph reports: /reports/authenticationMethods, /policies/authenticationMethodPolicies, conditionalAccessPolicies for live readiness scoring."
      sections={[
        {
          title: "Discovery",
          items: [
            { id: "mfa-d1", label: "Run an Entra ID sign-in log review to identify legacy auth usage (last 30 days)" },
            { id: "mfa-d2", label: "Identify shared / break-glass accounts and confirm they are excluded correctly" },
            { id: "mfa-d3", label: "Review service accounts and document which need workload identity / managed identities instead of MFA" },
            { id: "mfa-d4", label: "Audit current per-user MFA state — migrate everyone to Conditional Access enforcement" },
          ],
        },
        {
          title: "Method strategy",
          items: [
            { id: "mfa-m1", label: "Choose primary method: Microsoft Authenticator number-matching / FIDO2 / passkey" },
            { id: "mfa-m2", label: "Deprecate SMS and voice calls as primary methods (phishable)" },
            { id: "mfa-m3", label: "Enable number matching and additional context in Authenticator" },
            { id: "mfa-m4", label: "Define fallback method per user persona (frontline, executive, contractor)" },
          ],
        },
        {
          title: "Communications & rollout",
          items: [
            { id: "mfa-c1", label: "Send T-30 / T-14 / T-3 day comms with screenshots and FAQ" },
            { id: "mfa-c2", label: "Publish a self-service registration page link" },
            { id: "mfa-c3", label: "Run an opt-in pilot wave first (IT, security, friendly users)" },
            { id: "mfa-c4", label: "Schedule registration campaign for users without methods registered" },
          ],
        },
        {
          title: "Enforcement",
          items: [
            { id: "mfa-e1", label: "Create CA policy: All users, all cloud apps, require MFA (exclude break-glass)" },
            { id: "mfa-e2", label: "Block legacy authentication via CA (Exchange ActiveSync legacy, IMAP, POP)" },
            { id: "mfa-e3", label: "Use sign-in risk and user-risk policies (Identity Protection) where licensed" },
            { id: "mfa-e4", label: "Document break-glass MFA bypass process with monitoring alert" },
            { id: "mfa-e5", label: "Run a 'what if' simulation in Conditional Access before enabling" },
          ],
        },
      ]}
    />
  );
}

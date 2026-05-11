"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const PROFILES: Record<string, {
  enabled: boolean;
  methods: string[];
  gaps: string[];
  actions: string[];
}> = {
  "ceo@contoso.com": {
    enabled: true,
    methods: ["Microsoft Authenticator (push)", "Phone (voice)"],
    gaps: ["No passkey / FIDO2 method registered"],
    actions: ["Register a FIDO2 hardware key as the primary phishing-resistant method."],
  },
  "intern@contoso.com": {
    enabled: false,
    methods: [],
    gaps: ["MFA not enforced", "Self-service password reset not configured"],
    actions: ["Add user to the Conditional Access 'Require MFA' policy.", "Trigger SSPR enrolment campaign."],
  },
};

function fakeForEmail(email: string) {
  const key = email.toLowerCase().trim();
  if (PROFILES[key]) return PROFILES[key];
  const variant = key.length % 3;
  if (variant === 0) {
    return {
      enabled: true,
      methods: ["Microsoft Authenticator (push + number match)", "SMS"],
      gaps: ["SMS is still registered — phishable", "No backup method registered"],
      actions: [
        "Remove SMS from registered methods.",
        "Encourage user to add a passkey or Authenticator on a second device.",
      ],
    };
  }
  if (variant === 1) {
    return {
      enabled: true,
      methods: ["Microsoft Authenticator (passwordless)", "FIDO2 security key"],
      gaps: [],
      actions: ["No remediation required — strong phishing-resistant methods in place."],
    };
  }
  return {
    enabled: false,
    methods: [],
    gaps: ["MFA disabled", "Legacy per-user MFA state appears unconfigured"],
    actions: [
      "Move from per-user MFA to Conditional Access enforcement.",
      "Run authentication methods migration wizard.",
    ],
  };
}

export default function M365MfaStatusPage() {
  return (
    <GeneratorTool
      title="Microsoft 365 MFA Status Checklist"
      description="Generate a demo MFA posture review for a user — enabled state, registered methods, risky gaps and recommended next actions."
      skill="Entra ID authentication methods, Conditional Access, FIDO2 rollout."
      why="MFA is the single biggest control. This surfaces who's still on SMS or has no backup method."
      futureApi="Wire to Microsoft Graph reports: /reports/authenticationMethods/userRegistrationDetails and /reports/credentialUserRegistrationDetails."
      outputBadge="Demo result · no live tenant connected"
      inputs={[
        {
          id: "email",
          label: "User email (UPN)",
          placeholder: "user@contoso.com",
          type: "email",
          required: true,
          span: "full",
        },
      ]}
      generate={(v) => {
        if (!v.email) return "";
        const data = fakeForEmail(v.email);
        const lines: string[] = [];
        lines.push(`# MFA Status Review (Demo)`);
        lines.push("");
        lines.push(`**User:** ${v.email}`);
        lines.push(`**MFA enabled:** ${data.enabled ? "Yes" : "No"}`);
        lines.push("");
        lines.push("## Registered methods");
        if (data.methods.length === 0) {
          lines.push("- _None registered_");
        } else {
          for (const m of data.methods) lines.push(`- ${m}`);
        }
        lines.push("");
        lines.push("## Risky gaps");
        if (data.gaps.length === 0) lines.push("- None — strong posture.");
        for (const g of data.gaps) lines.push(`- ${g}`);
        lines.push("");
        lines.push("## Suggested actions");
        for (const a of data.actions) lines.push(`- ${a}`);
        lines.push("");
        lines.push("---");
        lines.push("_Demo data — wire to Microsoft Graph to replace with live reporting._");
        return lines.join("\n");
      }}
    />
  );
}

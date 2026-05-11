"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const INCIDENT_TYPES = [
  { value: "phishing", label: "Phishing campaign" },
  { value: "bec", label: "Business Email Compromise (BEC)" },
  { value: "account-takeover", label: "Account takeover" },
  { value: "ransomware", label: "Ransomware / mass encryption" },
  { value: "data-leak", label: "Data leak / exfiltration" },
  { value: "ddos", label: "DDoS / availability attack" },
  { value: "malware", label: "Malware on endpoint" },
  { value: "insider", label: "Insider misuse" },
  { value: "supply-chain", label: "Third-party / supply-chain incident" },
];

interface Playbook {
  contain: string[];
  investigate: string[];
  eradicate: string[];
  recover: string[];
  lessons: string[];
}

const BASE: Playbook = {
  contain: [
    "Stand up an incident channel and assign an IC, scribe, comms lead.",
    "Preserve evidence — snapshot affected systems before changing state.",
    "Notify legal / data protection / leadership per playbook.",
  ],
  investigate: [
    "Build a timeline from logs (Defender, M365 audit, SIEM, EDR).",
    "Identify scope: affected users, systems, data, accounts.",
    "Determine initial access vector and any lateral movement.",
  ],
  eradicate: [
    "Reset credentials and tokens for affected identities.",
    "Block IOC artifacts (domains, IPs, hashes, sender addresses).",
    "Remove persistence — scheduled tasks, services, mailbox rules, OAuth grants.",
  ],
  recover: [
    "Restore systems from a clean baseline / image.",
    "Re-onboard cleaned endpoints with monitoring.",
    "Communicate resolution to affected users and stakeholders.",
  ],
  lessons: [
    "Run a blameless post-incident review within 5 business days.",
    "Update detection rules and SOC runbooks based on findings.",
    "Track agreed corrective actions through to closure.",
  ],
};

const ADDITIONS: Record<string, Partial<Playbook>> = {
  phishing: {
    contain: [
      "Apply Defender Threat Explorer purge to remove campaign from all mailboxes.",
      "Block sender domain and any shortener used in the message.",
    ],
    investigate: [
      "Pull URL click telemetry — who clicked, who entered credentials.",
      "Check Defender for Office 365 Submissions for related items.",
    ],
  },
  bec: {
    contain: [
      "Revoke active sessions and disable mailbox forwarding/auto-rules on affected accounts.",
      "Place finance/AP on heightened verification for payment changes.",
    ],
    investigate: [
      "Review inbox rules, OAuth app grants, and delegate access for the compromised user.",
      "Search M365 audit for `New-InboxRule`, `Set-InboxRule`, and OAuth consent events.",
    ],
    eradicate: [
      "Remove malicious inbox rules and revoke risky OAuth grants.",
      "Reset password + revoke refresh tokens for the user.",
    ],
  },
  "account-takeover": {
    contain: [
      "Reset password and require re-registration of MFA methods.",
      "Revoke all active refresh tokens (`Revoke-AzureADUserAllRefreshToken`).",
    ],
    investigate: [
      "Pull Entra sign-in logs filtered to the user; correlate IPs, locations, devices.",
      "Check for new device registrations and conditional-access policy bypass.",
    ],
  },
  ransomware: {
    contain: [
      "Isolate impacted hosts at the network layer (Defender Live Response, EDR isolation).",
      "Disable unused interactive admin accounts; rotate Tier-0 secrets.",
    ],
    eradicate: [
      "Remove ransomware binary and any C2 persistence; confirm with IR partner.",
      "Validate backups are intact and untouched before restore.",
    ],
    recover: [
      "Restore from validated offline / immutable backups.",
      "Stagger user re-onboarding to avoid reinfection.",
    ],
  },
  "data-leak": {
    contain: [
      "Disable share links / OneDrive sharing on affected files.",
      "Notify DPO and assess statutory notification thresholds.",
    ],
    investigate: [
      "Map exfil channels: email, cloud storage, USB, SaaS upload.",
      "Pull Purview DLP reports and unified audit for `FileDownloaded` / `FileSyncDownloadedFull`.",
    ],
  },
  ddos: {
    contain: [
      "Engage upstream / CDN provider WAF and rate-limit modes.",
      "Switch traffic to dedicated DDoS-protected entry point.",
    ],
    investigate: [
      "Capture attack signature (vectors, packet rates, geographic origin).",
      "Identify whether attack is volumetric, protocol, or app-layer.",
    ],
  },
  malware: {
    contain: [
      "Isolate the endpoint via EDR; collect memory dump if practical.",
    ],
    investigate: [
      "Hunt for the same hash / process across the fleet.",
      "Correlate Defender alerts with proxy and DNS logs.",
    ],
  },
  insider: {
    contain: [
      "Suspend access while preserving forensic evidence (do NOT wipe).",
      "Engage HR / legal before any user-facing actions.",
    ],
  },
  "supply-chain": {
    contain: [
      "Disable the third-party integration / API key in question.",
      "Notify other affected customers if you are the upstream service.",
    ],
    investigate: [
      "Map blast radius across all systems using the affected vendor.",
      "Subscribe to vendor's status / disclosure feed for ongoing updates.",
    ],
  },
};

function buildPlaybook(type: string): Playbook {
  const extra = ADDITIONS[type] ?? {};
  return {
    contain: [...BASE.contain, ...(extra.contain ?? [])],
    investigate: [...BASE.investigate, ...(extra.investigate ?? [])],
    eradicate: [...BASE.eradicate, ...(extra.eradicate ?? [])],
    recover: [...BASE.recover, ...(extra.recover ?? [])],
    lessons: [...BASE.lessons, ...(extra.lessons ?? [])],
  };
}

function labelFor(type: string) {
  return INCIDENT_TYPES.find((t) => t.value === type)?.label ?? "Generic incident";
}

export default function IncidentResponsePage() {
  return (
    <GeneratorTool
      title="Incident Response Checklist Generator"
      description="Generate a contain → investigate → eradicate → recover → lessons learned checklist for a specific incident type. Use as a starting point for your runbook."
      skill="Incident response (NIST 800-61), Microsoft 365 / Entra forensics."
      why="A repeatable structure stops you forgetting basics like preserving evidence and tracking corrective actions."
      futureApi="Wire to ticketing (ServiceNow, Jira, Linear) to auto-create incident tickets with these steps pre-populated."
      outputBadge="Demo playbook · tailor to your runbook before use"
      inputs={[
        {
          id: "type",
          label: "Incident type",
          type: "select",
          options: INCIDENT_TYPES,
          required: true,
          defaultValue: "phishing",
          span: "full",
        },
        { id: "id", label: "Incident ID (optional)", placeholder: "INC-2026-0042" },
        { id: "severity", label: "Severity", type: "select", options: [
          { value: "Sev 1", label: "Sev 1 — critical" },
          { value: "Sev 2", label: "Sev 2 — high" },
          { value: "Sev 3", label: "Sev 3 — medium" },
          { value: "Sev 4", label: "Sev 4 — low" },
        ], defaultValue: "Sev 2" },
      ]}
      generate={(v) => {
        if (!v.type) return "";
        const pb = buildPlaybook(v.type);
        const lines: string[] = [];
        lines.push(`# Incident Response Checklist — ${labelFor(v.type)}`);
        lines.push("");
        if (v.id) lines.push(`**Incident ID:** ${v.id}`);
        if (v.severity) lines.push(`**Severity:** ${v.severity}`);
        lines.push(`**Type:** ${labelFor(v.type)}`);
        lines.push("");
        for (const [phase, items] of [
          ["Contain", pb.contain],
          ["Investigate", pb.investigate],
          ["Eradicate", pb.eradicate],
          ["Recover", pb.recover],
          ["Lessons learned", pb.lessons],
        ] as const) {
          lines.push(`## ${phase}`);
          for (const item of items) lines.push(`- [ ] ${item}`);
          lines.push("");
        }
        lines.push("---");
        lines.push("_Generated by SecureScope. Tailor to your environment and approval workflow before use._");
        return lines.join("\n");
      }}
    />
  );
}

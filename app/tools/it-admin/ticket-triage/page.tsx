"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

interface Rule {
  category: string;
  team: string;
  priority: "P1" | "P2" | "P3" | "P4";
  keywords: RegExp;
  steps: string[];
  escalation: string;
}

const RULES: Rule[] = [
  {
    category: "Identity / Sign-in",
    team: "Service Desk → Identity team",
    priority: "P2",
    keywords: /\b(password|locked\s*out|mfa|2fa|sign\s*-?\s*in|conditional\s+access|sso)\b/i,
    steps: [
      "Confirm the affected UPN and tenant.",
      "Check Entra ID Sign-in logs for failure code (50053/53003/700016 etc).",
      "Verify MFA method registered and reachable (Authenticator, phone).",
      "If admin: validate Conditional Access policy hit and report from What If.",
      "Reset password / re-register MFA only after verifying identity.",
    ],
    escalation: "Escalate to Identity tier 2 if Conditional Access misconfiguration is suspected.",
  },
  {
    category: "Email / Exchange",
    team: "Service Desk → Messaging team",
    priority: "P2",
    keywords: /\b(email|mailbox|outlook|exchange|forward(ing)?|distribution\s+list|shared\s+mailbox|spam|phish)\b/i,
    steps: [
      "Identify whether issue is inbound, outbound, or send-as.",
      "Run Message Trace in Exchange Admin / Defender Explorer.",
      "Check user's transport / inbox rules for unexpected forwarding.",
      "Verify mailbox quota and mobile device partnerships.",
      "If suspected phishing: preserve message ID and submit via Defender.",
    ],
    escalation: "Escalate to Messaging tier 2 if mail flow is broken at tenant level.",
  },
  {
    category: "Endpoint / Device",
    team: "Service Desk → Endpoint team",
    priority: "P3",
    keywords: /\b(laptop|pc|computer|bitlocker|defender|antivirus|intune|autopilot|battery|driver|update)\b/i,
    steps: [
      "Confirm hostname, primary user and Intune compliance state.",
      "Force device sync from Intune Company Portal.",
      "Check Windows Update history and Defender threat status.",
      "Collect MDMDiagnosticsTool log if compliance fails.",
    ],
    escalation: "Escalate to Endpoint engineering for re-imaging or driver escalations.",
  },
  {
    category: "Network / VPN",
    team: "Service Desk → Network team",
    priority: "P2",
    keywords: /\b(vpn|wifi|wi-?fi|network|dns|proxy|firewall|slow\s+internet|cannot\s+reach)\b/i,
    steps: [
      "Confirm the resource that's unreachable and from which network.",
      "Test wired vs Wi-Fi vs LTE to isolate the path.",
      "Run ipconfig /all and a tracert to the affected host.",
      "Check VPN client logs and ensure split-tunnel is correct.",
    ],
    escalation: "Engage Network on-call if multiple users on the same site are affected.",
  },
  {
    category: "Microsoft 365 apps",
    team: "Service Desk → Apps team",
    priority: "P3",
    keywords: /\b(teams|sharepoint|onedrive|word|excel|powerpoint|office|m365)\b/i,
    steps: [
      "Confirm exact Office channel and version (File → Account).",
      "Run Office Repair (Quick then Online).",
      "Check Microsoft 365 service health dashboard for active advisories.",
      "Clear Teams cache (%appdata%/Microsoft/Teams) if Teams specific.",
    ],
    escalation: "Open a Microsoft 365 service request if tenant-wide.",
  },
  {
    category: "Security / Suspicious activity",
    team: "Service Desk → SOC",
    priority: "P1",
    keywords: /\b(phish|malware|ransom|breach|compromis|incident|suspicious|virus|trojan)\b/i,
    steps: [
      "Do not delete evidence — preserve email, files and device state.",
      "Disable sign-in for affected user(s) immediately.",
      "Revoke active sessions in Entra ID.",
      "Capture device for forensics if endpoint compromise is suspected.",
      "Open a security incident ticket and notify the SOC on-call.",
    ],
    escalation: "Escalate immediately to SOC tier 2 / IR lead.",
  },
];

const DEFAULT_RULE: Rule = {
  category: "General IT",
  team: "Service Desk",
  priority: "P3",
  keywords: /.*/,
  steps: [
    "Ask the user for screenshots and the time the issue first started.",
    "Identify any recent change (deployment, patch, account move).",
    "Reproduce on a clean profile or another device if possible.",
    "Document findings in the ticket before transferring ownership.",
  ],
  escalation: "Escalate based on impact and number of users affected.",
};

function classify(text: string): Rule {
  for (const r of RULES) if (r.keywords.test(text)) return r;
  return DEFAULT_RULE;
}

export default function TicketTriagePage() {
  const [description, setDescription] = useState(
    "Jane in Sales says her Outlook on the laptop won't connect since the Windows update last night. Webmail works fine.",
  );

  const rule = useMemo(() => classify(description), [description]);

  const triageMd = useMemo(
    () =>
      [
        `## Ticket triage`,
        ``,
        `**Category:** ${rule.category}`,
        `**Suggested team:** ${rule.team}`,
        `**Priority:** ${rule.priority}`,
        ``,
        `### First troubleshooting steps`,
        ...rule.steps.map((s, i) => `${i + 1}. ${s}`),
        ``,
        `### Escalation`,
        rule.escalation,
        ``,
        `> Heuristic triage — review before assigning. SecureScope IT Toolkit.`,
      ].join("\n"),
    [rule],
  );

  return (
    <ToolPageLayout
      title="IT Ticket Triage Tool"
      description="Paste a user's description and get a suggested category, priority, owner team and first-step playbook. Heuristics only — always reviewed by a human."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="Service management, triage." accent="cyan" />
        <Meta label="Why" body="Consistent first-line response across every ticket." accent="violet" />
        <Meta label="Future API" body="Replace heuristics with an LLM through a serverless function and write the suggestion back to your ITSM via API." accent="emerald" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Ticket description</span>
            <textarea
              rows={12}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="rounded-[24px] border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Suggested routing
            </p>
            <ul className="mt-2 space-y-1 text-white/85">
              <li>
                <strong>Category:</strong> {rule.category}
              </li>
              <li>
                <strong>Team:</strong> {rule.team}
              </li>
              <li>
                <strong>Priority:</strong> {rule.priority}
              </li>
            </ul>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Triage note (Markdown)
              </p>
              <CopyButton text={triageMd} label="Copy note" />
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre-wrap">
{triageMd}
            </pre>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}

function Meta({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}

"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const KEYWORD_HINTS: Record<string, string[]> = {
  mfa: [
    "Conditional Access policy excluded the user group.",
    "Authenticator app not re-registered after device reset.",
    "Legacy per-user MFA state overriding CA.",
    "Number-match prompt not delivered due to push notifications disabled on device.",
  ],
  vpn: [
    "Split-tunnel route mis-configured.",
    "Certificate expired on gateway.",
    "Conditional Access requires compliant device but Intune sync stale.",
    "DNS resolution failing for internal hostnames.",
  ],
  email: [
    "SPF record exceeded 10-lookup limit.",
    "DKIM key not rotated after platform change.",
    "DMARC policy = reject without enough aligned senders.",
    "Mail flow rule re-routing to quarantine.",
  ],
  sharepoint: [
    "Permissions inherited from a private channel sub-site.",
    "External sharing tenant-wide setting blocked the action.",
    "Sensitivity label restricted external access.",
    "Item moved to second-stage Recycle Bin already purged.",
  ],
  intune: [
    "Compliance policy targeting wrong device platform.",
    "Autopilot ESP timed out before app install finished.",
    "Conditional Access requires Intune-managed but device joined to wrong tenant.",
    "Win32 app dependency chain misconfigured.",
  ],
};

function hintsFor(text: string) {
  const lower = text.toLowerCase();
  for (const key of Object.keys(KEYWORD_HINTS)) {
    if (lower.includes(key)) return KEYWORD_HINTS[key];
  }
  return [
    "A required dependency changed without a coordinated update.",
    "A configuration drift was not caught by automated checks.",
    "A run-book step was skipped or out of date.",
    "An alert was acknowledged but no follow-up action was taken.",
  ];
}

export default function RootCausePage() {
  return (
    <GeneratorTool
      title="Root Cause Analysis Generator"
      description="Drive a problem to its root cause with the 5 Whys. Surfaces a starter cause, corrective action and prevention step."
      skill="Problem management, lean RCA, blameless post-incident reviews."
      why="Beats writing 'human error' five days running."
      futureApi="Hook into PagerDuty / FireHydrant post-incident workflows to seed the RCA doc."
      outputBadge="Demo output · refine with stakeholders"
      inputs={[
        { id: "summary", label: "Problem summary (one sentence)", placeholder: "Finance users could not log in to SharePoint for 30 minutes.", required: true, span: "full" },
        { id: "first", label: "What happened?", type: "textarea", placeholder: "Describe the symptom users actually experienced." },
        { id: "scope", label: "Scope", placeholder: "Who/what was affected and for how long?" },
      ]}
      generate={(v) => {
        if (!v.summary) return "";
        const hints = hintsFor(v.summary + " " + (v.first || ""));
        const lines: string[] = [];
        lines.push(`# Root Cause Analysis`);
        lines.push("");
        lines.push(`**Problem:** ${v.summary}`);
        if (v.scope) lines.push(`**Scope:** ${v.scope}`);
        lines.push("");
        if (v.first) {
          lines.push("## Description");
          lines.push(v.first);
          lines.push("");
        }
        lines.push("## 5 Whys");
        lines.push(`1. **Why did this happen?** ${hints[0]}`);
        lines.push(`2. **Why?** ${hints[1] ?? "Investigate the upstream cause of finding 1."}`);
        lines.push(`3. **Why?** ${hints[2] ?? "Investigate the upstream cause of finding 2."}`);
        lines.push(`4. **Why?** ${hints[3] ?? "Investigate the upstream cause of finding 3."}`);
        lines.push(`5. **Why?** A process / control gap allowed the upstream condition to persist undetected.`);
        lines.push("");
        lines.push("## Probable root cause");
        lines.push(`- ${hints[0]}`);
        lines.push(`- Process gap: the condition above was not detected by any existing check.`);
        lines.push("");
        lines.push("## Corrective action (immediate)");
        lines.push("- Apply the specific fix derived from the root cause above.");
        lines.push("- Validate with a representative user before declaring resolved.");
        lines.push("");
        lines.push("## Preventive action (prevent recurrence)");
        lines.push("- Add monitoring / alerting on the failure condition that was just identified.");
        lines.push("- Update runbook with the symptom → diagnostic → fix mapping.");
        lines.push("- Schedule a follow-up audit in 30 days to confirm no regression.");
        lines.push("");
        lines.push("## Owners");
        lines.push("- [ ] Corrective action owner: ");
        lines.push("- [ ] Preventive action owner: ");
        lines.push("- [ ] Review date: ");
        lines.push("");
        lines.push("---");
        lines.push("_Demo template — adapt the 5 Whys to your actual evidence._");
        return lines.join("\n");
      }}
    />
  );
}

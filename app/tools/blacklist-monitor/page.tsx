"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const FREQUENCIES = [
  { value: "15m", label: "Every 15 minutes" },
  { value: "1h", label: "Hourly" },
  { value: "4h", label: "Every 4 hours" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const CRON: Record<string, string> = {
  "15m": "*/15 * * * *",
  "1h": "0 * * * *",
  "4h": "0 */4 * * *",
  daily: "0 6 * * *",
  weekly: "0 6 * * 1",
};

export default function BlacklistMonitorPage() {
  return (
    <GeneratorTool
      title="Blacklist Monitoring Planner"
      description="Plan a daily / hourly blacklist monitoring routine for a domain or IP — schedule, alert channels, and escalation plan."
      skill="DNSBL data, monitoring & alerting design."
      why="By the time customers tell you their mail is bouncing, the blacklist hit is hours old. Monitor proactively."
      futureApi="Wire to HetrixTools, MxToolbox API, or Spamhaus Project to pull live blacklist status."
      outputBadge="Demo plan · adapt to your monitoring stack"
      inputs={[
        { id: "target", label: "Domain or IP to monitor", placeholder: "example.com or 203.0.113.10", required: true, span: "full" },
        { id: "frequency", label: "Check frequency", type: "select", options: FREQUENCIES, defaultValue: "daily" },
        { id: "channel", label: "Alert channel", type: "select", options: [
          { value: "email", label: "Email" },
          { value: "slack", label: "Slack / Teams webhook" },
          { value: "pager", label: "PagerDuty / Opsgenie" },
        ], defaultValue: "email" },
        { id: "owner", label: "Escalation owner", placeholder: "Name / on-call rota" },
      ]}
      generate={(v) => {
        if (!v.target) return "";
        const freq = v.frequency || "daily";
        const cron = CRON[freq] ?? CRON.daily;
        const channelLabel = { email: "email", slack: "Slack / Teams webhook", pager: "PagerDuty / Opsgenie" }[v.channel] ?? "email";
        const lines: string[] = [];
        lines.push(`# Blacklist Monitoring Plan — ${v.target}`);
        lines.push("");
        lines.push(`**Target:** ${v.target}`);
        lines.push(`**Frequency:** ${FREQUENCIES.find((f) => f.value === freq)?.label ?? freq}`);
        lines.push(`**Cron:** \`${cron}\` (UTC)`);
        lines.push(`**Alert channel:** ${channelLabel}`);
        if (v.owner) lines.push(`**Escalation owner:** ${v.owner}`);
        lines.push("");
        lines.push("## Lists to query");
        lines.push("- Spamhaus ZEN (combined SBL/XBL/PBL).");
        lines.push("- Barracuda BRBL.");
        lines.push("- SORBS DNSBL.");
        lines.push("- SpamCop BL.");
        lines.push("- Talos / Cisco Senderbase reputation.");
        lines.push("- Microsoft SNDS (if a sending IP).");
        lines.push("");
        lines.push("## Implementation outline");
        lines.push(`- Scheduled job runs at \`${cron}\` and queries each DNSBL.`);
        lines.push(`- On any hit, post an alert to ${channelLabel} with: list name, listing time, recommended delisting URL.`);
        lines.push("- Maintain a 7-day history table for trend analysis.");
        lines.push("- Confirm no false positives caused by shared-IP neighbours before delisting.");
        lines.push("");
        lines.push("## Response runbook");
        lines.push("- [ ] Confirm hit on at least one secondary check (HetrixTools, MxToolbox).");
        lines.push("- [ ] Identify suspicious outbound traffic / mail volume spikes.");
        lines.push("- [ ] Submit delisting requests on each affected list.");
        lines.push("- [ ] Rotate API keys / app passwords if account compromise is suspected.");
        lines.push("- [ ] Post-incident: communicate impact to stakeholders and customers.");
        lines.push("");
        lines.push("---");
        lines.push("_Demo plan — connect HetrixTools / MxToolbox API for real-time results._");
        return lines.join("\n");
      }}
    />
  );
}

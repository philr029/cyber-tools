"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function TeamsPhonePage() {
  return (
    <ChecklistTool
      title="Teams Phone Setup Checklist"
      description="A field-tested checklist for rolling out Microsoft Teams Phone — number planning, calling policies, voicemail, emergency calling, and migration from a PBX or third-party provider."
      skill="Teams Phone, voice routing, telecoms migration"
      why="Voice projects fail when emergency calling and number portability are left until the end. This checklist front-loads the awkward parts."
      futureApi="Microsoft Teams PowerShell (CsOnlineUser, CsOnlineVoiceRoutingPolicy), Graph callRecords, Operator Connect APIs for automation."
      inputs={[
        { id: "country", label: "Country / region", placeholder: "United Kingdom" },
        { id: "provider", label: "Calling plan provider", placeholder: "Microsoft Calling Plan / Operator Connect / Direct Routing" },
        { id: "userCount", label: "Approx users to enable", placeholder: "120" },
      ]}
      sections={[
        {
          title: "Licensing & numbers",
          items: [
            { id: "tp-l1", label: "Confirm Teams Phone Standard licences allocated to users" },
            { id: "tp-l2", label: "Decide calling model: Calling Plan, Operator Connect, or Direct Routing" },
            { id: "tp-l3", label: "Acquire or port phone numbers — log a Number Port request well in advance" },
            { id: "tp-l4", label: "Reserve service numbers for auto-attendants and call queues" },
          ],
        },
        {
          title: "Voice policy design",
          items: [
            { id: "tp-v1", label: "Define and assign Calling Policies (international, call park, recording, etc.)" },
            { id: "tp-v2", label: "Define Caller ID policies (anonymise outbound where required)" },
            { id: "tp-v3", label: "Configure Dial Plan with site-specific normalization rules" },
            { id: "tp-v4", label: "Configure Voice Routing Policy if Direct Routing — match SBC details" },
            { id: "tp-v5", label: "Set up voicemail policies (PIN, transcription, retention)" },
          ],
        },
        {
          title: "Emergency calling",
          items: [
            { id: "tp-e1", label: "Define Emergency Calling Policy (notification mode, group)" },
            { id: "tp-e2", label: "Configure Emergency Call Routing Policy (Direct Routing only)" },
            { id: "tp-e3", label: "Define Network Sites and Trusted IPs for dynamic emergency location" },
            { id: "tp-e4", label: "Brief users on placing an emergency call from Teams (and limitations)" },
          ],
        },
        {
          title: "Auto-attendants & queues",
          items: [
            { id: "tp-q1", label: "Build resource accounts for AAs and Call Queues" },
            { id: "tp-q2", label: "Record menu prompts (or use TTS) in primary languages" },
            { id: "tp-q3", label: "Configure routing for after-hours and holidays (define holiday schedule)" },
            { id: "tp-q4", label: "Define overflow / timeout / no-agent fallback (voicemail or external transfer)" },
          ],
        },
        {
          title: "Pilot & go-live",
          items: [
            { id: "tp-p1", label: "Pilot with IT and a friendly business team for at least one week" },
            { id: "tp-p2", label: "Test inbound, outbound, internal, mobile-to-desktop call quality" },
            { id: "tp-p3", label: "Run a Network Planner / Call Quality Dashboard review" },
            { id: "tp-p4", label: "Publish quick-start guide and helpdesk runbook before cutover" },
            { id: "tp-p5", label: "Communicate go-live window and PBX decommission date" },
          ],
        },
      ]}
    />
  );
}

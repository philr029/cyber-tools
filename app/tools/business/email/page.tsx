"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const TONES = [
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "direct", label: "Direct" },
  { value: "apologetic", label: "Apologetic" },
  { value: "follow-up", label: "Follow-up" },
];

function bullets(s: string): string[] {
  return (s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function compose(values: Record<string, string>): string {
  const tone = values.tone || "friendly";
  const to = (values.recipient || "there").split(/\s+/)[0];
  const points = bullets(values.notes);
  const action = values.cta?.trim() || "Let me know if anything needs clarifying.";

  const openings: Record<string, string> = {
    friendly: `Hi ${to},\n\nHope you're well — just dropping you a quick note.`,
    formal: `Dear ${to},\n\nI hope this email finds you well.`,
    direct: `Hi ${to},\n\nStraight to the point:`,
    apologetic: `Hi ${to},\n\nApologies for the delayed response — thanks for your patience.`,
    "follow-up": `Hi ${to},\n\nFollowing up on my previous message regarding ${values.subject || "the items below"}.`,
  };
  const closings: Record<string, string> = {
    friendly: `Thanks so much,\n${values.signoff || "Phil"}`,
    formal: `Kind regards,\n${values.signoff || "Phil"}`,
    direct: `Thanks,\n${values.signoff || "Phil"}`,
    apologetic: `Thanks again for your understanding,\n${values.signoff || "Phil"}`,
    "follow-up": `Thanks,\n${values.signoff || "Phil"}`,
  };

  const bulletBlock = points.length ? `\n\nKey points:\n${points.map((p) => `• ${p}`).join("\n")}` : "";
  const body = values.context?.trim() ? `\n\n${values.context.trim()}` : "";

  return `Subject: ${values.subject || "(add a subject)"}\n\n${openings[tone]}${body}${bulletBlock}\n\n${action}\n\n${closings[tone]}`;
}

export default function EmailGeneratorPage() {
  return (
    <GeneratorTool
      title="Professional Email Generator"
      description="Compose a polished email in seconds. Pick a tone, paste your rough notes and get a clean draft you can copy straight into Outlook or Gmail."
      skill="Business writing."
      why="The first 60 seconds of writing an email shouldn't be the hardest 60 seconds of your day."
      futureApi="Optional: pass the notes + tone to an LLM via a serverless function for richer rewrites. Always keep the API key server-side."
      storageKey="ss.email-generator"
      fields={[
        { id: "tone", label: "Tone", type: "select", options: TONES, defaultValue: "friendly" },
        { id: "recipient", label: "Recipient", placeholder: "Jane Smith" },
        { id: "subject", label: "Subject", placeholder: "Quarterly licence review — feedback needed" },
        { id: "context", label: "Context / opener (optional)", type: "textarea", rows: 3, placeholder: "One short paragraph if useful." },
        { id: "notes", label: "Key points (one per line)", type: "textarea", rows: 5, placeholder: "We're tracking a 14% Teams Phone uplift\nE5 renewal is coming up in March\nNeed your finance sign-off by 21 Feb" },
        { id: "cta", label: "Call to action", placeholder: "Could you confirm the Feb 21 deadline?" },
        { id: "signoff", label: "Sign-off (your name)", placeholder: "Phil", defaultValue: "Phil" },
      ]}
      generate={(v) => [{ label: "Email draft", value: compose(v), language: "text" }]}
    />
  );
}

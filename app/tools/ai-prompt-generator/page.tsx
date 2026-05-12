"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function AiPromptGeneratorPage() {
  return (
    <ToolkitPlaceholder
      title="AI Prompt Generator"
      description="Reusable scaffold for role, constraints, examples, and evaluation — feeds directly into the assistant experience."
      category="AI"
      bullets={[
        "System + user blocks with guardrails and tone.",
        "Few-shot examples with neutral labels.",
        "Self-check rubric for hallucination risks.",
      ]}
      primaryAction={{ href: "/tools/ai-assistant", label: "Open AI assistant" }}
      related={[
        { href: "/tools/ai-report", label: "AI report" },
        { href: "/tools/agent-scan", label: "Agent scan" },
      ]}
    />
  );
}

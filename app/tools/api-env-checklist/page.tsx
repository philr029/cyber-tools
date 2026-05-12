"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function ApiEnvChecklistPage() {
  return (
    <ToolkitPlaceholder
      title="API Key & Environment Variable Checklist"
      description="Rotation, scopes, CI/CD, and least-privilege prompts — stitches together the API key safety and Vercel env guides."
      category="Automation"
      bullets={[
        "Separate dev/stage/prod secrets with promotion rules.",
        "Scoped tokens with expiry and break-glass owners.",
        "CI/CD injection risks and log redaction pass.",
      ]}
      primaryAction={{ href: "/tools/automation/api-key-safety", label: "Open API key safety" }}
      related={[
        { href: "/tools/automation/vercel-env-guide", label: "Vercel env vars guide" },
        { href: "/automation-tools", label: "Automation hub" },
      ]}
    />
  );
}

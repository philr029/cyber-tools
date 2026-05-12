"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function GithubRepoHealthPage() {
  return (
    <ToolkitPlaceholder
      title="GitHub Repo Health Checker"
      description="Governance checklist for default branches, CODEOWNERS, releases, and security policy — ideal before handing repos to clients."
      category="Developer"
      bullets={[
        "Branch protection, required reviews, and status checks.",
        "Dependency and secret scanning posture prompts.",
        "README, CONTRIBUTING, and changelog hygiene.",
      ]}
      related={[
        { href: "/tools/coding/readme-generator", label: "README generator" },
        { href: "/tools/coding/actions-generator", label: "GitHub Actions generator" },
        { href: "/tools/automation/github-actions", label: "Actions schedule planner" },
      ]}
    />
  );
}

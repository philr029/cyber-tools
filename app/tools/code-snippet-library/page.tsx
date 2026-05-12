"use client";

import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";

export default function CodeSnippetLibraryPage() {
  return (
    <ToolkitPlaceholder
      title="Code Snippet Library"
      description="Curated entry point into the snippet lab — language-tagged starters for JS, TS, Python, PowerShell, HTML, and CSS."
      category="Developer"
      bullets={[
        "Copy-ready snippets with syntax highlighting.",
        "Shareable permalinks for PRs and runbooks.",
        "Security notes for secrets and unsafe patterns.",
      ]}
      primaryAction={{ href: "/tools/coding/snippet", label: "Open snippet generator" }}
      related={[
        { href: "/coding-tools", label: "Coding hub" },
        { href: "/tools/coding/json-formatter", label: "JSON formatter" },
      ]}
    />
  );
}

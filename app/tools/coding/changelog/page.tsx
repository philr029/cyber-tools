"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

function bullets(s: string): string[] {
  return (s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function ChangelogGeneratorPage() {
  return (
    <GeneratorTool
      title="Changelog Generator"
      description="Produce a Keep-a-Changelog style entry with Added / Changed / Fixed / Removed sections — perfect for release notes and CHANGELOG.md."
      skill="Release management, release notes."
      why="Users actually read changelogs that are grouped and skimmable."
      storageKey="ss.changelog"
      fields={[
        { id: "version", label: "Version", placeholder: "1.4.0", defaultValue: "1.0.0" },
        { id: "date", label: "Release date", type: "date", defaultValue: new Date().toISOString().slice(0, 10) },
        { id: "added", label: "Added (one per line)", type: "textarea", rows: 4, defaultValue: "Coding automation tools section\nDashboard hero with stats" },
        { id: "changed", label: "Changed (one per line)", type: "textarea", rows: 4, defaultValue: "Header navigation now groups tools by category" },
        { id: "fixed", label: "Fixed (one per line)", type: "textarea", rows: 4, defaultValue: "Mobile hamburger menu hydration issue\nRouting on category index pages" },
        { id: "removed", label: "Removed (one per line)", type: "textarea", rows: 3, defaultValue: "" },
      ]}
      generate={(v) => {
        const section = (name: string, lines: string[]) => {
          if (lines.length === 0) return "";
          return [`### ${name}`, ...lines.map((l) => `- ${l}`), ""].join("\n");
        };
        const md = [
          `## [${v.version || "0.0.0"}] - ${v.date || new Date().toISOString().slice(0, 10)}`,
          "",
          section("Added", bullets(v.added)),
          section("Changed", bullets(v.changed)),
          section("Fixed", bullets(v.fixed)),
          section("Removed", bullets(v.removed)),
        ]
          .filter(Boolean)
          .join("\n");
        return [{ label: "CHANGELOG.md entry", value: md, language: "markdown" }];
      }}
    />
  );
}

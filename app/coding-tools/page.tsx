import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryIndexTools } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "Coding Tools — SecureScope Toolkit",
  description: "Snippets, regex, JSON, API requests, GitHub Actions, READMEs, commits, changelogs, and PR review prompts.",
};

export default function CodingToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Developer utilities"
      title="Coding & Developer Tools"
      intro="Small generators and formatters that remove friction from everyday engineering — from snippets and JSON to Actions YAML, README skeletons, and PR review checklists."
      tools={categoryIndexTools("Coding/Developer Tools")}
    />
  );
}

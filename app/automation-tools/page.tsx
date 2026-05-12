import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryIndexTools } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "Automation Tools — SecureScope Toolkit",
  description: "CI/CD schedules, API safety, environment variables, and integration planners.",
};

export default function AutomationToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Automation"
      title="Automation & Ops Tools"
      intro="Pipelines, planners, and guardrails for shipping changes safely — GitHub Actions hygiene, API keys, environment promotion, and integration contracts."
      tools={categoryIndexTools("Automation Tools")}
    />
  );
}

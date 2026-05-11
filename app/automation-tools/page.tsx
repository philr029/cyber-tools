import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Automation Tools — SecureScope Toolkit",
  description: "Daily test planner, GitHub Actions schedules, API key safety, Vercel env vars, Power Automate.",
};

export default function AutomationToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Automation"
      title="Automation & Ops Tools"
      intro="Generators and checklists for the automation that quietly keeps a site healthy — scheduled checks, GitHub Actions cron, environment variables, Power Automate flow design and API-key hygiene."
      tools={[
        {
          href: "/tools/automation/daily-test-planner",
          title: "Daily Website Test Planner",
          description: "Generate a cron schedule for uptime, SSL, DNS, lead form, and performance checks.",
          badge: "Generator",
          why: "Most websites need a small set of automated checks — this gives you the starting point.",
          skill: "Site reliability, cron scheduling.",
        },
        {
          href: "/tools/automation/lead-form-qa",
          title: "Lead Form QA Checklist",
          description: "Functional, anti-spam, GDPR and accessibility regression for marketing forms.",
          badge: "Checklist",
          why: "Forms break quietly and lose pipeline.",
          skill: "Marketing-ops integration, QA.",
        },
        {
          href: "/tools/automation/github-actions",
          title: "GitHub Actions Schedule Generator",
          description: "Generate a clean .github/workflows YAML for scheduled jobs.",
          badge: "Generator",
          why: "Cron in CI replaces a fragile cron server.",
          skill: "GitHub Actions, CI scheduling.",
        },
        {
          href: "/tools/automation/api-key-safety",
          title: "API Key Safety Checklist",
          description: "Storage, scope, rotation, and detection controls for project secrets.",
          badge: "Checklist",
          why: "Leaked keys are the most common portfolio-project security issue.",
          skill: "Secrets management.",
        },
        {
          href: "/tools/automation/vercel-env-guide",
          title: "Vercel Env Variable Guide",
          description: "Plan production / preview / development env vars and get matching CLI commands.",
          badge: "Generator",
          why: "Avoid accidental client-side secret exposure.",
          skill: "Vercel deployment, env management.",
        },
        {
          href: "/tools/automation/power-automate",
          title: "Power Automate Flow Planner",
          description: "Sketch a Power Automate flow before you build — triggers, conditions, actions, connectors.",
          badge: "Planner",
          why: "Design before you click around the flow designer.",
          skill: "Power Automate, integration design.",
        },
        {
          href: "/tools/api-tester",
          title: "API Tester (server proxy)",
          description: "Inspect HTTP responses through a hardened server proxy.",
          badge: "Live",
          why: "Test APIs without exposing CORS-locked endpoints to your browser.",
          skill: "HTTP debugging, secure proxy.",
        },
        {
          href: "/tools/keyforge",
          title: "KeyForge",
          description: "Generate cryptographically strong API keys, session secrets, and tokens.",
          badge: "Live",
          why: "Strong, unique secrets are step zero of any automation.",
          skill: "Cryptography, secret hygiene.",
        },
      ]}
    />
  );
}

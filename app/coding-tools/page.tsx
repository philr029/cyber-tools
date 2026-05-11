import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";

export const metadata: Metadata = {
  title: "Coding Automation Tools — SecureScope Toolkit",
  description:
    "Snippets, regex, JSON, API builder, GitHub Actions, README, commits, changelogs and code review.",
};

export default function CodingToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Developer Automation"
      title="Coding Automation Tools"
      intro="Generators, formatters and checklists that compress the boring parts of day-to-day development — boilerplate, regexes, JSON debugging, commit hygiene, API request shaping and review discipline."
      tools={[
        {
          href: "/tools/coding/snippet",
          title: "Code Snippet Generator",
          description: "Starter templates for JavaScript, Python, PowerShell, HTML and CSS, with one-click copy.",
          badge: "Generator",
          why: "Stops you re-typing the same boilerplate every time you spin up a script.",
          skill: "Multi-language scaffolding.",
        },
        {
          href: "/tools/coding/regex",
          title: "Regex Builder",
          description: "Pick a common pattern (email, UK phone, URL, postcode, IP, date) and test against your own input.",
          badge: "Builder",
          why: "Reusable, tested regexes for the validation problems that actually come up.",
          skill: "Pattern matching, input validation.",
        },
        {
          href: "/tools/coding/json-formatter",
          title: "JSON Formatter & Validator",
          description: "Pretty-print JSON, validate structure, and get clear error messages with line numbers.",
          badge: "Utility",
          why: "API debugging without leaving the toolkit.",
          skill: "JSON debugging, data hygiene.",
        },
        {
          href: "/tools/coding/api-builder",
          title: "API Request Builder",
          description: "Compose a request and get matching fetch() and curl snippets you can paste straight into code.",
          badge: "Generator",
          why: "Less time hand-formatting fetch and curl, more time shipping.",
          skill: "HTTP, API integration.",
        },
        {
          href: "/tools/coding/actions-generator",
          title: "GitHub Actions Workflow Generator",
          description: "Generate workflow YAML for Pages deploys, Playwright, security scans, schedules and Node builds.",
          badge: "Generator",
          why: "CI in five seconds rather than five wiki tabs.",
          skill: "GitHub Actions, CI/CD.",
        },
        {
          href: "/tools/coding/readme-generator",
          title: "README Generator",
          description: "Produce a professional README.md with badges, install steps, usage and tech stack.",
          badge: "Generator",
          why: "Great README = great first impression on every repo.",
          skill: "Technical writing.",
        },
        {
          href: "/tools/coding/commit-message",
          title: "Commit Message Generator",
          description: "Turn a rough change note into a short subject, Conventional Commit and body in one shot.",
          badge: "Generator",
          why: "Cleaner git history, better release notes for free.",
          skill: "Git, Conventional Commits.",
        },
        {
          href: "/tools/coding/bug-report",
          title: "Bug Report Generator",
          description: "Structure your issue into summary, steps, expected/actual, environment and priority.",
          badge: "Generator",
          why: "A well-structured bug ticket is closed in hours, not weeks.",
          skill: "QA, incident triage.",
        },
        {
          href: "/tools/coding/changelog",
          title: "Changelog Generator",
          description: "Compose a Keep-A-Changelog style entry with Added / Changed / Fixed / Removed buckets.",
          badge: "Generator",
          why: "Release notes your users will actually read.",
          skill: "Release management.",
        },
        {
          href: "/tools/coding/code-review-checklist",
          title: "Code Review Checklist",
          description: "Interactive checklist covering security, performance, accessibility, naming, tests and mobile.",
          badge: "Checklist",
          why: "Consistent reviews catch the things one reviewer always misses.",
          skill: "Code review discipline.",
        },
      ]}
    />
  );
}

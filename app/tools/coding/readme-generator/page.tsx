"use client";

import MultiOutputTool from "@/app/components/tools/MultiOutputTool";

export default function ReadmeGeneratorPage() {
  return (
    <MultiOutputTool
      title="README Generator"
      description="Turn a few short fields into a complete README.md — badges placeholder, install steps, usage and tech stack — ready to drop into any repo."
      skill="Technical writing, project hygiene."
      why="A polished README is the single highest-leverage thing you can add to a repo."
      futureApi="Optional: pass the description through an LLM via a serverless function to expand bullet points into prose."
      storageKey="ss.readme-generator"
      fields={[
        { id: "name", label: "Project name", placeholder: "My awesome project", defaultValue: "IT Automation Toolkit" },
        { id: "description", label: "Description (one or two sentences)", placeholder: "A short description of the project.", type: "textarea", rows: 3, defaultValue: "Generators and checklists for IT admins, developers and security teams." },
        { id: "features", label: "Features (one per line)", type: "textarea", rows: 4, defaultValue: "Dashboard of 40+ tools\nDark, glassmorphic UI\nLocalStorage-backed checklists\nServerless-ready API placeholders" },
        { id: "stack", label: "Tech stack (comma separated)", placeholder: "Next.js, Tailwind, TypeScript", defaultValue: "Next.js 16, React 19, TypeScript, Tailwind CSS" },
        { id: "install", label: "Install steps (one per line)", type: "textarea", rows: 4, defaultValue: "git clone https://github.com/you/your-repo.git\ncd your-repo\nnpm install" },
        { id: "usage", label: "Usage (one per line)", type: "textarea", rows: 4, defaultValue: "npm run dev   # start the dev server on http://localhost:3000\nnpm run build # production build\nnpm run lint  # static checks" },
        { id: "license", label: "License", placeholder: "MIT", defaultValue: "MIT" },
        { id: "author", label: "Author / handle", placeholder: "@yourhandle", defaultValue: "@yourhandle" },
      ]}
      generate={(v) => {
        const list = (s: string) =>
          (s || "")
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean);
        const stack = (v.stack || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

        const md = [
          `# ${v.name || "Project name"}`,
          "",
          `${v.description || "Project description."}`,
          "",
          `<!-- Replace badge URLs with your real repo path. -->`,
          `![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)`,
          `![License](https://img.shields.io/badge/license-${encodeURIComponent(v.license || "MIT")}-blue?style=flat-square)`,
          `![Stars](https://img.shields.io/badge/⭐-stars-yellow?style=flat-square)`,
          "",
          "## Features",
          ...list(v.features).map((f) => `- ${f}`),
          "",
          "## Tech stack",
          ...stack.map((s) => `- ${s}`),
          "",
          "## Install",
          "```bash",
          ...list(v.install),
          "```",
          "",
          "## Usage",
          "```bash",
          ...list(v.usage),
          "```",
          "",
          "## License",
          `${v.license || "MIT"} — © ${new Date().getFullYear()} ${v.author || "@yourhandle"}`,
          "",
        ].join("\n");

        return [{ label: "README.md", value: md, language: "markdown" }];
      }}
    />
  );
}

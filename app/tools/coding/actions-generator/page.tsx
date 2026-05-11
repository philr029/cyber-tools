"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

type WorkflowType =
  | "pages"
  | "playwright"
  | "security"
  | "schedule"
  | "node-build";

const WORKFLOWS: Record<WorkflowType, { label: string; yaml: string; explain: string[] }> = {
  pages: {
    label: "Deploy to GitHub Pages",
    yaml: `name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
`,
    explain: [
      "permissions: pages + id-token are required for the modern Pages deploy action.",
      "concurrency: a new push cancels in-flight builds so only the latest deploys.",
      "configure-pages + deploy-pages: official actions, no manual gh-pages branch needed.",
    ],
  },
  playwright: {
    label: "Run Playwright tests",
    yaml: `name: Playwright tests
on:
  pull_request:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
`,
    explain: [
      "timeout-minutes: protects against hung browsers.",
      "playwright install --with-deps: pulls browsers and Linux dependencies.",
      "Upload report on always(): you keep evidence even when tests fail.",
    ],
  },
  security: {
    label: "Security checks (npm audit + CodeQL)",
    yaml: `name: Security checks
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: "0 6 * * 1"

permissions:
  contents: read
  security-events: write

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm audit --omit=dev --audit-level=high

  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3
`,
    explain: [
      "Weekly schedule catches CVEs introduced upstream.",
      "npm audit --omit=dev focuses on production-impacting issues.",
      "CodeQL adds first-party static analysis with results in the Security tab.",
    ],
  },
  schedule: {
    label: "Scheduled daily automation",
    yaml: `name: Daily automation
on:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:

jobs:
  daily:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run check
        run: |
          curl -sSf https://example.com > /dev/null
          echo "Site reachable at $(date -u)"
`,
    explain: [
      "Cron is in UTC. 0 6 * * * == 06:00 UTC daily.",
      "workflow_dispatch keeps a manual trigger for ad-hoc runs.",
      "Replace the curl block with whatever your real check is.",
    ],
  },
  "node-build": {
    label: "Node.js build & lint",
    yaml: `name: Node build
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
`,
    explain: [
      "Matrix run across Node 20 and 22 keeps you ahead of LTS upgrades.",
      "Cache npm using setup-node — no separate cache action needed.",
      "Lint before build catches issues early.",
    ],
  },
};

export default function ActionsGeneratorPage() {
  const [type, setType] = useState<WorkflowType>("pages");
  const wf = WORKFLOWS[type];

  const explain = useMemo(
    () =>
      wf.explain
        .map((e, i) => `${i + 1}. ${e}`)
        .join("\n"),
    [wf],
  );

  return (
    <ToolPageLayout
      title="GitHub Actions Workflow Generator"
      description="Pick a common workflow (Pages deploy, Playwright, security scan, schedule, Node build) and get production-quality YAML you can paste straight into .github/workflows/."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="CI/CD, GitHub Actions, deployment automation." accent="cyan" />
        <Meta label="Why" body="Start from a workflow that already includes permissions, caching and timeouts." accent="violet" />
        <Meta label="Future API" body="Add a 'open PR' button via a serverless function with a GitHub App token." accent="emerald" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px,1fr]">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Workflow type
          </p>
          <div className="space-y-2">
            {(Object.keys(WORKFLOWS) as WorkflowType[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setType(k)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  type === k
                    ? "border-cyan-400/40 bg-cyan-500/10 text-white"
                    : "border-white/10 bg-black/20 text-white/70 hover:border-white/25 hover:text-white"
                }`}
              >
                {WORKFLOWS[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                .github/workflows/{type}.yml
              </p>
              <CopyButton text={wf.yaml} label="Copy YAML" />
            </div>
            <pre className="max-h-[26rem] overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre">
{wf.yaml}
            </pre>
          </div>

          <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/5 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200">
              What the important parts mean
            </p>
            <pre className="overflow-auto text-xs leading-6 text-emerald-50/80 whitespace-pre-wrap">
{explain}
            </pre>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}

function Meta({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}

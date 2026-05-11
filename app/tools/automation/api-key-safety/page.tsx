"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function ApiKeySafetyPage() {
  return (
    <ChecklistTool
      title="API Key Safety Checklist"
      description="Audit how your project stores, rotates, and revokes API keys. Practical controls for solo developers and small teams shipping to Vercel, GitHub Pages, or self-hosted infra."
      skill="Secrets management, secure SDLC"
      why="The single biggest portfolio-project security issue is leaking API keys in client-side JS or git history. This checklist makes that hard to do by accident."
      futureApi="GitHub Secret Scanning API, GitLeaks CLI, Vercel / Doppler / Azure Key Vault APIs for full automation."
      sections={[
        {
          title: "Storage",
          items: [
            { id: "ak-s1", label: "No API keys committed to git (run gitleaks / trufflehog scan)" },
            { id: "ak-s2", label: ".env / .env.local listed in .gitignore" },
            { id: "ak-s3", label: "Production secrets stored in a vault (Vercel env vars, GitHub Actions secrets, Azure Key Vault, Doppler)" },
            { id: "ak-s4", label: "Different keys for dev / staging / prod environments" },
            { id: "ak-s5", label: "Secrets never injected into the client bundle (NEXT_PUBLIC_* used only for non-secrets)" },
          ],
        },
        {
          title: "Scope & permissions",
          items: [
            { id: "ak-p1", label: "Each key uses the least privilege required (read-only where possible)" },
            { id: "ak-p2", label: "Each key is scoped to a single service / project, not a personal admin token" },
            { id: "ak-p3", label: "Keys with billing impact have a quota or budget alert" },
            { id: "ak-p4", label: "IP-allowlist or referrer restrictions applied where supported" },
          ],
        },
        {
          title: "Rotation & revocation",
          items: [
            { id: "ak-r1", label: "Rotation schedule documented (e.g. quarterly or on personnel change)" },
            { id: "ak-r2", label: "Process to revoke a leaked key in under 10 minutes" },
            { id: "ak-r3", label: "Audit log of who created / last accessed the key" },
            { id: "ak-r4", label: "Outgoing employees' personal keys revoked as part of offboarding" },
          ],
        },
        {
          title: "Detection",
          items: [
            { id: "ak-d1", label: "GitHub Secret Scanning + Push Protection enabled" },
            { id: "ak-d2", label: "Pre-commit hook running gitleaks / detect-secrets" },
            { id: "ak-d3", label: "Alerting set up if a key appears in build logs or error trackers" },
            { id: "ak-d4", label: "Periodic search of public paste sites for org domain" },
          ],
        },
      ]}
    />
  );
}

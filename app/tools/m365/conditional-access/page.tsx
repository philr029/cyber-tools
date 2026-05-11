"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function ConditionalAccessPage() {
  return (
    <ChecklistTool
      title="Conditional Access Policy Checklist"
      description="Plan, name, and roll out a coherent Conditional Access baseline — covering MFA, device compliance, location, app filters, and emergency access."
      skill="Zero Trust policy design, Entra Conditional Access"
      why="Conditional Access is the policy plane of Microsoft 365. A small, well-named set of policies is much safer and easier to audit than dozens of ad-hoc rules."
      futureApi="Graph: /identity/conditionalAccess/policies for read/write, /identity/conditionalAccess/namedLocations, /reportConnectors for sign-in evidence."
      inputs={[
        { id: "tenant", label: "Tenant name / domain", placeholder: "contoso.onmicrosoft.com" },
        { id: "owner", label: "Policy owner", placeholder: "Security Operations Lead" },
      ]}
      sections={[
        {
          title: "Foundation",
          description: "Build a clear naming convention before you create policies.",
          items: [
            { id: "ca-f1", label: "Adopt naming convention e.g. CA001-Block-Legacy-Auth-All" },
            { id: "ca-f2", label: "Define personas: employees, admins, guests, service accounts, frontline" },
            { id: "ca-f3", label: "Configure two cloud-only break-glass accounts excluded from all policies" },
            { id: "ca-f4", label: "Configure Named Locations for trusted office IP ranges and country lists" },
          ],
        },
        {
          title: "Baseline policies (required)",
          items: [
            { id: "ca-b1", label: "Block legacy authentication (all users, all apps)" },
            { id: "ca-b2", label: "Require MFA for all users, all apps (exclude break-glass)" },
            { id: "ca-b3", label: "Require MFA for admin roles (Global Admin, Security Admin, etc.)" },
            { id: "ca-b4", label: "Require compliant device or hybrid Entra-joined for managed apps" },
            { id: "ca-b5", label: "Require MFA + ToU for guest users accessing tenant resources" },
          ],
        },
        {
          title: "Risk-based & advanced",
          items: [
            { id: "ca-r1", label: "Sign-in risk: require password change + MFA on medium/high risk" },
            { id: "ca-r2", label: "User risk: block or force password reset on high user risk" },
            { id: "ca-r3", label: "Session controls: app-enforced restrictions for SharePoint/OneDrive on unmanaged devices" },
            { id: "ca-r4", label: "Block sign-ins from anonymous IPs (Tor / known proxy)" },
          ],
        },
        {
          title: "Rollout & maintenance",
          items: [
            { id: "ca-m1", label: "Test each policy with What-If tool before enabling" },
            { id: "ca-m2", label: "Use report-only mode for at least 7 days, review sign-in logs" },
            { id: "ca-m3", label: "Document each policy's purpose, owner, and review date" },
            { id: "ca-m4", label: "Schedule quarterly review of all policies and exclusions" },
            { id: "ca-m5", label: "Backup policies to JSON (via Graph) and store in version control" },
          ],
        },
      ]}
    />
  );
}

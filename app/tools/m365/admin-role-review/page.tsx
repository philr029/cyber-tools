"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function AdminRoleReviewPage() {
  return (
    <ChecklistTool
      title="Admin Role Review Tool"
      description="Methodical pass over privileged roles in Microsoft 365 — Global, Exchange, SharePoint, Teams, Security, Billing — checking for least privilege and break-glass coverage."
      skill="Privileged access management."
      why="The smaller and tighter your admin footprint, the harder you are to breach."
      storageKey="ss.admin-role-review"
      futureApi="Wire to Graph /directoryRoles and Privileged Identity Management APIs to list active vs eligible role assignments."
      inputs={[
        { id: "tenant", label: "Tenant", placeholder: "Contoso UK" },
        { id: "reviewer", label: "Reviewer", placeholder: "@you" },
        { id: "date", label: "Review date", type: "date" },
      ]}
      sections={[
        {
          title: "Global Admins",
          items: [
            { id: "ga-1", label: "<5 named Global Administrators" },
            { id: "ga-2", label: "All GAs use MFA with strong authenticator" },
            { id: "ga-3", label: "GA accounts are dedicated (no day-to-day mailbox)" },
            { id: "ga-4", label: "GAs are eligible via PIM, not active by default" },
            { id: "ga-5", label: "Two break-glass GAs exist, excluded from CA, regularly tested" },
          ],
        },
        {
          title: "Exchange Admins",
          items: [
            { id: "ex-1", label: "Limited to messaging team + service desk leads" },
            { id: "ex-2", label: "No standing 'Organisation Management' for service desk" },
            { id: "ex-3", label: "Role group changes audited monthly" },
          ],
        },
        {
          title: "SharePoint Admins",
          items: [
            { id: "sp-1", label: "Limited to platform owners (not site owners)" },
            { id: "sp-2", label: "External sharing settings reviewed" },
          ],
        },
        {
          title: "Teams Admins",
          items: [
            { id: "ta-1", label: "Voice admin and full Teams admin separated" },
            { id: "ta-2", label: "Lifecycle and app management policies documented" },
          ],
        },
        {
          title: "Security & Compliance Admins",
          items: [
            { id: "sec-1", label: "Security Reader used for analyst-only access" },
            { id: "sec-2", label: "Security Operator used over Security Admin where possible" },
            { id: "sec-3", label: "Compliance Admin restricted to DLP / eDiscovery owners" },
          ],
        },
        {
          title: "Billing Admins",
          items: [
            { id: "bi-1", label: "Limited to finance / procurement only" },
            { id: "bi-2", label: "No mailbox or licence management privileges" },
          ],
        },
        {
          title: "Least privilege & process",
          items: [
            { id: "lp-1", label: "Standing assignments minimised — prefer PIM eligibility" },
            { id: "lp-2", label: "Quarterly access review record stored" },
            { id: "lp-3", label: "Joiners / movers / leavers reflected in role assignments" },
            { id: "lp-4", label: "Privileged identities receive higher-friction MFA" },
          ],
        },
      ]}
    />
  );
}

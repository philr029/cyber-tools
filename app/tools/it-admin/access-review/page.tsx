"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function AccessReviewPage() {
  return (
    <ChecklistTool
      title="User Access Review Tool"
      description="Quarterly access review covering active users, disabled accounts, admin roles, shared mailboxes, guests, MFA enrolment and group memberships."
      skill="IAM governance, access reviews."
      why="Periodic reviews are the cheapest way to catch creeping privilege and stale accounts."
      storageKey="ss.access-review"
      futureApi="Wire to Microsoft Graph (/users, /groups, /directoryRoles, /reports/authenticationMethods) to auto-populate counts and flag exceptions."
      inputs={[
        { id: "tenant", label: "Tenant / company", placeholder: "Contoso UK" },
        { id: "reviewer", label: "Reviewer", placeholder: "@you" },
        { id: "period", label: "Review period (quarter)", placeholder: "Q4 2026" },
      ]}
      sections={[
        {
          title: "Active users",
          items: [
            { id: "au-1", label: "Confirm headcount matches HR system" },
            { id: "au-2", label: "Sample 10 random active users and verify line manager attribute" },
            { id: "au-3", label: "Verify usage location and primary licence on each user" },
          ],
        },
        {
          title: "Disabled / stale users",
          items: [
            { id: "du-1", label: "Block sign-in on users with no activity >90 days" },
            { id: "du-2", label: "Remove licences from disabled users (after retention period)" },
            { id: "du-3", label: "Confirm OneDrive retention is in scope before deletion" },
          ],
        },
        {
          title: "Admin roles",
          items: [
            { id: "ad-1", label: "Global Admins <5 and all use MFA + PIM where possible" },
            { id: "ad-2", label: "Break glass accounts exist, excluded from CA, and tested" },
            { id: "ad-3", label: "Service / app accounts use service principals, not user accounts" },
            { id: "ad-4", label: "Roles assigned eligible (PIM) rather than active where possible" },
          ],
        },
        {
          title: "Shared mailboxes",
          items: [
            { id: "sm-1", label: "Each shared mailbox has a documented owner" },
            { id: "sm-2", label: "Members removed when they leave the team" },
            { id: "sm-3", label: "Forwarding rules reviewed for suspicious external addresses" },
          ],
        },
        {
          title: "Guest users",
          items: [
            { id: "gu-1", label: "Stale guests (>90 days no sign-in) removed" },
            { id: "gu-2", label: "Guest invitation policy restricts who can invite" },
            { id: "gu-3", label: "Guests only in approved Teams / SharePoint sites" },
          ],
        },
        {
          title: "MFA & authentication",
          items: [
            { id: "mfa-1", label: "All admins enforced with MFA (Conditional Access)" },
            { id: "mfa-2", label: "Per-user MFA replaced by Conditional Access" },
            { id: "mfa-3", label: "Number-matching + location context enabled" },
            { id: "mfa-4", label: "SMS / voice disabled as a method where possible" },
          ],
        },
        {
          title: "Groups & membership",
          items: [
            { id: "gr-1", label: "Sensitivity / role-based groups reviewed by owner" },
            { id: "gr-2", label: "Dynamic group rules accurate vs HR data" },
            { id: "gr-3", label: "Empty groups removed or flagged" },
          ],
        },
      ]}
    />
  );
}

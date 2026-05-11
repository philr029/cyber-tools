"use client";

import MultiOutputTool from "@/app/components/tools/MultiOutputTool";

export default function FirewallRulesPage() {
  return (
    <MultiOutputTool
      title="Firewall Rule Generator"
      description="Compose a Windows Defender Firewall rule from form inputs and copy a New-NetFirewallRule PowerShell command, plus quick examples for blocking SMB and NetBIOS."
      skill="Endpoint hardening, network controls."
      why="The most common 'this should be blocked' situations always come back — generate the same correct rule every time."
      futureApi="Optional: deploy the generated rule via Intune endpoint security policy or Group Policy in a serverless workflow."
      storageKey="ss.firewall-rules"
      fields={[
        { id: "name", label: "Rule display name", placeholder: "Block inbound SMB", defaultValue: "Block inbound SMB" },
        { id: "port", label: "Port (single, range, or comma list)", placeholder: "445 or 135-139", defaultValue: "445" },
        {
          id: "protocol",
          label: "Protocol",
          type: "select",
          options: [
            { value: "TCP", label: "TCP" },
            { value: "UDP", label: "UDP" },
            { value: "Any", label: "Any" },
          ],
          defaultValue: "TCP",
        },
        {
          id: "action",
          label: "Action",
          type: "select",
          options: [
            { value: "Block", label: "Block" },
            { value: "Allow", label: "Allow" },
          ],
          defaultValue: "Block",
        },
        {
          id: "direction",
          label: "Direction",
          type: "select",
          options: [
            { value: "Inbound", label: "Inbound" },
            { value: "Outbound", label: "Outbound" },
          ],
          defaultValue: "Inbound",
        },
        {
          id: "profile",
          label: "Profile",
          type: "select",
          options: [
            { value: "Any", label: "Any" },
            { value: "Public", label: "Public" },
            { value: "Private", label: "Private" },
            { value: "Domain", label: "Domain" },
          ],
          defaultValue: "Any",
        },
        { id: "remote", label: "Remote address (optional)", placeholder: "10.0.0.0/8 or LocalSubnet" },
      ]}
      generate={(v) => {
        const remote = v.remote?.trim() ? ` -RemoteAddress ${v.remote.trim()}` : "";
        const ps = `New-NetFirewallRule \`
  -DisplayName "${v.name || "My rule"}" \`
  -Direction ${v.direction || "Inbound"} \`
  -Action ${v.action || "Block"} \`
  -Protocol ${v.protocol || "TCP"} \`
  -LocalPort ${v.port || "445"} \`
  -Profile ${v.profile || "Any"}${remote}`;

        const verify = `Get-NetFirewallRule -DisplayName "${v.name || "My rule"}" |
  Format-List DisplayName, Enabled, Action, Direction, Profile`;

        const examples = `# Block inbound SMB from anywhere on Public networks
New-NetFirewallRule -DisplayName "Block inbound SMB (Public)" \`
  -Direction Inbound -Action Block -Protocol TCP -LocalPort 445 -Profile Public

# Block NetBIOS over TCP/IP (135-139)
New-NetFirewallRule -DisplayName "Block NetBIOS" \`
  -Direction Inbound -Action Block -Protocol TCP -LocalPort 135-139 -Profile Any
New-NetFirewallRule -DisplayName "Block NetBIOS UDP" \`
  -Direction Inbound -Action Block -Protocol UDP -LocalPort 137-138 -Profile Any

# Allow RDP only from a trusted subnet
New-NetFirewallRule -DisplayName "Allow RDP from mgmt subnet" \`
  -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3389 \`
  -Profile Domain -RemoteAddress 10.10.20.0/24`;

        return [
          { label: "New-NetFirewallRule", value: ps, language: "powershell" },
          { label: "Verify", value: verify, language: "powershell" },
          { label: "Common examples (SMB / NetBIOS / RDP)", value: examples, language: "powershell" },
        ];
      }}
    />
  );
}

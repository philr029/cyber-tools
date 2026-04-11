/**
 * Action Agent — translates analysis findings into prioritised, actionable
 * recommendations.
 *
 * Outputs:
 *  - verdict     — top-level verdict (block / investigate / monitor / ignore)
 *  - actions     — prioritised list of specific steps
 *  - securityImprovements — general hardening suggestions
 */

import type { ReconData, AnalysisData, RiskData, ActionData, ActionItem, ActionVerdict } from "./agentTypes";

function verdictFromRisk(level: RiskData["level"]): ActionVerdict {
  switch (level) {
    case "Critical": return "block";
    case "High":     return "investigate";
    case "Medium":   return "investigate";
    case "Low":      return "monitor";
    case "Safe":     return "ignore";
  }
}

function verdictReason(verdict: ActionVerdict, level: RiskData["level"]): string {
  switch (verdict) {
    case "block":
      return `Risk level ${level} — confirmed malicious indicators present. Immediate blocking recommended.`;
    case "investigate":
      return `Risk level ${level} — multiple suspicious signals detected. Full investigation required before trusting this target.`;
    case "monitor":
      return `Risk level ${level} — minor issues only. Continue monitoring; no immediate action needed.`;
    case "ignore":
      return `Risk level ${level} — no significant threats detected. No action required.`;
  }
}

export function runActionAgent(
  recon: ReconData,
  analysis: AnalysisData,
  risk: RiskData,
): ActionData {
  const verdict = verdictFromRisk(risk.level);
  const actions: ActionItem[] = [];
  const improvements: string[] = [];

  // --- Critical: blocking actions ---
  if (risk.level === "Critical" || risk.level === "High") {
    actions.push({
      priority: "immediate",
      action: recon.queryType === "ip" ? "Block IP address" : "Block domain",
      detail:
        recon.queryType === "ip"
          ? `Add ${recon.query} to your firewall blocklist and review any existing connections.`
          : `Block "${recon.query}" at your DNS / web proxy level and alert affected users.`,
      category: "block",
    });
  }

  // --- Abuse IP ---
  const abuse = recon.lookupResult.ipReputation.abuseConfidenceScore;
  if (abuse >= 50) {
    actions.push({
      priority: "immediate",
      action: "Terminate active connections from this IP",
      detail: `Abuse confidence is ${abuse}%. Check your access logs for traffic from ${recon.query} and terminate any active sessions.`,
      category: "block",
    });
  }

  // --- Blacklist ---
  if (analysis.blacklistStatus === "listed") {
    const count = recon.lookupResult.blacklist.listedCount;
    actions.push({
      priority: count > 2 ? "immediate" : "high",
      action: "Submit delisting requests",
      detail: `"${recon.query}" appears on ${count} blacklist(s). Submit delisting requests and investigate the root cause of the listing.`,
      category: "investigate",
    });
  }

  // --- SSL ---
  if (analysis.sslStatus === "expired") {
    actions.push({
      priority: "immediate",
      action: "Renew SSL certificate immediately",
      detail: "The certificate has expired. Users will see browser security warnings. Use Let's Encrypt or your CA to renew.",
      category: "improve",
    });
  } else if (analysis.sslStatus === "expiring") {
    actions.push({
      priority: recon.lookupResult.ssl.daysRemaining < 7 ? "immediate" : "high",
      action: "Renew SSL certificate",
      detail: `Certificate expires in ${recon.lookupResult.ssl.daysRemaining} day(s). Enable auto-renewal to avoid future lapses.`,
      category: "improve",
    });
  }

  // --- Security headers ---
  if (recon.lookupResult.securityHeaders.score < 40) {
    actions.push({
      priority: "high",
      action: "Add critical security headers",
      detail: "Add Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, and X-Content-Type-Options headers to your server or CDN.",
      category: "improve",
    });
  } else if (recon.lookupResult.securityHeaders.score < 70) {
    actions.push({
      priority: "medium",
      action: "Improve security header configuration",
      detail: "Some recommended headers are missing. Review the Security Headers report and add the flagged headers.",
      category: "improve",
    });
  }

  // --- Risky ports ---
  if (analysis.openRiskyPorts.length > 0) {
    const portNames: Record<number, string> = {
      21: "FTP", 23: "Telnet", 25: "SMTP", 110: "POP3",
      135: "RPC", 139: "NetBIOS", 143: "IMAP", 389: "LDAP",
      445: "SMB", 1433: "MSSQL", 1521: "Oracle DB",
      3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL", 5900: "VNC",
    };
    const portDesc = analysis.openRiskyPorts
      .map((p) => `${p}${portNames[p] ? ` (${portNames[p]})` : ""}`)
      .join(", ");
    actions.push({
      priority: "high",
      action: "Close or firewall risky ports",
      detail: `Ports ${portDesc} are open externally. Close unused ones and restrict access to authorised IPs only via firewall rules.`,
      category: "block",
    });
  }

  // --- SPF ---
  if (analysis.spfStatus === "missing") {
    actions.push({
      priority: "medium",
      action: "Add SPF record to DNS",
      detail: 'Create a TXT record: v=spf1 include:yourmailprovider.com ~all — this prevents email spoofing.',
      category: "improve",
    });
  } else if (analysis.spfStatus === "fail") {
    actions.push({
      priority: "high",
      action: "Fix permissive SPF record",
      detail: 'Change "+all" to "-all" or "~all" in your SPF TXT record to prevent unauthorised senders.',
      category: "improve",
    });
  }

  // --- DKIM ---
  if (analysis.dkimStatus === "missing" && recon.queryType === "domain") {
    actions.push({
      priority: "medium",
      action: "Enable DKIM for your domain",
      detail: "Generate a DKIM key pair with your email provider and publish the public key as a DNS TXT record.",
      category: "improve",
    });
  }

  // --- Newly registered ---
  if (analysis.domainAge !== null && analysis.domainAge < 30) {
    actions.push({
      priority: "high",
      action: "Investigate domain ownership",
      detail: `This domain is only ${analysis.domainAge} day(s) old. Verify the registrant's identity before any business interaction.`,
      category: "investigate",
    });
  }

  // --- Always monitor ---
  if (verdict !== "block") {
    actions.push({
      priority: "low",
      action: "Schedule periodic re-scan",
      detail: "Set a reminder to re-scan this target every 30 days to catch new threats as they emerge.",
      category: "monitor",
    });
  }

  // --- Security improvements (general hardening) ---
  if (recon.queryType === "domain" || recon.queryType === "url") {
    if (analysis.spfStatus === "missing" || analysis.dkimStatus === "missing") {
      improvements.push("Implement DMARC policy to prevent email spoofing: v=DMARC1; p=quarantine;");
    }
    if (analysis.sslStatus !== "valid") {
      improvements.push("Enable TLS 1.3 and disable legacy TLS 1.0/1.1 on your web server.");
    }
    if (recon.lookupResult.securityHeaders.score < 70) {
      improvements.push("Consider using a WAF (Web Application Firewall) or CDN with security header injection.");
    }
    improvements.push("Enable HSTS preloading at hstspreload.org for maximum transport security.");
    improvements.push("Set up automated certificate renewal (e.g., certbot --deploy-hook) to prevent expiry lapses.");
  }

  if (recon.queryType === "ip") {
    improvements.push("Configure fail2ban or similar to auto-block IPs with repeated failed auth attempts.");
    improvements.push("Restrict SSH and RDP to VPN-only access via firewall rules.");
    improvements.push("Enable cloud provider's DDoS protection if hosting workloads on this IP.");
  }

  // Sort actions by priority
  const priorityOrder: Record<ActionItem["priority"], number> = {
    immediate: 0, high: 1, medium: 2, low: 3,
  };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    verdict,
    verdictReason: verdictReason(verdict, risk.level),
    actions,
    securityImprovements: improvements,
  };
}

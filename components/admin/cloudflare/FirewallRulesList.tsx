"use client";

interface WafRule {
  name: string;
  expression: string;
  action: string;
  description: string;
  severity: "critical" | "high" | "medium" | "info";
}

const RECOMMENDED_RULES: WafRule[] = [
  {
    name: "Block Bad Bots",
    expression: '(cf.client.bot) and not (cf.verified_bot_category in {"Search Engine Crawler" "Monitoring & Analytics" "Page Preview"})',
    action: "Block",
    description: "Block unverified bots while allowing known good crawlers (Google, Bing, etc.).",
    severity: "high",
  },
  {
    name: "Protect Admin Routes",
    expression: '(http.request.uri.path contains "/admin")',
    action: "Block / IP Allowlist",
    description: 'Restrict /admin to specific IPs. Add "and not (ip.src in {YOUR_IP})" to allow your own IP.',
    severity: "critical",
  },
  {
    name: "Block SQLi / XSS Patterns",
    expression: '(http.request.uri.query contains "UNION SELECT") or (http.request.uri.query contains "<script") or (http.request.uri.query contains "javascript:")',
    action: "Block",
    description: "Catch common SQL injection and reflected XSS attempts in query strings.",
    severity: "critical",
  },
  {
    name: "Country Challenge (High-Risk)",
    expression: '(ip.geoip.country in {"CN" "RU" "KP" "IR"})',
    action: "Managed Challenge",
    description: "Serve a CAPTCHA to visitors from high-risk countries. Use 'Managed Challenge' instead of Block to avoid false positives.",
    severity: "medium",
  },
  {
    name: "Rate Limit: API Endpoints",
    expression: '(http.request.uri.path wildcard "/api/*")',
    action: "Block (100 req/min)",
    description: "Limit API calls to 100 per minute per IP. Configure under WAF → Rate Limiting Rules.",
    severity: "high",
  },
  {
    name: "Rate Limit: Auth Endpoints",
    expression: '(http.request.uri.path wildcard "/api/auth/*")',
    action: "Block (5 req/min)",
    description: "Strict rate limit on login/signup to prevent brute-force attacks.",
    severity: "critical",
  },
  {
    name: "Require HTTPS",
    expression: "(ssl eq false)",
    action: "Redirect to HTTPS",
    description: "Redirect all plain HTTP traffic to HTTPS. Also enable in SSL/TLS → Edge Certificates → Always Use HTTPS.",
    severity: "medium",
  },
  {
    name: "Block Malformed User-Agents",
    expression: '(not http.user_agent contains "/") and (http.user_agent ne "")',
    action: "Block",
    description: "Block requests with user-agents that lack a forward-slash (almost always automated tools).",
    severity: "medium",
  },
];

const SEVERITY_STYLES: Record<WafRule["severity"], string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  info: "text-slate-400 bg-slate-700/40 border-slate-600/30",
};

const ACTION_STYLES: Record<string, string> = {
  Block: "text-red-400",
  "Block (100 req/min)": "text-red-400",
  "Block (5 req/min)": "text-red-400",
  "Managed Challenge": "text-amber-400",
  "Block / IP Allowlist": "text-orange-400",
  "Redirect to HTTPS": "text-cyan-400",
};

export default function FirewallRulesList() {
  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Recommended WAF Rules</p>
        <a
          href="https://dash.cloudflare.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Configure in CF
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
          </svg>
        </a>
      </div>

      <p className="text-xs text-slate-500">
        Copy these expressions into{" "}
        <strong className="text-slate-400">Security → WAF → Custom Rules</strong> in the Cloudflare dashboard.
      </p>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {RECOMMENDED_RULES.map((rule) => (
          <details
            key={rule.name}
            className="group bg-[#131929] border border-[#1e2d4a] rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium capitalize border ${SEVERITY_STYLES[rule.severity]}`}
                >
                  {rule.severity}
                </span>
                <span className="text-xs font-medium text-slate-200 truncate">{rule.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium ${ACTION_STYLES[rule.action] ?? "text-slate-400"}`}>
                  {rule.action}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-slate-500 transition-transform group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </summary>

            <div className="px-4 pb-4 pt-1 space-y-2 border-t border-[#1e2d4a]">
              <p className="text-xs text-slate-400">{rule.description}</p>
              <div className="relative">
                <pre className="text-xs font-mono text-cyan-300 bg-[#0b0f1a] border border-[#1e2d4a] rounded-lg px-3 py-2.5 overflow-x-auto whitespace-pre-wrap break-all">
                  {rule.expression}
                </pre>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(rule.expression)}
                  className="absolute top-2 right-2 p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                  aria-label="Copy expression"
                  title="Copy to clipboard"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

interface EnvCard {
  service: string;
  envKey: string;
  description: string;
  docsUrl: string;
  freeTier: string;
}

const ENV_CARDS: EnvCard[] = [
  {
    service: "AbuseIPDB",
    envKey: "ABUSEIPDB_API_KEY",
    description: "Powers the IP Reputation tool. Provides abuse confidence scores, ISP, country, and report history.",
    docsUrl: "https://www.abuseipdb.com/register",
    freeTier: "Free tier: 1,000 checks/day",
  },
  {
    service: "VirusTotal",
    envKey: "VIRUSTOTAL_API_KEY",
    description: "Powers Domain Reputation and URL Analysis tools. 70+ security vendor analysis.",
    docsUrl: "https://www.virustotal.com/gui/join-us",
    freeTier: "Free tier: 500 lookups/day",
  },
  {
    service: "HetrixTools",
    envKey: "HETRIXTOOLS_API_KEY",
    description: "Powers the Blacklist Checker. Checks against 450+ spam and abuse blacklists.",
    docsUrl: "https://hetrixtools.com/dashboard/api-token/",
    freeTier: "Free tier available",
  },
  {
    service: "SecurityTrails",
    envKey: "SECURITYTRAILS_API_KEY",
    description: "Powers the DNS Lookup tool with historical and current DNS record data.",
    docsUrl: "https://securitytrails.com/corp/api",
    freeTier: "Free tier: 50 queries/month",
  },
  {
    service: "Shodan",
    envKey: "SHODAN_API_KEY",
    description: "Powers the Open Ports view in the unified dashboard. Pre-indexed port scan data.",
    docsUrl: "https://account.shodan.io/register",
    freeTier: "Membership required for API",
  },
];

const CheckIcon = (
  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

const ExternalLinkIcon = (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
      clipRule="evenodd"
    />
  </svg>
);

export default function SettingsPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-800">Settings</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Configure API keys for live data. Keys are stored as server-side environment variables — never exposed to the browser.
        </p>

        {/* Vercel deployment instructions */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">Deploying on Vercel</h2>
          <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
            <li>Push this repository to GitHub and import it into Vercel</li>
            <li>
              Open your Vercel project → <strong>Settings</strong> → <strong>Environment Variables</strong>
            </li>
            <li>Add each key from the table below as a new environment variable</li>
            <li>Redeploy — tools will automatically use live data for any key that is present</li>
          </ol>
          <p className="text-xs text-blue-600 mt-3">
            Tools without a configured key show a <span className="font-medium">Not configured</span> badge and return safe default values — no errors, just placeholder results.
          </p>
        </div>

        {/* Local development instructions */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Local development</h2>
          <p className="text-xs text-gray-500 mb-3">
            Create a <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">.env.local</code> file in the project root and add your keys there. Restart the dev server after saving.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">.env.local</p>
            <pre className="text-sm font-mono text-green-400 whitespace-pre leading-relaxed">
{`ABUSEIPDB_API_KEY=your_key_here
VIRUSTOTAL_API_KEY=your_key_here
HETRIXTOOLS_API_KEY=your_key_here
SECURITYTRAILS_API_KEY=your_key_here
SHODAN_API_KEY=your_key_here`}
            </pre>
          </div>
          <p className="text-xs text-gray-400 mt-2">Run: <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-gray-600">npm run dev</code></p>
        </div>

        {/* API key cards */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">API Providers</h2>
          {ENV_CARDS.map((card) => (
            <div
              key={card.envKey}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{card.service}</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {card.freeTier}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{card.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-mono bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                      {card.envKey}
                    </span>
                  </div>
                </div>
                <a
                  href={card.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Get API key
                  {ExternalLinkIcon}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* WHOIS / SSL note */}
        <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 mt-0.5">{CheckIcon}</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">WHOIS &amp; Security Headers — No key needed</h3>
              <p className="text-xs text-gray-500">
                WHOIS lookups use the IANA RDAP bootstrap service (free, public).
                Security Headers checks make a live HEAD request to the target domain directly from the server.
                SSL certificate data uses the SSL Labs API (public, rate-limited, no key required).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

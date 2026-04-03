# SecureScope – Cyber Intelligence Dashboard

A clean, modern cyber security dashboard built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Features

- 🔍 **IP & Domain Lookup** – Enter any IP address or domain to run a comprehensive security analysis
- 🛡️ **IP Reputation** – Abuse confidence scoring, ISP, country, and report history
- 🌐 **Domain Reputation** – Multi-engine vendor analysis with category tagging
- 🚫 **Blacklist Status** – Check against Spamhaus, SURBL, Barracuda, SpamCop, UCEPROTECT
- 🔒 **SSL Certificate** – Issuer, expiry, protocol, key size, and subject alt names
- 📋 **Security Headers** – Graded analysis of HTTP security headers
- 🔌 **Open Ports** – Port scan results with service and version detection
- 🗂️ **DNS Information** – A, AAAA, MX, TXT, NS records and reverse DNS
- 🕑 **History** – Persisted recent lookup history with status badges
- 📊 **Status Badges** – Safe / Warning / Risk indicators throughout

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Mock Data

The app ships with three demo queries:

| Query | Status |
|---|---|
| `8.8.8.8` | ✅ Safe |
| `example.com` | ⚠️ Warning |
| `malicious-test.xyz` | 🔴 Risk |

## Future API Integrations

The `lib/mockData.ts` file exports a `lookupQuery(query)` async function. Replace the mock implementation with real API calls:

- [AbuseIPDB](https://www.abuseipdb.com/) – IP reputation
- [VirusTotal](https://www.virustotal.com/) – Domain / IP reputation
- [HetrixTools](https://hetrixtools.com/) – Blacklist monitoring
- [SecurityTrails](https://securitytrails.com/) – DNS & domain intelligence
- [SSL Labs API](https://www.ssllabs.com/projects/ssllabs-apis/) – SSL certificate analysis


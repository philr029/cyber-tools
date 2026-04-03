# SecureScope – Cyber Intelligence Dashboard

A clean, modern cybersecurity toolkit built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**. All tools fall back to mock data automatically when no API key is configured — no errors, just sample results clearly labelled "Mock Data".

---

## Tools

| Tool | Path | Data Source |
|---|---|---|
| Unified Dashboard | `/` | All providers (mock fallback) |
| IP Reputation | `/tools/ip-lookup` | AbuseIPDB |
| Domain Reputation | `/tools/domain-lookup` | VirusTotal |
| DNS Lookup | `/tools/dns-lookup` | SecurityTrails |
| SSL Certificate | `/tools/ssl-checker` | SSL Labs (public API, no key) |
| Security Headers | `/tools/security-headers` | Live HEAD request (no key) |
| Blacklist Check | `/tools/blacklist` | HetrixTools |
| WHOIS / Registrar | `/tools/whois` | IANA RDAP (public, no key) |
| URL Analysis | `/tools/url-analysis` | VirusTotal |
| Settings | `/settings` | — |

---

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, Turbopack, server-side API routes
- [TypeScript](https://www.typescriptlang.org/) — strict mode
- [Tailwind CSS v4](https://tailwindcss.com/) — `@tailwindcss/postcss`
- No Linux-only dependencies — fully cross-platform

---

## Quick Start

```bash
# Requires Node.js 20+
node -v   # should print v20+

git clone https://github.com/philr029/cyber-tools.git
cd cyber-tools
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables (optional)

Copy `.env.example` to `.env.local` and add any API keys you have:

```bash
cp .env.example .env.local
```

| Variable | Provider | Used by |
|---|---|---|
| `ABUSEIPDB_API_KEY` | [AbuseIPDB](https://www.abuseipdb.com/register) — free: 1,000/day | IP Reputation |
| `VIRUSTOTAL_API_KEY` | [VirusTotal](https://www.virustotal.com/gui/join-us) — free: 500/day | Domain + URL Analysis |
| `HETRIXTOOLS_API_KEY` | [HetrixTools](https://hetrixtools.com/dashboard/api-token/) — free tier | Blacklist Check |
| `SECURITYTRAILS_API_KEY` | [SecurityTrails](https://securitytrails.com/corp/api) — free: 50/month | DNS Lookup |
| `SHODAN_API_KEY` | [Shodan](https://account.shodan.io/register) — membership required | Open Ports (dashboard) |

> **No key needed for:** WHOIS (IANA RDAP), Security Headers (live HEAD request), SSL (SSL Labs public API).

After adding keys, restart the dev server: `npm run dev`

---

## Project Structure

```
app/
  api/lookup/          # Server-side API routes — keys never reach the client
    ip/route.ts
    domain/route.ts
    dns/route.ts
    ssl/route.ts
    headers/route.ts
    blacklist/route.ts
    whois/route.ts
    url/route.ts
  tools/               # Individual tool pages (each with ToolInput + result card)
    ip-lookup/
    domain-lookup/
    dns-lookup/
    ssl-checker/
    security-headers/
    blacklist/
    whois/
    url-analysis/
  settings/            # API key configuration guide
  components/
    results/           # Result display cards (one per data type)
    tools/             # ToolPageLayout + ToolInput shared components
    ui/                # Generic UI primitives (Card, StatusBadge, etc.)
  layout.tsx
  page.tsx             # Unified dashboard with search + results grid
  globals.css
lib/
  providers/           # API adapter modules (server-only)
    abuseipdb.ts
    virustotal.ts
    securitytrails.ts
    sslcheck.ts
    securityheaders.ts
    hetrixtools.ts
    shodan.ts
    whois.ts
  validators/          # Input validation (shared client/server)
  ssrf.ts              # SSRF guard for server-side fetch calls
  types.ts             # TypeScript interfaces
  mockData.ts          # Mock data + localStorage lookup history
  mockExtras.ts        # WHOIS + URL Analysis mock data
```

---

## Mock vs Live Data

Each tool page shows a **"Mock Data"** or **"Live Data"** badge.

| Condition | Result |
|---|---|
| API key not set | Mock data (pre-defined sample results) |
| API key set, call succeeds | Live data |
| API key set, call fails | Mock data fallback — no crash |

Three preset mock queries are available everywhere: `8.8.8.8` (Safe), `example.com` (Warning), `malicious-test.xyz` (Risk).

---

## Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server (after build)
npm run lint     # Run ESLint
```

---

## Deployment

### Vercel (recommended)

This app uses server-side API routes, so a static export is **not** suitable.

```bash
npm i -g vercel
vercel
```

Add environment variables in **Vercel → Project → Settings → Environment Variables**.

### Self-hosted

```bash
npm run build
npm run start
```

---

## Troubleshooting

### `next: not found` after cloning

```bash
npm install
npm run dev
```

### `lightningcss` errors on macOS

Tailwind v4 uses `lightningcss` native binaries, installed automatically as optional deps.

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use

```bash
npm run dev -- -p 3001
```

### Node version issues

Use Node.js 20 or later ([nvm](https://github.com/nvm-sh/nvm)):

```bash
nvm install 20 && nvm use 20
```

---

## Licence

MIT




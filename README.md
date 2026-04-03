# SecureScope – Cyber Intelligence Dashboard

A clean, modern cybersecurity toolkit built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**. Designed for macOS Apple Silicon and deployable to Vercel.

---

## Features

| Tool | Path | Data Source |
|---|---|---|
| Unified Dashboard | `/` | Mock / All providers |
| IP Reputation | `/tools/ip-lookup` | AbuseIPDB |
| Domain Reputation | `/tools/domain-lookup` | VirusTotal |
| DNS Lookup | `/tools/dns-lookup` | SecurityTrails |
| SSL Certificate | `/tools/ssl-checker` | SSL Labs (public API) |
| Security Headers | `/tools/security-headers` | Live HEAD request |
| Blacklist Check | `/tools/blacklist` | HetrixTools |
| WHOIS / Registrar | `/tools/whois` | IANA RDAP (free) |
| URL Analysis | `/tools/url-analysis` | VirusTotal |
| Settings | `/settings` | — |

**All tools fall back to mock data automatically when no API key is configured** — no errors, just sample results clearly labelled "Mock Data".

---

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, Turbopack, server-side API routes
- [TypeScript](https://www.typescriptlang.org/) — strict mode
- [Tailwind CSS v4](https://tailwindcss.com/) — `@tailwindcss/postcss`
- No Linux-only dependencies — fully cross-platform

---

## macOS Apple Silicon – Install & Run

```bash
# Requires Node.js 20+ (install via https://nodejs.org or nvm)
node -v   # should show v20+

# Clone and install
git clone https://github.com/your-username/cyber-tools.git
cd cyber-tools
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

| Variable | Provider | Required for |
|---|---|---|
| `ABUSEIPDB_API_KEY` | [AbuseIPDB](https://www.abuseipdb.com/register) | IP Reputation (live) |
| `VIRUSTOTAL_API_KEY` | [VirusTotal](https://www.virustotal.com/gui/join-us) | Domain + URL Analysis (live) |
| `HETRIXTOOLS_API_KEY` | [HetrixTools](https://hetrixtools.com/dashboard/api-token/) | Blacklist Check (live) |
| `SECURITYTRAILS_API_KEY` | [SecurityTrails](https://securitytrails.com/corp/api) | DNS Lookup (live) |
| `SHODAN_API_KEY` | [Shodan](https://account.shodan.io/register) | Open Ports (live) |

> **No keys needed for:** WHOIS (uses IANA RDAP), Security Headers (live HEAD request), SSL (uses SSL Labs public API).

After adding keys, restart the dev server: `npm run dev`

---

## Project Structure

```
app/
  api/lookup/          # Server-side API routes (never expose keys to client)
    ip/route.ts
    domain/route.ts
    dns/route.ts
    ssl/route.ts
    headers/route.ts
    blacklist/route.ts
    whois/route.ts
    url/route.ts
  tools/               # Individual tool pages
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
    results/           # Result display cards
    tools/             # Shared tool page layout + input
    ui/                # Generic UI primitives
  layout.tsx
  page.tsx             # Unified dashboard homepage
  globals.css
lib/
  providers/           # API adapter modules (server-only)
  validators/          # Input validation (shared client/server)
  types.ts             # TypeScript interfaces
  mockData.ts          # Mock data + localStorage history
  mockExtras.ts        # WHOIS + URL Analysis mock data
```

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

This app uses server-side API routes, so a static export is **not** suitable. Deploy to [Vercel](https://vercel.com):

```bash
npm i -g vercel
vercel
```

Add your environment variables in the Vercel project settings under **Settings → Environment Variables**.

### Self-hosted

```bash
npm run build
npm run start    # Runs on port 3000
```

---

## Mock vs Live Data

Each tool page shows a **"Mock Data"** or **"Live Data"** badge in the top-right corner.

| Condition | Result |
|---|---|
| API key not set | Mock data (pre-defined sample results) |
| API key set, call succeeds | Live data |
| API key set, call fails | Mock data fallback (no crash) |

The mock data includes three preset queries: `8.8.8.8` (Safe), `example.com` (Warning), `malicious-test.xyz` (Risk).

---

## Troubleshooting (macOS)

### `npm install` fails or `lightningcss` errors

Tailwind v4 uses `lightningcss` which requires native binaries. These are installed automatically as optional dependencies.

```bash
# If you see lightningcss errors, try:
rm -rf node_modules package-lock.json
npm install
```

### `next: not found` after install

```bash
# Make sure node_modules is populated:
npm install
# Then run dev:
npm run dev
```

### Port 3000 already in use

```bash
npm run dev -- -p 3001
```

### Node version issues

Use Node.js 20 or later. Install via [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 20
nvm use 20
```

---

## Screenshots

> _Add screenshots here once the app is running_

---

## Licence

MIT



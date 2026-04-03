# SecureScope – Cyber Intelligence Dashboard

A polished, Apple-inspired cybersecurity toolkit built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**.

Every tool works immediately with pre-labelled **mock data**. Add API keys to switch to live results — no restart required, no code changes needed.

**Live demo → [https://philr029.github.io/cyber-tools/](https://philr029.github.io/cyber-tools/)**  
*(Mock data only — server-side API features require Vercel; see [Deployment](#deployment) below.)*

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

- **[Next.js 16](https://nextjs.org/)** — App Router, Turbopack, server-side API routes
- **[TypeScript](https://www.typescriptlang.org/)** — strict mode throughout
- **[Tailwind CSS v4](https://tailwindcss.com/)** — `@tailwindcss/postcss`, no config file needed
- Zero Linux-only dependencies — fully cross-platform (macOS Apple Silicon ✓)

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
    ip/  domain/  dns/  ssl/  headers/  blacklist/  whois/  url/
  tools/               # Individual tool pages (each with ToolInput + result card)
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
  validators/          # Input validation (shared client/server)
  lookup-client.ts     # Unified client: mock or API-backed depending on build mode
  ssrf.ts              # SSRF guard for server-side fetch calls
  types.ts             # TypeScript interfaces
  mockData.ts          # Mock data + localStorage lookup history
  mockExtras.ts        # WHOIS + URL Analysis mock data
.github/workflows/
  deploy.yml           # GitHub Actions → GitHub Pages (static export, mock data)
```

---

## Mock vs Live Data

Each tool page shows a **"Mock Data"** or **"Live Data"** badge in the top-right corner.

| Condition | Result |
|---|---|
| API key not set | Mock data (pre-defined sample results, clearly labelled) |
| API key set, call succeeds | Live data |
| API key set, call fails | Mock data fallback — no crash |
| GitHub Pages deployment | Always mock (no server available) |

Three preset queries demonstrate all status levels: `8.8.8.8` (Safe ✅), `example.com` (Warning ⚠️), `malicious-test.xyz` (Risk 🔴).

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

### GitHub Pages (demo / static)

The repository ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on every push to `main`.

**How it works:**
1. API routes (`app/api/`) are excluded before the static build — they require a server that GitHub Pages can't provide.
2. `NEXT_PUBLIC_USE_MOCK_API=true` tells `lib/lookup-client.ts` to return mock data in the browser instead of calling `/api/*` routes.
3. `NEXT_STATIC_EXPORT=true` adds `output: "export"` and `basePath: "/cyber-tools"` to the Next.js config.
4. The resulting `out/` directory is deployed to the `github-pages` environment.

**Set up GitHub Pages for your fork:**
1. Go to **Settings → Pages → Source** and choose **GitHub Actions**.
2. Push to `main` — the workflow runs automatically.

> ⚠️ **Limitation:** GitHub Pages is static hosting only. Real API integrations (AbuseIPDB, VirusTotal, etc.) are **not** available on GitHub Pages because they require server-side execution to keep API keys secret.

---

### Vercel (recommended for live data)

Vercel is the correct host when you want real API integrations. It runs the Next.js server natively, so all `/api/lookup/*` routes work and API keys stay server-side.

```bash
npm i -g vercel
vercel
```

Add environment variables in **Vercel → Project → Settings → Environment Variables**.

No config changes are needed — `next.config.ts` automatically omits the static-export settings when `NEXT_STATIC_EXPORT` is not set.

---

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

Tailwind v4 uses `lightningcss` native binaries installed as optional deps.

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

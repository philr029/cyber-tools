# SecureScope – Cyber Intelligence Dashboard

A polished, Apple-inspired cybersecurity toolkit built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**.

Every tool works immediately — add API keys to get live results. Tools without a configured key show a **"Not configured"** badge and return safe default values.

**Deployment target: [Vercel](https://vercel.com)** — server-side API routes run as serverless functions. API keys stay on the server and are never exposed to the browser.

---

## Tools

| Tool | Path | Data Source |
|---|---|---|
| Unified Dashboard | `/` | All providers |
| IP Reputation | `/tools/ip-lookup` | AbuseIPDB |
| Domain Reputation | `/tools/domain-lookup` | VirusTotal |
| DNS Lookup | `/tools/dns-lookup` | SecurityTrails |
| SSL Certificate | `/tools/ssl-checker` | SSL Labs (public API, no key) |
| Security Headers | `/tools/security-headers` | Live HEAD request (no key) |
| Blacklist Check | `/tools/blacklist` | MxToolbox |
| WHOIS / Registrar | `/tools/whois` | IANA RDAP (public, no key) |
| URL Analysis | `/tools/url-analysis` | VirusTotal |
| Phone Test (API) | `/api/tools/phone-test` | Twilio Voice |
| Settings | `/settings` | — |

---

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** — App Router, Turbopack, server-side API routes
- **[TypeScript](https://www.typescriptlang.org/)** — strict mode throughout
- **[Tailwind CSS v4](https://tailwindcss.com/)** — `@tailwindcss/postcss`, no config file needed
- Zero platform-specific dependencies — fully cross-platform (Windows 10/11 ✓, macOS Apple Silicon ✓, Linux ✓)

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

All `npm` scripts work in Command Prompt, PowerShell, and VS Code Terminal on Windows with no extra tooling.

### Windows 10 / 11

If you see an error about a missing native module (e.g., `lightningcss-win32-x64-msvc`) after `npm run dev`, you likely have stale `node_modules` built on a different platform. Run a clean install:

**Command Prompt:**
```cmd
rmdir /s /q node_modules
npm install
npm run dev
```

**PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

**Why it happens:** Tailwind v4, Next.js, and ESLint ship platform-specific native binaries (lightningcss, @next/swc, @tailwindcss/oxide) as optional npm packages. The repo's `.npmrc` sets `workspaces=false` and `include=optional` so that `npm install` on any platform always fetches the correct binaries. The issue only surfaces when `node_modules` from another OS is reused (e.g., after copying the project from macOS/Linux).

**Workspace root confusion warning:** If npm warns about a `package-lock.json` in a parent directory (e.g., `C:\Users\<name>\`), delete that stray file and re-run `npm install` in the project directory.

### macOS Apple Silicon (M1 / M2 / M3 / M4)

If you see `Cannot find module '../lightningcss.darwin-arm64.node'` in the browser after `npm run dev`, you have stale `node_modules` built on a different platform (e.g., Docker / Linux). Run a clean install:

```bash
rm -rf node_modules
npm install   # installs the darwin-arm64 native binaries
npm run dev
```

**Workspace root confusion warning:** If npm warns about a `package-lock.json` in a parent directory (e.g., `/Users/<name>/`), delete that stray file:

```bash
# Only do this if you never intentionally ran npm install in your home directory
rm ~/package-lock.json
rm -rf ~/node_modules   # optional but recommended
```

Then run `npm install` in the project directory again.

---

## Environment Variables

Create a `.env.local` file in the project root for local development:

**macOS / Linux:**
```bash
cp .env.example .env.local   # or create it manually
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env.local
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

| Variable | Provider | Used by |
|---|---|---|
| `SESSION_SECRET` | Generate with `openssl rand -hex 32` | JWT session signing — **required in production** |
| `PASSWORD_PEPPER` | Generate with `openssl rand -hex 16` | Password hashing pepper — set before first user |
| `NEXT_PUBLIC_STRIPE_PRO_LINK` | [Stripe Payment Links](https://dashboard.stripe.com/payment-links) | Pricing page "Upgrade to Pro" button |
| `ABUSEIPDB_API_KEY` | [AbuseIPDB](https://www.abuseipdb.com/register) — free: 1,000/day | IP Reputation |
| `VIRUSTOTAL_API_KEY` | [VirusTotal](https://www.virustotal.com/gui/join-us) — free: 500/day | Domain + URL Analysis |
| `MX_TOOLBOX_API_KEY` | [MxToolbox](https://mxtoolbox.com/Public/ToolsApi.aspx) — API key required | Blacklist Check |
| `SECURITYTRAILS_API_KEY` | [SecurityTrails](https://securitytrails.com/corp/api) — free: 50/month | DNS Lookup |
| `SHODAN_API_KEY` | [Shodan](https://account.shodan.io/register) — membership required | Open Ports (dashboard) |
| `TWILIO_ACCOUNT_SID` | [Twilio Console](https://console.twilio.com/) | Phone Test API (`/api/tools/phone-test`) |
| `TWILIO_AUTH_TOKEN` | [Twilio Console](https://console.twilio.com/) | Phone Test API (`/api/tools/phone-test`) |
| `TWILIO_FROM_NUMBER` | Twilio purchased/verified number in E.164 (e.g. `+15551234567`) | Phone Test API (`/api/tools/phone-test`) |

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
  lookup-client.ts     # Unified client — always calls /api/lookup/* server routes
  ssrf.ts              # SSRF guard for server-side fetch calls
  types.ts             # TypeScript interfaces
  mockData.ts          # Default fallback data + localStorage lookup history
  mockExtras.ts        # WHOIS + URL Analysis default data
.github/workflows/
  deploy.yml           # CI workflow — lint + build check on every push/PR
vercel.json            # Vercel project config
```

---

## Live vs Not Configured

Each tool page shows a status badge in the top-right corner after a lookup:

| Condition | Badge |
|---|---|
| API key set, call succeeds | **Live Data** (green) |
| API key not set | **Not configured** (grey) — shows safe default values |
| API key set, call fails | Error message shown inline |
| No lookup performed yet | No badge |

WHOIS, Security Headers, and SSL Certificate always return live data (no key required).

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

Vercel runs Next.js natively — API routes become serverless functions and API keys stay on the server.

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in **Vercel → Project → Settings → Environment Variables**
4. Deploy — every push to `main` redeploys automatically

```bash
# Or deploy from the CLI:
npm i -g vercel
vercel
```

**Required environment variables (add in Vercel dashboard):**

| Variable | Required | Where to get it |
|---|---|---|
| `SESSION_SECRET` | **Yes** | `openssl rand -hex 32` |
| `PASSWORD_PEPPER` | Recommended | `openssl rand -hex 16` |
| `NEXT_PUBLIC_STRIPE_PRO_LINK` | For payments | [dashboard.stripe.com/payment-links](https://dashboard.stripe.com/payment-links) |
| `ABUSEIPDB_API_KEY` | Optional | https://www.abuseipdb.com/register |
| `VIRUSTOTAL_API_KEY` | Optional | https://www.virustotal.com/gui/join-us |
| `MX_TOOLBOX_API_KEY` | Optional | https://mxtoolbox.com/Public/ToolsApi.aspx |
| `SECURITYTRAILS_API_KEY` | Optional | https://securitytrails.com/corp/api |
| `SHODAN_API_KEY` | Optional | https://account.shodan.io/register |
| `TWILIO_ACCOUNT_SID` | For phone test API | https://console.twilio.com/ |
| `TWILIO_AUTH_TOKEN` | For phone test API | https://console.twilio.com/ |
| `TWILIO_FROM_NUMBER` | For phone test API | Twilio Voice number in E.164 format |

All threat intelligence keys are optional — tools without a key show a **Not configured** badge instead of an error.

---

### Enabling Stripe payments

1. Create a **Payment Link** in the [Stripe dashboard](https://dashboard.stripe.com/payment-links) for your Pro plan ($19/month)
2. Copy the link URL (e.g. `https://buy.stripe.com/…`)
3. Set `NEXT_PUBLIC_STRIPE_PRO_LINK` to that URL in Vercel → Settings → Environment Variables
4. Redeploy — the pricing page "Upgrade to Pro" button becomes a live checkout link

No backend webhook is required for the MVP. Users who complete checkout can be manually upgraded; a future webhook can automate this (see Backend Roadmap below).

---

### Self-hosted

```bash
npm run build
npm run start
```

Set API keys as environment variables before running.

---

## Troubleshooting

### `next: not found` after cloning

```bash
npm install
npm run dev
```

### `lightningcss` or native module errors

Tailwind v4 uses `lightningcss` native binaries installed as optional deps. Delete `node_modules` and reinstall for your current platform.

**macOS / Linux:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Windows (Command Prompt):**
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Port 3000 already in use

```bash
npm run dev -- -p 3001
```

### Node version issues

Use Node.js 20 or later.

**macOS / Linux** ([nvm](https://github.com/nvm-sh/nvm)):
```bash
nvm install 20 && nvm use 20
```

**Windows** ([nvm-windows](https://github.com/coreybutler/nvm-windows) or [fnm](https://github.com/Schniz/fnm)):
```powershell
# nvm-windows
nvm install 20
nvm use 20

# or fnm (works in PowerShell and Command Prompt)
fnm install 20
fnm use 20
```

---

## Backend Roadmap

The current MVP uses an in-memory user store and localStorage for scan history. Here is the upgrade path to a production backend:

### Phase 1 — Persistent database (Supabase / Postgres)

| Current (MVP) | Production |
|---|---|
| `lib/users.ts` — in-memory `Map` | Supabase `users` table + Prisma ORM |
| localStorage scan history | `scans` table keyed by `user_id` |
| localStorage saved scans | `saved_scans` table |
| No usage tracking server-side | `daily_usage` table with RLS |

Steps:
1. Create a Supabase project and copy the `DATABASE_URL` + `SUPABASE_KEY` env vars
2. Add Prisma (`npm install prisma @prisma/client`) and define `User`, `Scan`, `SavedScan` models
3. Replace `getUserByEmail` / `createUser` in `lib/users.ts` with Prisma queries
4. Replace `loadHistory` / `saveToHistory` in `lib/mockData.ts` with API calls to new `/api/history` routes

### Phase 2 — Stripe webhooks (automated plan upgrades)

1. Add a Stripe webhook endpoint at `app/api/webhooks/stripe/route.ts`
2. Listen for `checkout.session.completed` → update `user.plan = "pro"` in the database
3. Listen for `customer.subscription.deleted` → downgrade back to `"free"`
4. Add `STRIPE_WEBHOOK_SECRET` env var (from Stripe dashboard → Webhooks)

### Phase 3 — Real API integrations

| Tool | Current | Real integration |
|---|---|---|
| IP Reputation | AbuseIPDB (already live) | Keep + add MaxMind GeoIP |
| Domain Reputation | VirusTotal (already live) | Keep + add Shodan |
| Port Scanner | Mock data | Shodan `host` endpoint |
| Subdomains | Mock data | SecurityTrails + crt.sh |
| Phone Lookup | Mock data | Twilio Lookup |
| Lead Intelligence | Mock data | Hunter.io / Apollo |

### Phase 4 — Asset monitoring

1. Store monitored domains/IPs in a `monitored_assets` table
2. Use a Vercel Cron Job (`vercel.json` → `crons`) to re-scan assets daily
3. Persist results and diff against previous scan to detect changes
4. Send email alerts via Resend/SendGrid when blacklist status or SSL expiry changes

---

## Vercel deployment checklist

After `npm run build` succeeds locally:

1. **Framework preset** — Vercel should auto-detect Next.js. Build command: `npm run build`; output: `.next`.
2. **Linux paths** — All `app/` routes and imports use **lowercase** paths. Avoid renaming files with casual casing; macOS may hide issues that break on Vercel.
3. **Middleware** — `proxy.ts` gates `/dashboard/*`. Confirm session cookies work on your production domain (SameSite / secure flags).
4. **Environment variables** — Copy from `.env.example`. Keep API secrets **server-only** (no `NEXT_PUBLIC_` prefix unless intentionally public).
5. **Navigation** — Desktop mega menu appears from the `lg` breakpoint (1024px). Below that width, use the hamburger drawer and command palette search (**⌘/Ctrl + K**).
6. **Static assets** — Files in `public/` are served from the site root; reference as `/path/to/asset`.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| 404 on a tool that works locally | Case mismatch in `href` vs folder name on disk; check git on Linux. |
| Mega menu flashes or closes | Coarse pointer / touch hybrid — use click/tap to pin open; hover timing is relaxed for fine pointers. |
| Mobile drawer behind FAB | Drawer renders in a portal with `z-[72]` above the chat FAB (`z-50`). |
| Search empty for new page | Add keywords in `lib/data/searchIndex.ts` or extend the site catalog entry. |

---

## Licence

MIT

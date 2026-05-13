# Deploy checklist (Vercel & subpath hosts)

Use this before every production deploy.

## Build (local or CI)

1. **Node 20+** — `node -v`
2. **Install** — `npm ci`
3. **Lint** — `npm run lint` (optional if you only accept clean lint on main)
4. **Production build** — `npm run build`
5. **Smoke run** — `npm run start`, open `http://localhost:3000`, hit `/`, `/tools/browse`, `/search`, `/login`, one dashboard route after sign-in

## Vercel (recommended)

1. **Framework** — Next.js; root directory = repo root; build = `npm run build`; output handled by Vercel.
2. **Environment variables**
   - **Public:** `NEXT_PUBLIC_BASE_PATH` — leave **empty** for `https://your-domain.com/`. Set to `/repo-name` only if the app is served under a subpath (unusual on Vercel custom domains).
   - **Public:** `NEXT_PUBLIC_SITE_URL` — canonical site URL, e.g. `https://www.example.com` (no trailing slash). Improves `metadataBase` and share copy when `VERCEL_URL` is not your marketing domain.
   - **Server-only:** API keys and secrets (VirusTotal, Twilio, session secrets, etc.) — never prefix with `NEXT_PUBLIC_`.
3. **Direct URL test** — After deploy, open several deep links in a **new tab** (no client prefetch): e.g. `/tools/ssl-checker`, `/dashboard/history`, `/resources/documentation`.
4. **Auth** — Confirm `/dashboard/*` redirects to `/login` when logged out, and post-login redirect stays **internal** (query `redirect` must be a path, not `https://…`).

## GitHub Pages / static subpath

This app is a **full Next.js server app** (SSR + `app/api/*`). **GitHub Pages alone cannot run it** unless you add a separate **`output: 'export'`** static export (no API routes as you know them today).

If you host a **static export** under `https://user.github.io/repo/`:

1. Set **`NEXT_PUBLIC_BASE_PATH=/repo`** in the build environment (must match the folder name, no trailing slash).
2. Ensure **`next.config.ts`** `basePath` stays driven by that env (already wired).
3. Re-test every **`fetch(withBasePath('/api/…'))`** path — static export has **no** serverless API unless you host APIs elsewhere.

## Case sensitivity (Linux / Vercel build)

- Imports must match file paths **exactly** (`@/app/components/...` vs wrong casing). CI build catches missing modules.

## Quick regression targets

- [ ] Home lookup + “Share” copy URL includes subpath when `NEXT_PUBLIC_BASE_PATH` is set  
- [ ] Dashboard “advanced tools” **worker** loads (`/workers/advanced-tools-worker.js` under subpath)  
- [ ] Sign-in, sign-out, session cookie on your real domain  
- [ ] Monitoring hub fetches (`/api/monitoring/*`) return 200 on Vercel  

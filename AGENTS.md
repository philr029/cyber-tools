<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Service overview

SecureScope is a single self-contained Next.js 16 application (no database, no Docker, no external services required). All security tools gracefully degrade to mock/default data when API keys are not configured.

### Running the app

- `npm run dev` — starts the dev server on port 3000 (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint 9 (pre-existing lint errors exist in the codebase; do not fix them unless asked)

### Key notes

- **Node.js 20+** is required (environment has v22).
- **Package manager**: npm (lockfile: `package-lock.json`). Do not use pnpm or yarn.
- **Supabase project** — create a project at [supabase.com](https://supabase.com), run SQL in `supabase/migrations/`, and set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (see `.env.example`). Auth is optional for local tool browsing but required for dashboard sessions.
- **No service role key in the browser** — only the anon key is prefixed with `NEXT_PUBLIC_`. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only if you add privileged automation later.
- The app uses **Next.js 16.2.3** with App Router. Consult `node_modules/next/dist/docs/` for API reference as this version has breaking changes from earlier Next.js versions.
- **No automated test suite** exists (`npm test` is not configured). Validate changes via lint, build, and manual API/UI testing.
- **Middleware** (`proxy.ts`) gates `/dashboard/*` routes behind authentication.

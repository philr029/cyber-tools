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
- **No `.env.local` required** to start — all tools return mock data without API keys. The auth system uses a hardcoded dev fallback for `SESSION_SECRET` and `PASSWORD_PEPPER`.
- **In-memory user store** — user data resets on server restart. Register a new user via `POST /api/auth/signup` after each restart if needed.
- The app uses **Next.js 16.2.3** with App Router. Consult `node_modules/next/dist/docs/` for API reference as this version has breaking changes from earlier Next.js versions.
- **No automated test suite** exists (`npm test` is not configured). Validate changes via lint, build, and manual API/UI testing.
- **Middleware** (`proxy.ts`) gates `/dashboard/*` routes behind authentication.

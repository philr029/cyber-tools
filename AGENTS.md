<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Architecture

SecureScope is a single Next.js 16 app (App Router + Turbopack). No database, no Docker, no separate backend. API routes in `app/api/` serve as the backend. Auth uses in-memory user store (`lib/users.ts`). External API keys are all optional — tools gracefully degrade to mock data without them.

### Running the app

See `README.md` Quick Start. Standard commands:

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` (eslint) |
| Build | `npm run build` |

### Known issues

- **CSP blocks client-side hydration**: The `script-src 'self' 'unsafe-eval'` in `next.config.ts` blocks the inline `<script>` tags Next.js 16 generates for React Server Components flight data. This prevents client-side interactivity in the browser. API routes work correctly when called directly (e.g. via `curl` or `fetch()` from DevTools console). This is a pre-existing code issue, not an environment problem.
- **ESLint has pre-existing errors**: `npm run lint` exits with code 1 due to React hooks purity warnings and unused variables in `app/dashboard/monitoring/page.tsx`, `app/dashboard/cases/page.tsx`, `app/components/tools/ReviewTargetModal.tsx`, and `lib/use-activity-console.ts`.
- **Cross-origin dev access**: For the cloud agent proxy to work, `allowedDevOrigins: ["*.agent.cvm.dev"]` has been added to `next.config.ts`.

### Testing API routes

Since browser interactivity is broken by the CSP issue, test API routes directly:

```bash
# WHOIS (live, no API key needed)
curl -s "http://localhost:3000/api/lookup/whois?domain=example.com"

# Security Headers (live, no API key needed)
curl -s "http://localhost:3000/api/lookup/headers?domain=example.com"

# Signup
curl -s http://localhost:3000/api/auth/signup -X POST -H "Content-Type: application/json" -d '{"name":"Test","email":"t@t.com","password":"Pass123!"}'
```

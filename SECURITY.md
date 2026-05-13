# Security guide — SecureScope

This document complements the in-app **Security checklist** at the `/security` route. It is aimed at operators and developers self-hosting or deploying to Vercel.

## 1. Environment variables and API keys

- **Server-only:** All third-party API keys (`GEMINI_API_KEY`, `VIRUSTOTAL_API_KEY`, `ABUSEIPDB_API_KEY`, Twilio secrets, etc.) must be set in the server environment (for example Vercel → Settings → Environment Variables) and read only from `app/api/**`, Server Actions, or `server-only` modules under `lib/`.
- **Never use `NEXT_PUBLIC_` for secrets.** The `NEXT_PUBLIC_` prefix embeds values in the browser JavaScript bundle.
- **Safe `NEXT_PUBLIC_` uses in this repo:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_STRIPE_PRO_LINK`, **`NEXT_PUBLIC_SUPABASE_URL`**, **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**, **`NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID`** (Cookiebot domain group ID — public), and optionally **`NEXT_PUBLIC_GA_MEASUREMENT_ID`** (GA4 only loads after statistics consent).
- Copy [`.env.example`](./.env.example) to `.env.local` for local development. Do not commit `.env.local`.

### MXToolbox variable names

Some routes use `MX_TOOLBOX_API_KEY`. The monitoring hub client also accepts `MXTOOLBOX_API_KEY` as an alias (see `lib/monitoring-hub/mxtoolbox-client.ts`). Prefer **`MX_TOOLBOX_API_KEY`** everywhere for consistency.

## 2. HTTPS and Strict-Transport-Security (HSTS)

- **Vercel and most managed hosts** terminate TLS and serve the app over HTTPS by default.
- **HSTS** is sent in production via `next.config.ts` (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`). It is omitted in local development to avoid breaking plain-HTTP testing.
- **Self-hosted HTTP-only** deployments should not send HSTS until a stable HTTPS URL is in place; misconfigured HSTS can lock users out.

## 3. Security headers (baseline)

`next.config.ts` applies global response headers for HTML and API responses routed through Next:

| Header | Role |
|--------|------|
| `X-Content-Type-Options: nosniff` | Reduces MIME sniffing |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limits referrer leakage on cross-origin navigations |
| `Permissions-Policy` | Disables camera, geolocation, microphone, USB by default |
| `X-Frame-Options: DENY` | Legacy clickjacking mitigation (complements CSP `frame-ancestors`) |
| `Cross-Origin-Opener-Policy: same-origin` | Isolates browsing context |
| `Cross-Origin-Resource-Policy: same-origin` | Default same-origin resource policy |
| `Strict-Transport-Security` | Production only (see above) |

## 4. Content Security Policy (CSP) and `proxy.ts`

- The repository includes **`proxy.ts`**, which builds a **nonce-based CSP** and can gate `/dashboard` behind a session cookie. If your Next.js version wires this file as **middleware**, treat it as the authoritative CSP for document requests and align `next.config.ts` headers to avoid duplicate or conflicting CSP values (only one CSP should win per response).
- If `proxy.ts` is **not** wired as middleware in your branch, **`next.config.ts` headers are the active baseline**; consider adding a CSP there or enabling middleware when you need nonces for inline scripts.
- CSP directives in `proxy.ts` include: `default-src 'self'`, strict `script-src` with nonce + `'strict-dynamic'`, `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`, and `frame-src` allowances for embedded maps where applicable.
- **Cookiebot** (`consent.cookiebot.com`, `consentcdn.cookiebot.com`) is allowlisted for script, connect, image, and frame sources so the CMP banner, declaration iframe, and automatic blocking can run. Optional **Google Analytics / gtag** hosts are allowlisted so statistics scripts can load **only after** the app injects them post-consent (`components/consent/ConsentAwareAnalytics.tsx`).

## 4b. Cookiebot CMP (consent)

- **Where to put the ID:** set `NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID` in `.env.local` / Vercel (same value as Cookiebot’s Domain Group ID). The main script is in `app/layout.tsx` with `data-blockingmode="auto"`.
- **Script categories (maintenance guide):**
  | Category | Examples in this repo |
  |----------|------------------------|
  | **Strictly necessary** | Supabase Auth session cookies, security-related requests, Cookiebot’s own consent storage |
  | **Preferences** | Optional UI personalisation you might add later — mark with `data-cookieconsent="preferences"` if you inject third-party scripts |
  | **Statistics** | Google Analytics / GA4 when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set — loaded only if `Cookiebot.consent.statistics` is true |
  | **Marketing** | Ads / remarketing pixels — do **not** load from React until `Cookiebot.consent.marketing` is true; prefer `type="text/plain"` + `data-cookieconsent="marketing"` for raw HTML embeds |
- **Testing:** use a fresh private window — confirm the banner appears, **Reject all** prevents gtag from loading (Network tab), **Accept** (with statistics on) allows GA when configured, footer **Cookie Settings** reopens the dialog (`Cookiebot.renew()`), and `/cookies` shows the declaration when the ID is set.
- **Rescan:** after each production deploy, run Cookiebot’s **site rescan** so new first- or third-party cookies are classified.

## 5. Client-side encryption (optional)

The app offers **optional client-side encryption** for scan history stored in `localStorage` (AES-GCM with keys derived via PBKDF2 from a user passphrase). This is **not** full end-to-end encryption of the site: anything that runs in the page can be abused if the machine is compromised (for example XSS or malware). See `lib/security/client-crypto.ts` and `lib/security/vault.ts` for limitations and threat model notes.

## 6. API routes — abuse protection and rate limiting

Recommendations for production:

1. **Rate limiting** — Per IP and/or per user for expensive routes (`/api/chat`, `/api/ai`, lookup routes). Options: Vercel Firewall, Upstash Redis + sliding window, or Edge middleware with a shared store.
2. **Body size limits** — Keep strict max lengths on chat messages and tool inputs (already partially enforced; extend per route).
3. **Cron and webhooks** — Protect scheduled jobs with a shared secret (`CRON_SECRET` pattern in `app/api/check-blacklist/route.ts`); verify signatures for third-party webhooks if you add them.
4. **Error responses** — Return generic messages to clients in production; log detailed errors only server-side.
5. **Bot traffic** — Use Turnstile, reCAPTCHA, or Vercel Bot Protection on anonymous high-abuse endpoints if needed.

## 7. Session cookies (Supabase Auth)

Sessions are issued by **Supabase Auth** and stored in **HttpOnly** cookies via `@supabase/ssr`. The browser only receives the **anon** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). **Do not** embed `SUPABASE_SERVICE_ROLE_KEY` in client bundles or `NEXT_PUBLIC_*` variables.

## 8. Application authentication & RBAC

- **Framework:** Supabase Auth (email/password, recovery emails) plus **`proxy.ts`** for session refresh, CSP, and route/role checks. `getClaims()` validates the JWT in middleware before reading `public.profiles` for `role` / `disabled`.
- **Passwords:** handled entirely by Supabase — not stored in `localStorage` in this app.
- **Roles:** `admin`, `editor`, `viewer` on `public.profiles` with **RLS** (see `supabase/migrations/`). Middleware mirrors the same rules for UX; **admin APIs** re-check the role server-side.
- **Role changes:** take effect after the next navigation or `router.refresh()` once the profile row updates (cookie session is refreshed by Supabase on its normal cadence).
- **Password reset:** `resetPasswordForEmail` + PKCE callback at `/auth/callback` — add your site URL and redirect URLs in the Supabase Dashboard; configure SMTP for production.

## 9. Audit log (demo)

`lib/auth/audit-log.ts` keeps a bounded in-memory list (admin actions, role changes, etc.). **This is not durable on serverless** — forward events to SIEM, Logflare, or a database for real operations.

## 10. Login brute-force notes

- Prefer **Supabase rate limits**, **CAPTCHA**, or **edge / Redis-backed** throttles on auth endpoints for production.
- Return **generic** invalid-credentials messages where appropriate.

## 11. Hardening Postgres (RLS)

Treat **`anon` and `authenticated`** policies as the source of truth for who can read/write rows. Use the service role key **only** in trusted server jobs (never in `proxy.ts` or client components). Review policies whenever you add tables that contain PII.

## 12. Reporting issues

If you discover a vulnerability, please report it responsibly to the repository maintainer (for example via GitHub Security Advisories or private contact, per repo policy).

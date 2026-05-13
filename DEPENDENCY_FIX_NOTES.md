# Dependency and build fix notes

## What was wrong

- **`eslint-config-next` was pinned to 16.2.2** while **`next` resolves to 16.2.6**. That mismatch can cause subtle ESLint rule / plugin drift versus the framework version you actually run.
- **`vercel.json` set `outputDirectory` to `.next`**. For the Next.js framework preset, Vercel already detects the correct build output. Overriding the output directory is unnecessary and can confuse deployment expectations (the canonical flow is framework auto-detection unless you customize `distDir`).
- **Node version** was documented in `AGENTS.md` but not enforced in `package.json`, so local/CI mismatches were easier to miss.

There were **no duplicate lockfiles** (only `package-lock.json`; no `yarn.lock` or `pnpm-lock.yaml`). The repo is **npm-only**, matching CI (`npm ci`) and Vercel (`installCommand`: `npm ci`).

## What changed

| Area | Change |
|------|--------|
| `package.json` | Bumped `eslint-config-next` to **16.2.6** to match `next@16.2.6`. |
| `package.json` | Added **`engines.node`: `>=20`** for alignment with GitHub Actions (Node 20) and project docs. |
| `vercel.json` | Removed **`outputDirectory`** so Vercel uses default Next.js output handling. |
| `package-lock.json` | Regenerated via `npm install` after the devDependency bump. |

The existing **`overrides`** block that pins **`postcss`** under `next` was left as-is (it was already resolving PostCSS for the Next toolchain).

## How to install, build, and run

Use **npm only** (do not mix yarn/pnpm for this repo).

```bash
cd /path/to/cyber-tools
rm -rf node_modules
npm install
npm run build
npm run dev
```

For CI-parity installs (clean tree from the lockfile only):

```bash
rm -rf node_modules
npm ci
npm run build
```

**Requirements:** Node.js **20+** (see `package.json` → `engines`).

## Vercel

- **Framework:** `nextjs` in `vercel.json` (correct).
- **Install:** `npm ci` (requires a committed `package-lock.json`).
- **Build:** `npm run build` (default Next production build).

Cron entries in `vercel.json` are unchanged.

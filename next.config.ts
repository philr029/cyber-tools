import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(), usb=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  ...(!isDevelopment
    ? [{
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      }]
    : []),
];

// Vercel deployment: standard Next.js server-side rendering.
// API routes in app/api/ run as Vercel serverless functions.
// Environment variables (API keys) are set in the Vercel project dashboard.
// For static hosts under a subpath (e.g. GitHub Pages project sites), set
// `NEXT_PUBLIC_BASE_PATH` (e.g. `/repo-name`). Next.js will mirror it as `basePath`
// so `<Link>`, `router.push`, and static assets resolve consistently. Leave unset
// for root deployments such as Vercel custom domains.
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/$/, "");
const basePath = rawBase.length > 0 ? rawBase : undefined;

const nextConfig: NextConfig = {
  basePath,
  experimental: {
    sri: {
      algorithm: "sha256",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

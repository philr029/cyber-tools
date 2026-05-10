import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";

// Next.js's App Router emits inline <script> tags during SSR to stream
// hydration data (e.g. `self.__next_f.push(...)`), so `script-src` must allow
// inline scripts (via `'unsafe-inline'` or a per-request nonce). Without this
// the browser blocks hydration and the entire UI becomes non-interactive —
// links, dropdown menus, theme toggle, etc. silently stop working.
// Reference: node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
// section "Without Nonces".
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
  "frame-src 'self' https://www.openstreetmap.org",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
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
const nextConfig: NextConfig = {
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

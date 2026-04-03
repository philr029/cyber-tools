import type { NextConfig } from "next";

// When NEXT_STATIC_EXPORT=true (GitHub Pages CI build) the app is compiled as
// a fully-static site.  API routes are excluded by the workflow before the
// build runs, and NEXT_PUBLIC_USE_MOCK_API=true is set so every tool page
// uses mock data directly in the browser.
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: "export",
    basePath: "/cyber-tools",
    // Static export: disable the image optimization server (incompatible)
    images: { unoptimized: true },
  }),
};

export default nextConfig;

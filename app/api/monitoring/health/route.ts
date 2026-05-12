import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    serverless: true,
    /** Present on Vercel deployments */
    vercel: Boolean(process.env.VERCEL),
  });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}

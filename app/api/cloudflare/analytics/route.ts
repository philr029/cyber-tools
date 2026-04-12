/**
 * Cloudflare Zone Analytics
 * GET /api/cloudflare/analytics — returns last-24h traffic and threat data
 *
 * Requires server-side env vars:
 *   CLOUDFLARE_API_TOKEN  — API token with Zone:Read permission
 *   CLOUDFLARE_ZONE_ID    — Zone ID from the Cloudflare dashboard
 */

import { getSession } from "@/lib/session";

const CF_BASE = "https://api.cloudflare.com/client/v4";

function cfHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
    return Response.json(
      { error: "Cloudflare credentials not configured." },
      { status: 503 },
    );
  }

  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const until = new Date();
  const since = new Date(until.getTime() - 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    since: since.toISOString(),
    until: until.toISOString(),
  });

  try {
    const res = await fetch(
      `${CF_BASE}/zones/${zoneId}/analytics/dashboard?${params.toString()}`,
      { headers: cfHeaders() },
    );
    const data = await res.json() as unknown;
    if (!res.ok) {
      console.error("[cloudflare/analytics] GET failed", data);
      return Response.json(
        { error: "Failed to fetch analytics." },
        { status: res.status },
      );
    }
    return Response.json(data);
  } catch (err) {
    console.error("[cloudflare/analytics] GET error", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

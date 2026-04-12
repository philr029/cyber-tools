/**
 * Cloudflare IP Firewall (Access Rules)
 * GET    /api/cloudflare/firewall           — list all blocked IPs
 * POST   /api/cloudflare/firewall           — block an IP  (body: { ip, notes? })
 * DELETE /api/cloudflare/firewall?id=<id>   — unblock / remove a rule by ID
 *
 * Requires server-side env vars:
 *   CLOUDFLARE_API_TOKEN  — API token with Zone:Firewall Services:Edit permission
 *   CLOUDFLARE_ZONE_ID    — Zone ID from the Cloudflare dashboard
 */

import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

const CF_BASE = "https://api.cloudflare.com/client/v4";

function cfHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN ?? ""}`,
    "Content-Type": "application/json",
  };
}

function notConfigured() {
  return Response.json(
    { error: "Cloudflare credentials not configured." },
    { status: 503 },
  );
}

function zoneId() {
  return process.env.CLOUDFLARE_ZONE_ID ?? "";
}

/** Accepts IPv4, IPv6, and CIDR notation. */
function isValidIPOrCIDR(value: string): boolean {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  const ipv6 = /^[0-9a-fA-F:]{2,45}(\/\d{1,3})?$/;
  return ipv4.test(value) || ipv6.test(value);
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
    return notConfigured();
  }

  try {
    const res = await fetch(
      `${CF_BASE}/zones/${zoneId()}/firewall/access_rules/rules?per_page=100&mode=block`,
      { headers: cfHeaders() },
    );
    const data = await res.json() as unknown;
    if (!res.ok) {
      console.error("[cloudflare/firewall] GET failed", data);
      return Response.json(
        { error: "Failed to fetch firewall rules." },
        { status: res.status },
      );
    }
    return Response.json(data);
  } catch (err) {
    console.error("[cloudflare/firewall] GET error", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
    return notConfigured();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { ip, notes } = body as Record<string, unknown>;

  if (typeof ip !== "string" || !ip.trim()) {
    return Response.json({ error: "Field 'ip' is required." }, { status: 400 });
  }
  const cleanIP = ip.trim();
  if (!isValidIPOrCIDR(cleanIP)) {
    return Response.json({ error: "Invalid IP address format." }, { status: 400 });
  }

  const safeNotes =
    typeof notes === "string" && notes.trim()
      ? notes.trim().slice(0, 200)
      : "Blocked via SecureScope admin";

  try {
    const res = await fetch(
      `${CF_BASE}/zones/${zoneId()}/firewall/access_rules/rules`,
      {
        method: "POST",
        headers: cfHeaders(),
        body: JSON.stringify({
          mode: "block",
          configuration: { target: "ip", value: cleanIP },
          notes: safeNotes,
        }),
      },
    );
    const data = await res.json() as unknown;
    if (!res.ok) {
      console.error("[cloudflare/firewall] POST failed", data);
      return Response.json(
        { error: "Failed to block IP." },
        { status: res.status },
      );
    }
    return Response.json(data);
  } catch (err) {
    console.error("[cloudflare/firewall] POST error", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
    return notConfigured();
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9]+$/.test(id)) {
    return Response.json(
      { error: "Valid firewall rule 'id' query parameter is required." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `${CF_BASE}/zones/${zoneId()}/firewall/access_rules/rules/${id}`,
      { method: "DELETE", headers: cfHeaders() },
    );
    const data = await res.json() as unknown;
    if (!res.ok) {
      console.error("[cloudflare/firewall] DELETE failed", data);
      return Response.json(
        { error: "Failed to unblock IP." },
        { status: res.status },
      );
    }
    return Response.json(data);
  } catch (err) {
    console.error("[cloudflare/firewall] DELETE error", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * Cloudflare DNS Records
 * GET    /api/cloudflare/dns           — list all DNS records
 * POST   /api/cloudflare/dns           — add a DNS record  (body: { type, name, content, proxied? })
 * DELETE /api/cloudflare/dns?id=<id>   — delete a DNS record by ID
 *
 * Requires server-side env vars:
 *   CLOUDFLARE_API_TOKEN  — API token with Zone:DNS:Edit permission
 *   CLOUDFLARE_ZONE_ID    — Zone ID from the Cloudflare dashboard
 */

import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

const CF_BASE = "https://api.cloudflare.com/client/v4";

const ALLOWED_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"] as const;

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

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
    return notConfigured();
  }

  try {
    const res = await fetch(
      `${CF_BASE}/zones/${zoneId()}/dns_records?per_page=100`,
      { headers: cfHeaders() },
    );
    const data = await res.json() as unknown;
    if (!res.ok) {
      console.error("[cloudflare/dns] GET failed", data);
      return Response.json(
        { error: "Failed to fetch DNS records." },
        { status: res.status },
      );
    }
    return Response.json(data);
  } catch (err) {
    console.error("[cloudflare/dns] GET error", err);
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

  const { type, name, content, proxied } = body as Record<string, unknown>;

  if (typeof type !== "string" || !type.trim()) {
    return Response.json({ error: "Field 'type' is required." }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Field 'name' is required." }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return Response.json({ error: "Field 'content' is required." }, { status: 400 });
  }

  const normalizedType = type.trim().toUpperCase();
  if (!(ALLOWED_RECORD_TYPES as readonly string[]).includes(normalizedType)) {
    return Response.json(
      { error: `Record type must be one of: ${ALLOWED_RECORD_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${CF_BASE}/zones/${zoneId()}/dns_records`, {
      method: "POST",
      headers: cfHeaders(),
      body: JSON.stringify({
        type: normalizedType,
        name: name.trim(),
        content: content.trim(),
        proxied: proxied === true,
      }),
    });
    const data = await res.json() as unknown;
    if (!res.ok) {
      console.error("[cloudflare/dns] POST failed", data);
      return Response.json(
        { error: "Failed to create DNS record." },
        { status: res.status },
      );
    }
    return Response.json(data);
  } catch (err) {
    console.error("[cloudflare/dns] POST error", err);
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
      { error: "Valid DNS record 'id' query parameter is required." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `${CF_BASE}/zones/${zoneId()}/dns_records/${id}`,
      { method: "DELETE", headers: cfHeaders() },
    );
    const data = await res.json() as unknown;
    if (!res.ok) {
      console.error("[cloudflare/dns] DELETE failed", data);
      return Response.json(
        { error: "Failed to delete DNS record." },
        { status: res.status },
      );
    }
    return Response.json(data);
  } catch (err) {
    console.error("[cloudflare/dns] DELETE error", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * Platform forms — POST JSON { formId, consentPrivacy, consentMarketing, fields }.
 * Server: honeypot, sanitization, optional IP rate limit, optional FORM_WEBHOOK_URL forward.
 * CSRF: this route is cookieless; if you add session auth later, issue CSRF tokens or SameSite=Lax POST patterns.
 *
 * Future integrations (server-side only — never expose secrets to the client):
 * - Email: Resend, SendGrid, Postmark, Microsoft Graph sendMail
 * - CRM / docs: Notion, Airtable, HubSpot
 * - Data: Supabase insert with RLS, Vercel serverless, Netlify functions
 * - Ticketing: Jira Service Management, Linear
 */

import type { NextRequest } from "next/server";
import { FORMS } from "@/lib/messaging/forms.config";
import type { FormFieldConfig, FormId } from "@/lib/messaging/types";
import { getClientIp } from "@/lib/server/client-ip";
import { sanitizeMultilineInput, sanitizeSingleLineInput } from "@/lib/input-sanitization";

const WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_MAX = 40;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

function rateLimit(ip: string): { ok: true } | { ok: false; status: 429 } {
  const max = Number(process.env.FORM_RATE_LIMIT_PER_IP_HOUR ?? DEFAULT_MAX);
  const cap = Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX;
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || now - b.windowStart > WINDOW_MS) {
    b = { count: 0, windowStart: now };
    buckets.set(ip, b);
  }
  if (b.count >= cap) return { ok: false, status: 429 };
  b.count += 1;
  return { ok: true };
}

function safeString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function sanitizeFieldValue(f: FormFieldConfig, raw: string): string {
  const max = f.maxLength ?? 8000;
  if (f.type === "textarea") {
    return sanitizeMultilineInput(raw, { maxLength: max });
  }
  return sanitizeSingleLineInput(raw, { maxLength: max });
}

function validateServer(def: (typeof FORMS)[FormId], normalized: Record<string, string>): string | null {
  for (const f of def.fields) {
    const v = normalized[f.name] ?? "";
    if (f.type === "honeypot") {
      if (v.length > 0) return "Invalid submission.";
      continue;
    }
    if (f.required && !v.trim()) return "Missing required fields.";
    if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email.";
    if (f.type === "url" && v) {
      try {
        const u = new URL(v);
        if (u.protocol !== "http:" && u.protocol !== "https:") return "Invalid URL.";
      } catch {
        return "Invalid URL.";
      }
    }
    if (f.type === "tel" && v) {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 8 || digits.length > 15) return "Invalid phone.";
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const formId = safeString(body.formId).trim() as FormId;
  if (!formId || !(formId in FORMS)) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const def = FORMS[formId];
  const ip = getClientIp(request);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return Response.json({ error: "Too many submissions. Try again later." }, { status: rl.status });
  }

  const fieldsRaw = body.fields;
  if (!fieldsRaw || typeof fieldsRaw !== "object" || Array.isArray(fieldsRaw)) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const fields = fieldsRaw as Record<string, unknown>;
  const normalized: Record<string, string> = {};
  for (const f of def.fields) {
    normalized[f.name] = sanitizeFieldValue(f, safeString(fields[f.name]));
  }

  const err = validateServer(def, normalized);
  if (err) {
    return Response.json({ error: err }, { status: 400 });
  }

  const consentPrivacy = Boolean(body.consentPrivacy);
  const consentMarketing = Boolean(body.consentMarketing);
  if (def.requireConsent && !consentPrivacy) {
    return Response.json({ error: "Consent is required." }, { status: 400 });
  }
  if (def.requireMarketingConsent && !consentMarketing) {
    return Response.json({ error: "Marketing consent is required for this form." }, { status: 400 });
  }

  const payload = {
    formId,
    ip,
    at: new Date().toISOString(),
    consentPrivacy: def.requireConsent ? consentPrivacy : true,
    consentMarketing: def.requireMarketingConsent ? consentMarketing : false,
    fields: normalized,
  };

  const webhook = process.env.FORM_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      const secret = process.env.FORM_WEBHOOK_SECRET?.trim();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (secret) headers.Authorization = `Bearer ${secret}`;
      await fetch(webhook, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
    } catch {
      return Response.json({ error: "Upstream error. Try again later." }, { status: 502 });
    }
  } else if (process.env.NODE_ENV === "development") {
    globalThis.console?.info?.("[platform-forms] accepted (no FORM_WEBHOOK_URL):", payload.formId);
  }

  return Response.json({ ok: true });
}

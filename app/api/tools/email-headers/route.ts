/**
 * Email header analyzer — server-side parsing.
 * Parses raw email headers to extract SPF/DKIM/DMARC, sender IP, and flags suspicious indicators.
 *
 * POST /api/tools/email-headers
 * Body: { headers: string }
 */

import type { NextRequest } from "next/server";
import type {
  EmailHeaderResult,
  SPFResult,
  DKIMResult,
  DMARCResult,
  StatusLevel,
} from "@/lib/types";

function unfoldHeaders(raw: string): string {
  // RFC 5322 header unfolding: CRLF followed by whitespace is a fold
  return raw.replace(/\r?\n([ \t])/g, " $1");
}

function extractField(raw: string, fieldName: string): string | null {
  const unfolded = unfoldHeaders(raw);
  const re = new RegExp(`^${fieldName}:\\s*(.+)`, "im");
  const m = unfolded.match(re);
  return m ? m[1].trim() : null;
}

function extractSenderIP(raw: string): string | null {
  // Look for "Received: from ... [IP]" — find in all Received headers
  const receivedHeaders: string[] = [];
  const unfolded = unfoldHeaders(raw);
  const lines = unfolded.split(/\r?\n/);

  let current = "";
  for (const line of lines) {
    if (/^Received:/i.test(line)) {
      if (current) receivedHeaders.push(current);
      current = line;
    } else if (current && /^\s/.test(line)) {
      current += " " + line.trim();
    } else if (current) {
      receivedHeaders.push(current);
      current = "";
    }
  }
  if (current) receivedHeaders.push(current);

  // The last Received header in the array represents the earliest hop (originating server),
  // since Received headers are prepended by each server in FIFO order (newest first in raw text).
  const originating = receivedHeaders[receivedHeaders.length - 1] ?? receivedHeaders[0] ?? "";

  const ipMatch = originating.match(
    /\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/,
  );
  return ipMatch ? ipMatch[1] : null;
}

function extractReceivedChain(raw: string): string[] {
  const chain: string[] = [];
  const unfolded = unfoldHeaders(raw);
  const lines = unfolded.split(/\r?\n/);

  let current = "";
  for (const line of lines) {
    if (/^Received:/i.test(line)) {
      if (current) chain.push(current.replace(/^Received:\s*/i, "").trim());
      current = line;
    } else if (current && /^\s/.test(line)) {
      current += " " + line.trim();
    } else if (current) {
      chain.push(current.replace(/^Received:\s*/i, "").trim());
      current = "";
    }
  }
  if (current) chain.push(current.replace(/^Received:\s*/i, "").trim());
  return chain;
}

function parseSpf(raw: string): SPFResult {
  const authResults = extractField(raw, "Authentication-Results") ?? "";
  const receivedSpf = extractField(raw, "Received-SPF") ?? "";
  const combined = `${authResults} ${receivedSpf}`.toLowerCase();

  const present = combined.includes("spf=") || receivedSpf.length > 0;
  if (!present) return { present: false, result: null, pass: false };

  const passMatch = combined.match(/spf=(pass|fail|softfail|neutral|none|temperror|permerror)/);
  const result = passMatch ? passMatch[1] : null;
  return { present: true, result, pass: result === "pass" };
}

function parseDkim(raw: string): DKIMResult {
  const authResults = extractField(raw, "Authentication-Results") ?? "";
  const lower = authResults.toLowerCase();

  const present = lower.includes("dkim=");
  if (!present) return { present: false, domain: null, result: null, pass: false };

  const resultMatch = lower.match(/dkim=(pass|fail|none|neutral|temperror|permerror)/);
  const result = resultMatch ? resultMatch[1] : null;

  const domainMatch = authResults.match(/d=([a-zA-Z0-9.-]+)/i);
  const domain = domainMatch ? domainMatch[1] : null;

  return { present: true, domain, result, pass: result === "pass" };
}

function parseDmarc(raw: string): DMARCResult {
  const authResults = extractField(raw, "Authentication-Results") ?? "";
  const lower = authResults.toLowerCase();

  const present = lower.includes("dmarc=");
  if (!present) return { present: false, policy: null, result: null, pass: false };

  const resultMatch = lower.match(/dmarc=(pass|fail|none|bestguesspass|temperror|permerror)/);
  const result = resultMatch ? resultMatch[1] : null;

  const policyMatch = authResults.match(/p=(\w+)/i);
  const policy = policyMatch ? policyMatch[1].toLowerCase() : null;

  return { present: true, policy, result, pass: result === "pass" };
}

function detectSuspiciousIndicators(
  raw: string,
  spf: SPFResult,
  dkim: DKIMResult,
  dmarc: DMARCResult,
  senderIP: string | null,
): string[] {
  const indicators: string[] = [];

  if (!spf.present) indicators.push("SPF record not found in authentication results");
  else if (!spf.pass) indicators.push(`SPF check did not pass (result: ${spf.result ?? "unknown"})`);

  if (!dkim.present) indicators.push("DKIM signature not found");
  else if (!dkim.pass) indicators.push(`DKIM check did not pass (result: ${dkim.result ?? "unknown"})`);

  if (!dmarc.present) indicators.push("DMARC policy not enforced");
  else if (!dmarc.pass) indicators.push(`DMARC check did not pass (result: ${dmarc.result ?? "unknown"})`);

  // Check for mismatched From and Reply-To
  const fromHeader = extractField(raw, "From") ?? "";
  const replyTo = extractField(raw, "Reply-To") ?? "";
  if (replyTo && fromHeader) {
    const fromDomain = fromHeader.match(/@([a-zA-Z0-9.-]+)/)?.[1]?.toLowerCase();
    const replyDomain = replyTo.match(/@([a-zA-Z0-9.-]+)/)?.[1]?.toLowerCase();
    if (fromDomain && replyDomain && fromDomain !== replyDomain) {
      indicators.push(`Reply-To domain (${replyDomain}) differs from From domain (${fromDomain})`);
    }
  }

  // Look for unusual encoding in subject
  const subject = extractField(raw, "Subject") ?? "";
  if (subject.includes("=?") && subject.includes("?=")) {
    indicators.push("Subject uses encoded-word encoding (may hide content)");
  }

  // Excessive Received hops
  const chain = extractReceivedChain(raw);
  if (chain.length > 8) {
    indicators.push(`Unusually long Received chain (${chain.length} hops)`);
  }

  if (senderIP) {
    const PRIVATE = [
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
    ];
    if (PRIVATE.some((r) => r.test(senderIP))) {
      indicators.push(`Sender IP ${senderIP} is a private/internal address`);
    }
  }

  return indicators;
}

export async function POST(request: NextRequest) {
  let body: { headers?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = (body.headers ?? "").trim();
  if (!raw) {
    return Response.json({ error: "Please provide raw email headers." }, { status: 400 });
  }

  if (raw.length > 100_000) {
    return Response.json({ error: "Headers too large (max 100 KB)." }, { status: 400 });
  }

  const senderIP = extractSenderIP(raw);
  const spf = parseSpf(raw);
  const dkim = parseDkim(raw);
  const dmarc = parseDmarc(raw);
  const suspiciousIndicators = detectSuspiciousIndicators(raw, spf, dkim, dmarc, senderIP);

  const allPass = spf.pass && dkim.pass && dmarc.pass;
  const anyFail = !spf.pass || !dkim.pass || !dmarc.pass;
  const status: StatusLevel =
    suspiciousIndicators.length >= 3
      ? "risk"
      : anyFail && !allPass
      ? "warning"
      : "safe";

  const result: EmailHeaderResult = {
    senderIP,
    fromAddress: extractField(raw, "From"),
    replyTo: extractField(raw, "Reply-To"),
    subject: extractField(raw, "Subject"),
    date: extractField(raw, "Date"),
    receivedChain: extractReceivedChain(raw),
    spf,
    dkim,
    dmarc,
    suspiciousIndicators,
    status,
  };

  return Response.json({ data: result, mock: false });
}

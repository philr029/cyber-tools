/**
 * Input-type detector for the unified scan form.
 *
 * Given an arbitrary string typed or pasted by the user, this module infers
 * which of the four Phase-2 tool categories it belongs to:
 *
 *   ip            — IPv4 or IPv6 address
 *   domain        — hostname / FQDN
 *   email-headers — multi-line raw email headers block
 *   phone         — international phone number
 *   unknown       — cannot be classified
 */

import { isValidIP, isValidDomain, isValidPhone } from "@/lib/validators";

export type InputType = "ip" | "domain" | "email-headers" | "phone" | "unknown";

// ---------------------------------------------------------------------------
// Email-header heuristics
// ---------------------------------------------------------------------------

// Fields that appear reliably at the start of a header name in RFC 5322 mail.
const EMAIL_HEADER_FIELDS = [
  "Received",
  "From",
  "To",
  "Subject",
  "Date",
  "Message-ID",
  "MIME-Version",
  "Content-Type",
  "Authentication-Results",
  "DKIM-Signature",
  "Return-Path",
  "Delivered-To",
  "Reply-To",
  "X-",
  "ARC-",
  "DMARC-Filter",
];

/** Returns true if the input looks like a raw email headers block. */
function looksLikeEmailHeaders(input: string): boolean {
  // Must be multi-line
  if (!input.includes("\n") && !input.includes("\r")) return false;

  const lines = input.split(/\r?\n/);
  let matchCount = 0;

  for (const line of lines) {
    for (const field of EMAIL_HEADER_FIELDS) {
      if (line.startsWith(field + ":") || line.startsWith(field + " ")) {
        matchCount++;
        break;
      }
    }
    if (matchCount >= 2) return true; // two distinct header lines is enough
  }

  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detects the most likely input type for the given string.
 * Returns `"unknown"` when no category matches.
 */
export function detectInputType(input: string): InputType {
  const trimmed = input.trim();
  if (!trimmed) return "unknown";

  // Email headers must be checked first — they can contain domain-like values.
  if (looksLikeEmailHeaders(trimmed)) return "email-headers";

  if (isValidIP(trimmed)) return "ip";

  if (isValidDomain(trimmed)) return "domain";

  if (isValidPhone(trimmed)) return "phone";

  return "unknown";
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export interface InputTypeInfo {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  ringColor: string;
  dotColor: string;
}

export const INPUT_TYPE_INFO: Record<InputType, InputTypeInfo> = {
  ip: {
    label: "IP Address",
    description: "IP reputation, geolocation & port scan",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    ringColor: "ring-cyan-500/30",
    dotColor: "bg-cyan-400",
  },
  domain: {
    label: "Domain",
    description: "Domain reputation, WHOIS & DNS intelligence",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    ringColor: "ring-blue-500/30",
    dotColor: "bg-blue-400",
  },
  "email-headers": {
    label: "Email Headers",
    description: "SPF / DKIM / DMARC authentication analysis",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    ringColor: "ring-violet-500/30",
    dotColor: "bg-violet-400",
  },
  phone: {
    label: "Phone Number",
    description: "Number validation, carrier & risk flags",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    ringColor: "ring-emerald-500/30",
    dotColor: "bg-emerald-400",
  },
  unknown: {
    label: "Unknown",
    description: "Type a domain, IP, phone number or paste email headers",
    color: "text-slate-500",
    bgColor: "bg-slate-700/30",
    ringColor: "ring-slate-600/30",
    dotColor: "bg-slate-500",
  },
};

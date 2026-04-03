/**
 * Input validators for IP addresses, domain names, and URLs.
 * Used by both API routes (server-side) and tool pages (client-side preview).
 */

// ---------------------------------------------------------------------------
// IP address
// ---------------------------------------------------------------------------

const IPV4_RE =
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

const IPV6_RE =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:(?:(:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;

export function isValidIP(value: string): boolean {
  const v = value.trim();
  return IPV4_RE.test(v) || IPV6_RE.test(v);
}

// ---------------------------------------------------------------------------
// Domain name
// ---------------------------------------------------------------------------

const DOMAIN_RE =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export function isValidDomain(value: string): boolean {
  const v = value.trim().toLowerCase();
  return DOMAIN_RE.test(v) && v.length <= 253;
}

// ---------------------------------------------------------------------------
// URL
// ---------------------------------------------------------------------------

export function isValidURL(value: string): boolean {
  try {
    const v = value.trim();
    const url = new URL(v.startsWith("http") ? v : `https://${v}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Generic: IP or domain (used by the unified search)
// ---------------------------------------------------------------------------

export function isValidIPOrDomain(value: string): boolean {
  return isValidIP(value) || isValidDomain(value);
}

export function normaliseURL(value: string): string {
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateIP(value: string): ValidationResult {
  if (!value.trim()) return { ok: false, message: "Please enter an IP address." };
  if (!isValidIP(value.trim())) return { ok: false, message: "That doesn't look like a valid IP address. Try something like 8.8.8.8." };
  return { ok: true };
}

export function validateDomain(value: string): ValidationResult {
  if (!value.trim()) return { ok: false, message: "Please enter a domain name." };
  if (!isValidDomain(value.trim())) return { ok: false, message: "That doesn't look like a valid domain. Try something like example.com." };
  return { ok: true };
}

export function validateURL(value: string): ValidationResult {
  if (!value.trim()) return { ok: false, message: "Please enter a URL." };
  if (!isValidURL(value.trim())) return { ok: false, message: "That doesn't look like a valid URL. Try https://example.com." };
  return { ok: true };
}

export function validateIPOrDomain(value: string): ValidationResult {
  if (!value.trim()) return { ok: false, message: "Please enter an IP address or domain." };
  if (!isValidIPOrDomain(value.trim())) return { ok: false, message: "Please enter a valid IP address (e.g. 8.8.8.8) or domain (e.g. example.com)." };
  return { ok: true };
}

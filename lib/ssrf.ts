/**
 * Server-side URL safety check to prevent SSRF attacks.
 * Blocks requests to private IP ranges, loopback, and non-HTTP protocols.
 */

const PRIVATE_IP_RANGES = [
  /^127\./,                          // loopback
  /^10\./,                           // class A private
  /^172\.(1[6-9]|2\d|3[01])\./,     // class B private
  /^192\.168\./,                     // class C private
  /^169\.254\./,                     // link-local
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 unique local
  /^fe80:/i,                         // IPv6 link-local
  /^0\./,                            // this-network
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // shared address space
];

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "169.254.169.254",   // AWS/GCP metadata
  "100.100.100.200",   // Alibaba Cloud metadata
]);

export type SafeURLResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

/**
 * Validates that a URL string is safe to fetch from the server.
 * Rejects private IPs, localhost, metadata endpoints, and non-HTTP protocols.
 */
export function assertSafeURL(rawURL: string): SafeURLResult {
  let url: URL;
  try {
    url = new URL(rawURL);
  } catch {
    return { ok: false, reason: "Invalid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "Only http:// and https:// protocols are allowed." };
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { ok: false, reason: "Requests to that hostname are not allowed." };
  }

  // Check whether the hostname resolves to a private range.
  // We check textual IP patterns — DNS resolution happens at request time
  // and is harder to guard against here, but this stops obvious direct IP attacks.
  for (const pattern of PRIVATE_IP_RANGES) {
    if (pattern.test(hostname)) {
      return { ok: false, reason: "Requests to private or reserved IP ranges are not allowed." };
    }
  }

  return { ok: true, url };
}

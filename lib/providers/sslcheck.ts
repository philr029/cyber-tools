/**
 * SSL certificate checker.
 * Uses the free SSL Labs API (no key required) for graded analysis.
 * Docs: https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs-v3.md
 * Env:  none required (public API)
 *
 * Note: SSL Labs analysis can take 60-90 seconds for a fresh scan.
 * We do a quick single poll here and return partial data if not ready.
 */

import type { SSLCertificateResult } from "@/lib/types";

interface SSLLabsEndpointDetail {
  cert?: {
    subject: string;
    issuerSubject: string;
    notBefore: number;
    notAfter: number;
    keyAlg: string;
    keySize: number;
    sigAlg: string;
    altNames: string[];
  };
  protocols?: Array<{ name: string; version: string }>;
}

interface SSLLabsResponse {
  status: string;
  host: string;
  endpoints?: Array<{
    statusMessage: string;
    details?: SSLLabsEndpointDetail;
  }>;
}

function msToISO(ms: number): string {
  return new Date(ms).toISOString();
}

function daysUntil(ms: number): number {
  return Math.floor((ms - Date.now()) / 86_400_000);
}

export async function fetchSSL(domain: string): Promise<SSLCertificateResult | null> {
  try {
    const res = await fetch(
      `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&fromCache=on&maxAge=24`,
      { next: { revalidate: 0 } },
    );

    if (!res.ok) return null;
    const json: SSLLabsResponse = await res.json();

    if (json.status !== "READY") return null; // Not cached yet – caller uses mock

    const endpoint = json.endpoints?.[0];
    const cert = endpoint?.details?.cert;
    if (!cert) return null;

    const daysRemaining = daysUntil(cert.notAfter);

    // Best protocol name
    const protocols = endpoint?.details?.protocols ?? [];
    const protocol =
      protocols.find((p) => p.name === "TLS 1.3")
        ? "TLSv1.3"
        : protocols.find((p) => p.name === "TLS 1.2")
        ? "TLSv1.2"
        : protocols[0]
        ? `${protocols[0].name} ${protocols[0].version}`
        : "Unknown";

    const status =
      daysRemaining <= 0 ? "risk" : daysRemaining <= 30 ? "risk" : daysRemaining <= 90 ? "warning" : "safe";

    return {
      domain,
      issuer: cert.issuerSubject,
      validFrom: msToISO(cert.notBefore),
      validTo: msToISO(cert.notAfter),
      daysRemaining,
      protocol,
      keySize: cert.keySize,
      signatureAlgorithm: cert.sigAlg,
      subjectAltNames: cert.altNames ?? [],
      status,
    };
  } catch {
    return null;
  }
}

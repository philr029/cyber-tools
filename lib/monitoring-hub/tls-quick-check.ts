import tls from "node:tls";

export interface TlsQuickCheckResult {
  tlsOk: boolean;
  error: string | null;
  subjectCn: string | null;
  issuerCn: string | null;
  validTo: string | null;
  authorized: boolean;
}

/**
 * Lightweight TLS handshake against public HTTPS hosts (port 443).
 * Uses Node TLS — does not follow HTTP redirects.
 */
export function quickTlsCheck(hostname: string, port = 443): Promise<TlsQuickCheckResult> {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: hostname,
      port,
      servername: hostname,
      rejectUnauthorized: true,
      timeout: 10_000,
    });

    const done = (r: TlsQuickCheckResult) => {
      try {
        socket.destroy();
      } catch {
        /* ignore */
      }
      resolve(r);
    };

    socket.once("secureConnect", () => {
      const authorized = socket.authorized;
      const cert = socket.getPeerCertificate(false);
      let subjectCn: string | null = null;
      let issuerCn: string | null = null;
      let validTo: string | null = null;
      if (cert && typeof cert === "object" && Object.keys(cert).length > 0) {
        try {
          const sub = cert.subject as Record<string, string | undefined> | undefined;
          const iss = cert.issuer as Record<string, string | undefined> | undefined;
          subjectCn = sub?.CN ?? sub?.commonName ?? null;
          issuerCn = iss?.CN ?? iss?.commonName ?? null;
          validTo = typeof cert.valid_to === "string" ? cert.valid_to : null;
        } catch {
          /* ignore parse issues */
        }
      }
      const authErr = socket.authorizationError;
      const errMsg =
        typeof authErr === "string"
          ? authErr
          : authErr instanceof Error
            ? authErr.message
            : authErr
              ? String(authErr)
              : "Certificate not authorized.";
      done({
        tlsOk: authorized,
        error: authorized ? null : errMsg,
        subjectCn,
        issuerCn,
        validTo,
        authorized,
      });
    });

    socket.once("error", (err: Error) => {
      done({
        tlsOk: false,
        error: err.message || "TLS error",
        subjectCn: null,
        issuerCn: null,
        validTo: null,
        authorized: false,
      });
    });

    socket.once("timeout", () => {
      done({
        tlsOk: false,
        error: "TLS handshake timed out.",
        subjectCn: null,
        issuerCn: null,
        validTo: null,
        authorized: false,
      });
    });
  });
}

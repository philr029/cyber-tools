/**
 * Server-side TCP port scanner (Safe Mode — common ports only).
 * Uses Node.js `net` module to attempt TCP connect on each port.
 * Safe: non-intrusive, no packet crafting, only standard connect.
 */

import * as net from "net";
import type { OpenPortsResult, PortEntry } from "@/lib/types";

export const SAFE_PORTS: Array<{ port: number; service: string }> = [
  { port: 21, service: "FTP" },
  { port: 22, service: "SSH" },
  { port: 23, service: "Telnet" },
  { port: 25, service: "SMTP" },
  { port: 53, service: "DNS" },
  { port: 80, service: "HTTP" },
  { port: 110, service: "POP3" },
  { port: 143, service: "IMAP" },
  { port: 443, service: "HTTPS" },
  { port: 445, service: "SMB" },
  { port: 3306, service: "MySQL" },
  { port: 3389, service: "RDP" },
  { port: 5432, service: "PostgreSQL" },
  { port: 8080, service: "HTTP-Alt" },
  { port: 8443, service: "HTTPS-Alt" },
];

const CONNECT_TIMEOUT_MS = 3_000;

function probePort(host: string, port: number): Promise<"open" | "closed" | "filtered"> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (state: "open" | "closed" | "filtered") => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(state);
    };

    socket.setTimeout(CONNECT_TIMEOUT_MS);
    socket.on("connect", () => finish("open"));
    socket.on("error", (err: NodeJS.ErrnoException) => {
      // ECONNREFUSED = port is closed; others (ETIMEDOUT, etc.) = filtered
      finish(err.code === "ECONNREFUSED" ? "closed" : "filtered");
    });
    socket.on("timeout", () => finish("filtered"));

    try {
      socket.connect(port, host);
    } catch {
      finish("filtered");
    }
  });
}

export async function scanCommonPorts(host: string): Promise<OpenPortsResult> {
  const start = Date.now();

  const results = await Promise.all(
    SAFE_PORTS.map(async ({ port, service }) => {
      const state = await probePort(host, port);
      const entry: PortEntry = {
        port,
        protocol: "TCP",
        service,
        state,
        version: "",
      };
      return entry;
    }),
  );

  const scanDuration = Date.now() - start;
  const openCount = results.filter((p) => p.state === "open").length;

  return {
    target: host,
    openCount,
    ports: results,
    scanDuration,
    status: openCount >= 8 ? "risk" : openCount >= 4 ? "warning" : "safe",
  };
}

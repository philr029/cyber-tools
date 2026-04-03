/**
 * Mock WHOIS and URL Analysis data, plus helpers for other mock results.
 * These are used as fallback when API keys are not configured.
 */

import type { WHOISResult, URLAnalysisResult } from "@/lib/types";

export const MOCK_WHOIS: Record<string, WHOISResult> = {
  "example.com": {
    domain: "example.com",
    registrar: "Internet Assigned Numbers Authority",
    registrarUrl: "https://www.iana.org",
    registrantOrg: "Internet Assigned Numbers Authority",
    registrantCountry: "US",
    createdDate: "1992-01-01",
    updatedDate: "2024-08-14",
    expiryDate: "2025-08-13",
    nameservers: ["a.iana-servers.net", "b.iana-servers.net"],
    status: ["clientDeleteProhibited", "clientTransferProhibited"],
    dnssec: true,
    lookupStatus: "safe",
  },
  "google.com": {
    domain: "google.com",
    registrar: "MarkMonitor Inc.",
    registrarUrl: "https://www.markmonitor.com",
    registrantOrg: "Google LLC",
    registrantCountry: "US",
    createdDate: "1997-09-15",
    updatedDate: "2024-09-09",
    expiryDate: "2028-09-14",
    nameservers: ["ns1.google.com", "ns2.google.com", "ns3.google.com", "ns4.google.com"],
    status: ["clientDeleteProhibited", "clientTransferProhibited", "clientUpdateProhibited", "serverDeleteProhibited"],
    dnssec: false,
    lookupStatus: "safe",
  },
  "malicious-test.xyz": {
    domain: "malicious-test.xyz",
    registrar: "Namecheap Inc.",
    registrarUrl: "https://www.namecheap.com",
    registrantOrg: null,
    registrantCountry: "PA",
    createdDate: "2024-11-15",
    updatedDate: "2024-11-15",
    expiryDate: "2025-11-15",
    nameservers: ["ns1.dnspod.net", "ns2.dnspod.net"],
    status: ["clientTransferProhibited"],
    dnssec: false,
    lookupStatus: "risk",
  },
};

export const MOCK_URL_ANALYSIS: Record<string, URLAnalysisResult> = {
  "https://example.com": {
    url: "https://example.com",
    finalUrl: "https://example.com",
    statusCode: 200,
    ipAddress: "93.184.216.34",
    domain: "example.com",
    redirectChain: [],
    contentType: "text/html; charset=UTF-8",
    malicious: 0,
    suspicious: 1,
    harmless: 68,
    undetected: 15,
    categories: ["Information Technology"],
    threatNames: [],
    status: "warning",
  },
  "https://google.com": {
    url: "https://google.com",
    finalUrl: "https://www.google.com",
    statusCode: 200,
    ipAddress: "142.250.80.46",
    domain: "google.com",
    redirectChain: ["https://google.com", "https://www.google.com"],
    contentType: "text/html; charset=UTF-8",
    malicious: 0,
    suspicious: 0,
    harmless: 80,
    undetected: 4,
    categories: ["Search Engines"],
    threatNames: [],
    status: "safe",
  },
  "https://malicious-test.xyz": {
    url: "https://malicious-test.xyz",
    finalUrl: "https://malicious-test.xyz",
    statusCode: 200,
    ipAddress: "185.220.101.47",
    domain: "malicious-test.xyz",
    redirectChain: [],
    contentType: "text/html",
    malicious: 45,
    suspicious: 8,
    harmless: 2,
    undetected: 5,
    categories: ["Malware", "Phishing"],
    threatNames: ["Phishing.Generic", "Trojan.Downloader"],
    status: "risk",
  },
};

export function createDefaultWHOIS(domain: string): WHOISResult {
  return {
    domain,
    registrar: "Unknown",
    registrarUrl: null,
    registrantOrg: null,
    registrantCountry: null,
    createdDate: "Unknown",
    updatedDate: "Unknown",
    expiryDate: "Unknown",
    nameservers: [],
    status: [],
    dnssec: false,
    lookupStatus: "unknown",
  };
}

export function createDefaultURLAnalysis(url: string): URLAnalysisResult {
  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }
  return {
    url,
    finalUrl: url,
    statusCode: null,
    ipAddress: null,
    domain,
    redirectChain: [],
    contentType: null,
    malicious: 0,
    suspicious: 0,
    harmless: 0,
    undetected: 0,
    categories: [],
    threatNames: [],
    status: "unknown",
  };
}

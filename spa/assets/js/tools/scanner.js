/**
 * scanner.js — Smart Scan engine.
 *
 * Auto-detects input type (domain, IP, email, phone, URL) then runs
 * animated threat checks against deterministic mock data, persists to
 * history, and surfaces a structured result object.
 */

import { history } from '../modules/state.js';
import { toast }   from '../modules/toast.js';

/* ── Input-type detection ───────────────────────────────────────── */

const PATTERNS = {
  email:  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
  ip:     /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  url:    /^https?:\/\/.+/i,
  domain: /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i,
  phone:  /^\+?[\d\s\-().]{7,20}$/,
};

export function detectType(value) {
  const v = value.trim();
  if (!v)                         return null;
  if (PATTERNS.email.test(v))     return 'email';
  if (PATTERNS.ip.test(v))        return 'ip';
  if (PATTERNS.url.test(v))       return 'url';
  if (PATTERNS.domain.test(v))    return 'domain';
  if (PATTERNS.phone.test(v))     return 'phone';
  return 'unknown';
}

export const TYPE_META = {
  email:   { label: 'Email',   icon: '✉' },
  ip:      { label: 'IP',      icon: '⬡' },
  url:     { label: 'URL',     icon: '🔗' },
  domain:  { label: 'Domain',  icon: '◈' },
  phone:   { label: 'Phone',   icon: '☎' },
  unknown: { label: 'Unknown', icon: '?' },
};

/* ── Mock result pools ──────────────────────────────────────────── */

const RESULTS = {
  domain: [
    {
      status: 'safe',    risk: 'Low',
      riskClass: 'safe',
      summary: 'Domain appears clean',
      detail:  'WHOIS records are valid, no active blacklist entries, and DNS configuration looks correct. Registration age and registrar are both consistent with a legitimate site.',
    },
    {
      status: 'warning', risk: 'Medium',
      riskClass: 'warning',
      summary: 'Suspicious registration detected',
      detail:  'Domain was registered less than 30 days ago and has minimal historical footprint. Treat with caution until further context is established.',
    },
    {
      status: 'risk',    risk: 'High',
      riskClass: 'danger',
      summary: 'Potential phishing domain',
      detail:  'Domain matches known phishing naming patterns and is listed on 3 active threat intelligence feeds. Avoid interacting with this domain.',
    },
  ],
  email: [
    {
      status: 'safe',    risk: 'Low',
      riskClass: 'safe',
      summary: 'Email address looks legitimate',
      detail:  'Domain has valid SPF, DKIM, and DMARC records. No breach history found across major data-breach databases.',
    },
    {
      status: 'warning', risk: 'Medium',
      riskClass: 'warning',
      summary: 'Disposable email provider',
      detail:  'This appears to be a temporary or disposable email address service. Common in spam and throwaway registrations.',
    },
    {
      status: 'risk',    risk: 'High',
      riskClass: 'danger',
      summary: 'Email linked to spam activity',
      detail:  'Address found in 5 spam databases and has a documented abuse report history. Do not trust communications from this source.',
    },
  ],
  ip: [
    {
      status: 'safe',    risk: 'Low',
      riskClass: 'safe',
      summary: 'IP address is clean',
      detail:  'No abuse reports found in the last 90 days. IP is located in the expected region and belongs to a reputable ASN with no abuse history.',
    },
    {
      status: 'warning', risk: 'Medium',
      riskClass: 'warning',
      summary: 'VPN / proxy detected',
      detail:  'This IP is associated with a commercial VPN or anonymisation service. The real origin cannot be determined.',
    },
    {
      status: 'risk',    risk: 'High',
      riskClass: 'danger',
      summary: 'Malicious IP detected',
      detail:  'IP has 47 confirmed abuse reports in the last 30 days. Likely a bot, scanner, or compromised host. Block recommended.',
    },
  ],
  phone: [
    {
      status: 'safe',    risk: 'Low',
      riskClass: 'safe',
      summary: 'Phone number is valid',
      detail:  'Carrier lookup returned a verified mobile line. Country code matches the expected region and there are no scam reports on record.',
    },
    {
      status: 'warning', risk: 'Medium',
      riskClass: 'warning',
      summary: 'VoIP number detected',
      detail:  'This appears to be a virtual or VoIP number rather than a physical mobile line. Often used in scam and spam campaigns.',
    },
    {
      status: 'risk',    risk: 'High',
      riskClass: 'danger',
      summary: 'Number linked to scam reports',
      detail:  'This number has 12 scam reports on crowdsourced databases in the past 6 months. Treat any communication from this number with extreme caution.',
    },
  ],
  url: [
    {
      status: 'safe',    risk: 'Low',
      riskClass: 'safe',
      summary: 'URL appears safe',
      detail:  'No malware or phishing indicators detected. SSL certificate is valid, trusted, and not self-signed. Domain has a clean reputation.',
    },
    {
      status: 'risk',    risk: 'High',
      riskClass: 'danger',
      summary: 'Malicious URL detected',
      detail:  'URL is listed on 4 threat intelligence blacklists including Google Safe Browsing. Likely used for phishing or malware distribution.',
    },
  ],
  unknown: [
    {
      status: 'warning', risk: 'Medium',
      riskClass: 'warning',
      summary: 'Input type not recognised',
      detail:  'Please enter a valid domain (e.g. example.com), IP address (e.g. 8.8.8.8), email address, URL, or phone number.',
    },
  ],
};

function _mockResult(type) {
  const pool = RESULTS[type] ?? RESULTS.unknown;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── Scan steps ─────────────────────────────────────────────────── */

export const SCAN_STEPS = [
  { label: 'Detecting input type',   ms: 650 },
  { label: 'Running threat checks',  ms: 950 },
  { label: 'Analysing results',      ms: 600 },
];

/* ── Public API ─────────────────────────────────────────────────── */

/**
 * Run an animated smart scan for the given query.
 *
 * @param {string}   query
 * @param {object}   [opts]
 * @param {function} [opts.onStep]      (label: string, stepIndex: number) => void
 * @param {function} [opts.onComplete]  (result: object) => void
 * @returns {Promise<void>}
 */
export async function runScan(query, { onStep, onComplete } = {}) {
  const value = query.trim();
  if (!value) {
    toast.warning('Please enter a domain, IP, email, or phone number.');
    return;
  }

  const type   = detectType(value) ?? 'unknown';
  const result = _mockResult(type);

  for (let i = 0; i < SCAN_STEPS.length; i++) {
    onStep?.(SCAN_STEPS[i].label, i);
    await _delay(SCAN_STEPS[i].ms);
  }

  // Persist to scan history
  history.add({ query: value, type, status: result.status });

  onComplete?.({ query: value, type, ...result });
}

function _delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

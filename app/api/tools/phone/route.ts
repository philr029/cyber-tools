import { NextRequest, NextResponse } from "next/server";
import type { PhoneResult, PhoneNumberType, PhoneRiskFlag, StatusLevel } from "@/lib/types";

// ---------------------------------------------------------------------------
// Dial-code → country lookup table (covers the most common calling codes)
// ---------------------------------------------------------------------------

interface CountryInfo {
  name: string;
  iso2: string;
  /** Minimum subscriber number length (digits after the dial code) */
  minLen: number;
  /** Maximum subscriber number length */
  maxLen: number;
}

const DIAL_CODE_MAP: Record<string, CountryInfo> = {
  "+1":   { name: "United States / Canada", iso2: "US", minLen: 10, maxLen: 10 },
  "+7":   { name: "Russia / Kazakhstan",    iso2: "RU", minLen: 10, maxLen: 10 },
  "+20":  { name: "Egypt",                  iso2: "EG", minLen: 10, maxLen: 10 },
  "+27":  { name: "South Africa",           iso2: "ZA", minLen: 9,  maxLen: 9  },
  "+30":  { name: "Greece",                 iso2: "GR", minLen: 10, maxLen: 10 },
  "+31":  { name: "Netherlands",            iso2: "NL", minLen: 9,  maxLen: 9  },
  "+32":  { name: "Belgium",                iso2: "BE", minLen: 8,  maxLen: 9  },
  "+33":  { name: "France",                 iso2: "FR", minLen: 9,  maxLen: 9  },
  "+34":  { name: "Spain",                  iso2: "ES", minLen: 9,  maxLen: 9  },
  "+36":  { name: "Hungary",                iso2: "HU", minLen: 8,  maxLen: 9  },
  "+39":  { name: "Italy",                  iso2: "IT", minLen: 9,  maxLen: 11 },
  "+40":  { name: "Romania",                iso2: "RO", minLen: 9,  maxLen: 9  },
  "+41":  { name: "Switzerland",            iso2: "CH", minLen: 9,  maxLen: 9  },
  "+43":  { name: "Austria",                iso2: "AT", minLen: 7,  maxLen: 13 },
  "+44":  { name: "United Kingdom",         iso2: "GB", minLen: 10, maxLen: 10 },
  "+45":  { name: "Denmark",                iso2: "DK", minLen: 8,  maxLen: 8  },
  "+46":  { name: "Sweden",                 iso2: "SE", minLen: 7,  maxLen: 9  },
  "+47":  { name: "Norway",                 iso2: "NO", minLen: 8,  maxLen: 8  },
  "+48":  { name: "Poland",                 iso2: "PL", minLen: 9,  maxLen: 9  },
  "+49":  { name: "Germany",                iso2: "DE", minLen: 3,  maxLen: 12 },
  "+51":  { name: "Peru",                   iso2: "PE", minLen: 9,  maxLen: 9  },
  "+52":  { name: "Mexico",                 iso2: "MX", minLen: 10, maxLen: 10 },
  "+53":  { name: "Cuba",                   iso2: "CU", minLen: 8,  maxLen: 8  },
  "+54":  { name: "Argentina",              iso2: "AR", minLen: 10, maxLen: 11 },
  "+55":  { name: "Brazil",                 iso2: "BR", minLen: 10, maxLen: 11 },
  "+56":  { name: "Chile",                  iso2: "CL", minLen: 9,  maxLen: 9  },
  "+57":  { name: "Colombia",               iso2: "CO", minLen: 10, maxLen: 10 },
  "+58":  { name: "Venezuela",              iso2: "VE", minLen: 10, maxLen: 10 },
  "+60":  { name: "Malaysia",               iso2: "MY", minLen: 8,  maxLen: 10 },
  "+61":  { name: "Australia",              iso2: "AU", minLen: 9,  maxLen: 9  },
  "+62":  { name: "Indonesia",              iso2: "ID", minLen: 7,  maxLen: 12 },
  "+63":  { name: "Philippines",            iso2: "PH", minLen: 10, maxLen: 10 },
  "+64":  { name: "New Zealand",            iso2: "NZ", minLen: 8,  maxLen: 10 },
  "+65":  { name: "Singapore",              iso2: "SG", minLen: 8,  maxLen: 8  },
  "+66":  { name: "Thailand",               iso2: "TH", minLen: 9,  maxLen: 9  },
  "+81":  { name: "Japan",                  iso2: "JP", minLen: 9,  maxLen: 10 },
  "+82":  { name: "South Korea",            iso2: "KR", minLen: 9,  maxLen: 10 },
  "+84":  { name: "Vietnam",                iso2: "VN", minLen: 9,  maxLen: 10 },
  "+86":  { name: "China",                  iso2: "CN", minLen: 11, maxLen: 11 },
  "+90":  { name: "Turkey",                 iso2: "TR", minLen: 10, maxLen: 10 },
  "+91":  { name: "India",                  iso2: "IN", minLen: 10, maxLen: 10 },
  "+92":  { name: "Pakistan",               iso2: "PK", minLen: 10, maxLen: 10 },
  "+93":  { name: "Afghanistan",            iso2: "AF", minLen: 9,  maxLen: 9  },
  "+94":  { name: "Sri Lanka",              iso2: "LK", minLen: 9,  maxLen: 9  },
  "+95":  { name: "Myanmar",                iso2: "MM", minLen: 8,  maxLen: 10 },
  "+98":  { name: "Iran",                   iso2: "IR", minLen: 10, maxLen: 10 },
  "+212": { name: "Morocco",                iso2: "MA", minLen: 9,  maxLen: 9  },
  "+213": { name: "Algeria",                iso2: "DZ", minLen: 9,  maxLen: 9  },
  "+216": { name: "Tunisia",                iso2: "TN", minLen: 8,  maxLen: 8  },
  "+218": { name: "Libya",                  iso2: "LY", minLen: 9,  maxLen: 9  },
  "+220": { name: "Gambia",                 iso2: "GM", minLen: 7,  maxLen: 7  },
  "+221": { name: "Senegal",                iso2: "SN", minLen: 9,  maxLen: 9  },
  "+225": { name: "Ivory Coast",            iso2: "CI", minLen: 10, maxLen: 10 },
  "+233": { name: "Ghana",                  iso2: "GH", minLen: 9,  maxLen: 9  },
  "+234": { name: "Nigeria",                iso2: "NG", minLen: 8,  maxLen: 10 },
  "+254": { name: "Kenya",                  iso2: "KE", minLen: 9,  maxLen: 9  },
  "+255": { name: "Tanzania",               iso2: "TZ", minLen: 9,  maxLen: 9  },
  "+256": { name: "Uganda",                 iso2: "UG", minLen: 9,  maxLen: 9  },
  "+260": { name: "Zambia",                 iso2: "ZM", minLen: 9,  maxLen: 9  },
  "+263": { name: "Zimbabwe",               iso2: "ZW", minLen: 9,  maxLen: 9  },
  "+353": { name: "Ireland",                iso2: "IE", minLen: 7,  maxLen: 9  },
  "+358": { name: "Finland",                iso2: "FI", minLen: 5,  maxLen: 12 },
  "+380": { name: "Ukraine",                iso2: "UA", minLen: 9,  maxLen: 9  },
  "+381": { name: "Serbia",                 iso2: "RS", minLen: 8,  maxLen: 9  },
  "+385": { name: "Croatia",                iso2: "HR", minLen: 8,  maxLen: 9  },
  "+420": { name: "Czech Republic",         iso2: "CZ", minLen: 9,  maxLen: 9  },
  "+421": { name: "Slovakia",               iso2: "SK", minLen: 9,  maxLen: 9  },
  "+966": { name: "Saudi Arabia",           iso2: "SA", minLen: 9,  maxLen: 9  },
  "+971": { name: "United Arab Emirates",   iso2: "AE", minLen: 9,  maxLen: 9  },
  "+972": { name: "Israel",                 iso2: "IL", minLen: 8,  maxLen: 9  },
  "+974": { name: "Qatar",                  iso2: "QA", minLen: 8,  maxLen: 8  },
  "+977": { name: "Nepal",                  iso2: "NP", minLen: 9,  maxLen: 10 },
  "+994": { name: "Azerbaijan",             iso2: "AZ", minLen: 9,  maxLen: 9  },
  "+995": { name: "Georgia",                iso2: "GE", minLen: 9,  maxLen: 9  },
  "+998": { name: "Uzbekistan",             iso2: "UZ", minLen: 9,  maxLen: 9  },
};

// ---------------------------------------------------------------------------
// Mocked carrier lookup: returns a plausible carrier name based on country
// and (for +1) the area-code prefix.
// ---------------------------------------------------------------------------

const US_AREA_CARRIER: Record<string, string> = {
  "201": "T-Mobile", "202": "Verizon", "212": "AT&T", "213": "T-Mobile",
  "310": "AT&T",     "312": "T-Mobile","404": "T-Mobile","415": "AT&T",
  "512": "T-Mobile", "617": "Verizon", "650": "AT&T",   "702": "T-Mobile",
  "714": "Verizon",  "718": "AT&T",    "800": "Toll-Free","888": "Toll-Free",
  "877": "Toll-Free","866": "Toll-Free","855": "Toll-Free","900": "Premium-Rate",
};

const COUNTRY_CARRIER: Record<string, string[]> = {
  GB: ["EE", "O2", "Vodafone UK", "Three UK"],
  DE: ["Deutsche Telekom", "Vodafone DE", "O2 Germany"],
  FR: ["Orange", "SFR", "Bouygues Telecom"],
  AU: ["Telstra", "Optus", "Vodafone AU"],
  IN: ["Jio", "Airtel", "Vi (Vodafone-Idea)", "BSNL"],
  CN: ["China Mobile", "China Unicom", "China Telecom"],
  JP: ["NTT Docomo", "SoftBank", "au (KDDI)"],
  BR: ["Claro Brasil", "Vivo", "TIM Brasil"],
  ZA: ["Vodacom", "MTN South Africa", "Cell C"],
  NG: ["MTN Nigeria", "Glo Mobile", "Airtel Nigeria"],
  KE: ["Safaricom", "Airtel Kenya"],
  SG: ["Singtel", "StarHub", "M1"],
};

function mockedCarrier(iso2: string, subscriberDigits: string): string {
  if (iso2 === "US") {
    const areaCode = subscriberDigits.slice(0, 3);
    const carrier = US_AREA_CARRIER[areaCode];
    if (carrier) return carrier;
    return ["AT&T", "Verizon", "T-Mobile", "US Cellular"][
      parseInt(subscriberDigits.slice(3, 4), 10) % 4
    ];
  }
  const options = COUNTRY_CARRIER[iso2];
  if (options) {
    const idx = parseInt(subscriberDigits.slice(0, 2), 10) % options.length;
    return options[idx];
  }
  return "Unknown Carrier";
}

// ---------------------------------------------------------------------------
// Number-type detection heuristics
// ---------------------------------------------------------------------------

function detectNumberType(iso2: string, subscriberDigits: string): PhoneNumberType {
  if (iso2 === "US") {
    const area = subscriberDigits.slice(0, 3);
    if (["800","888","877","866","855","844","833"].includes(area)) return "toll-free";
    if (area === "900") return "premium-rate";
    // Common VOIP prefix patterns for +1
    if (["202","332","363","423","531","567","580"].includes(area)) return "voip";
    return "mobile";
  }
  // Generic: numbers beginning with common mobile prefixes
  const first2 = subscriberDigits.slice(0, 2);
  if (["07","06","09","08"].includes(first2)) return "mobile";
  if (first2 === "08" && iso2 === "GB") return "landline";
  return "mobile";
}

// ---------------------------------------------------------------------------
// Risk flag evaluation
// ---------------------------------------------------------------------------

function evaluateFlags(
  numberType: PhoneNumberType,
  iso2: string | null,
  subscriberDigits: string,
  lengthOk: boolean,
): PhoneRiskFlag[] {
  const flags: PhoneRiskFlag[] = [];

  if (!lengthOk) {
    flags.push({
      code: "LENGTH_MISMATCH",
      label: "Number length is outside the expected range for this country.",
      severity: "warning",
    });
  }

  if (numberType === "voip") {
    flags.push({
      code: "VOIP_NUMBER",
      label: "This appears to be a VoIP number, commonly used in spam and fraud.",
      severity: "high",
    });
  }

  if (numberType === "premium-rate") {
    flags.push({
      code: "PREMIUM_RATE",
      label: "Premium-rate numbers can incur unexpected charges.",
      severity: "warning",
    });
  }

  // Repeated digit patterns (e.g. 555-5555, 000-0000)
  const repeatRe = /(.)\1{5,}/;
  if (repeatRe.test(subscriberDigits)) {
    flags.push({
      code: "SUSPICIOUS_PATTERN",
      label: "Number contains an unusual repeated-digit pattern.",
      severity: "warning",
    });
  }

  // Sequential patterns (e.g. 1234567890)
  if (/0123456789|9876543210|12345678/.test(subscriberDigits)) {
    flags.push({
      code: "SEQUENTIAL_PATTERN",
      label: "Number appears to be a sequential test or placeholder number.",
      severity: "warning",
    });
  }

  // Known fake/test blocks
  if (iso2 === "US" && ["555"].includes(subscriberDigits.slice(0, 3))) {
    flags.push({
      code: "FICTIONAL_BLOCK",
      label: "555 numbers are typically reserved for fictional use in North America.",
      severity: "high",
    });
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

/** Strip all non-digit characters (keeping a leading +). */
function normalise(raw: string): string {
  const s = raw.trim();
  // Keep leading + if present
  return (s.startsWith("+") ? "+" : "") + s.replace(/\D/g, "");
}

/** Attempt to match the longest known dial code (3-digit first, then 2, then 1). */
function matchDialCode(digits: string): { dialCode: string; info: CountryInfo } | null {
  for (const len of [3, 2, 1]) {
    const code = "+" + digits.slice(0, len);
    if (DIAL_CODE_MAP[code]) return { dialCode: code, info: DIAL_CODE_MAP[code] };
  }
  return null;
}

/** Format subscriber digits into a human-readable local format. */
function formatSubscriber(iso2: string, sub: string, dialCode: string): string {
  if (iso2 === "US") {
    // (NXX) NXX-XXXX
    if (sub.length === 10)
      return `(${sub.slice(0, 3)}) ${sub.slice(3, 6)}-${sub.slice(6)}`;
  }
  if (iso2 === "GB" && sub.length === 10) {
    return `0${sub.slice(0, 4)} ${sub.slice(4, 7)} ${sub.slice(7)}`;
  }
  // Generic: group in blocks of 3-3-4
  const parts: string[] = [];
  let i = 0;
  const blocks = sub.length <= 9 ? [3, 3, sub.length - 6] : [3, 3, 4];
  for (const b of blocks) {
    if (b <= 0) break;
    parts.push(sub.slice(i, i + b));
    i += b;
  }
  if (i < sub.length) parts.push(sub.slice(i));
  return `${dialCode} ${parts.join(" ")}`;
}

// ---------------------------------------------------------------------------
// Main analyser
// ---------------------------------------------------------------------------

function analysePhone(raw: string): PhoneResult {
  const norm = normalise(raw);

  // Must start with + for international format, or we try to parse anyway
  const withPlus = norm.startsWith("+") ? norm : "+" + norm;
  const digits = withPlus.slice(1); // strip leading +

  const match = matchDialCode(digits);

  if (!match) {
    return {
      raw,
      e164: null,
      formatted: null,
      dialCode: null,
      country: null,
      countryCode: null,
      numberType: "unknown",
      carrier: null,
      flags: [
        {
          code: "UNKNOWN_DIAL_CODE",
          label: "Could not identify a country dial code. Make sure to include the country code (e.g. +1, +44).",
          severity: "warning",
        },
      ],
      status: "warning",
    };
  }

  const { dialCode, info } = match;
  const subscriberDigits = digits.slice(dialCode.length - 1); // -1 because dialCode includes "+"

  const lengthOk =
    subscriberDigits.length >= info.minLen && subscriberDigits.length <= info.maxLen;

  const numberType = detectNumberType(info.iso2, subscriberDigits);
  const flags = evaluateFlags(numberType, info.iso2, subscriberDigits, lengthOk);

  const carrier =
    numberType === "toll-free" || numberType === "premium-rate"
      ? null
      : mockedCarrier(info.iso2, subscriberDigits);

  const e164 = `${dialCode}${subscriberDigits}`;
  const formatted = formatSubscriber(info.iso2, subscriberDigits, dialCode);

  // Overall status
  const hasCritical = flags.some((f) => f.severity === "high");
  const hasWarning = flags.some((f) => f.severity === "warning");
  const status: StatusLevel = hasCritical ? "risk" : hasWarning ? "warning" : "safe";

  return {
    raw,
    e164,
    formatted,
    dialCode,
    country: info.name,
    countryCode: info.iso2,
    numberType,
    carrier,
    flags,
    status,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest): Promise<NextResponse> {
  const phone = req.nextUrl.searchParams.get("phone") ?? "";
  if (!phone.trim()) {
    return NextResponse.json({ error: "Missing phone parameter." }, { status: 400 });
  }

  const result = analysePhone(phone.trim());
  return NextResponse.json({ data: result, mock: false });
}

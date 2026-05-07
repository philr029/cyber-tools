// Tabs and line breaks are preserved here and normalized per input type below.
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const LINE_BREAK_RE = /\r\n?/g;

type SanitizeOptions = {
  trim?: boolean;
  maxLength?: number;
  collapseSpaces?: boolean;
};

function applyMaxLength(value: string, maxLength?: number): string {
  return typeof maxLength === "number" ? value.slice(0, maxLength) : value;
}

export function sanitizeSingleLineInput(
  value: string,
  options: SanitizeOptions = {},
): string {
  const {
    trim = true,
    maxLength = 2048,
    collapseSpaces = true,
  } = options;

  let sanitised = value
    .replace(CONTROL_CHARS_RE, "")
    .replace(LINE_BREAK_RE, " ")
    .replace(/\t+/g, " ");

  if (collapseSpaces) {
    sanitised = sanitised.replace(/ {2,}/g, " ");
  }

  if (trim) {
    sanitised = sanitised.trim();
  }

  return applyMaxLength(sanitised, maxLength);
}

export function sanitizeMultilineInput(
  value: string,
  options: SanitizeOptions = {},
): string {
  const {
    trim = true,
    maxLength = 8000,
  } = options;

  let sanitised = value
    .replace(CONTROL_CHARS_RE, "")
    .replace(LINE_BREAK_RE, "\n");

  sanitised = sanitised.replace(/\n{3,}/g, "\n\n");

  if (trim) {
    sanitised = sanitised.trim();
  }

  return applyMaxLength(sanitised, maxLength);
}

export function sanitizePasswordInput(value: string): string {
  return applyMaxLength(
    value.replace(CONTROL_CHARS_RE, "").replace(/[\r\n]/g, ""),
    512,
  );
}

export function sanitizeHeaderName(value: string): string {
  // RFC 7230 section 3.2 token characters allowed in HTTP header field names.
  return sanitizeSingleLineInput(value, {
    maxLength: 256,
  }).replace(/[^!#$%&'*+.^_`|~0-9A-Za-z-]/g, "");
}

export function sanitizeHeaderValue(value: string): string {
  return sanitizeSingleLineInput(value, {
    trim: false,
    collapseSpaces: false,
    maxLength: 4096,
  });
}

export function sanitizeFieldName(value: string): string {
  return sanitizeSingleLineInput(value, {
    maxLength: 256,
    collapseSpaces: false,
  });
}

/** Banner / toast strip at top of layout or section. */
export type BannerStatus =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "security"
  | "beta"
  | "cookie"
  | "auth";

export type AuthVisibility = "any" | "logged-in" | "logged-out";

export interface BannerConfig {
  id: string;
  version: number;
  type: BannerStatus;
  title: string;
  message: string;
  /** Lucide-style: optional emoji or short label; rendered as icon slot */
  icon?: string;
  ctaText?: string;
  ctaLink?: string;
  dismissible?: boolean;
  /** ISO date string (UTC end of day treated as inclusive in client check) */
  expiresAt?: string;
  /** If set, banner only shows when pathname starts with one of these */
  pathPrefixes?: string[];
  auth?: AuthVisibility;
  /** After dismiss, show again after N days (requires version bump to force sooner) */
  dismissTtlDays?: number;
}

export type PopupKind =
  | "newsletter"
  | "whats-new"
  | "login-prompt"
  | "confirm"
  | "security-warning"
  | "api-key-reminder"
  | "onboarding";

export interface PopupConfig {
  id: string;
  kind: PopupKind;
  enabled: boolean;
  title: string;
  message: string;
  /** Optional primary action for non-form popups */
  ctaText?: string;
  ctaLink?: string;
  /** Delay before first eligibility check (ms) */
  delayMs?: number;
  /** Minimum ms between auto-shows for this id */
  minIntervalMs?: number;
  /** If true, only when Cookiebot marketing consent */
  requiresMarketingConsent?: boolean;
  dismissTtlDays?: number;
  version: number;
  pathPrefixes?: string[];
  auth?: AuthVisibility;
}

export type FormFieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "url"
  | "tel"
  | "honeypot";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Help text under field */
  hint?: string;
}

export type FormId =
  | "contact"
  | "newsletter"
  | "tool-feedback"
  | "bug-report"
  | "feature-request"
  | "lead-check"
  | "website-test"
  | "domain-test"
  | "phone-test"
  | "security-check";

export interface FormDefinition {
  id: FormId;
  title: string;
  description: string;
  submitLabel: string;
  fields: FormFieldConfig[];
  /** If true, consent checkbox required (privacy + marketing note) */
  requireConsent: boolean;
  /** If true, block submit unless Cookiebot marketing consent (newsletter-style use) */
  requireMarketingConsent?: boolean;
}

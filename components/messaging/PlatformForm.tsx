"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { readMarketingConsent } from "@/lib/cookiebot-consent";
import { FORM_CONSENT_HINT, FORMS } from "@/lib/messaging/forms.config";
import type { FormFieldConfig, FormId } from "@/lib/messaging/types";
import { appFetch } from "@/lib/base-path";
import { useMarketingConsent } from "@/components/messaging/use-marketing-consent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

function validateUrl(v: string): boolean {
  const s = v.trim();
  if (!s) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function validatePhone(v: string): boolean {
  const s = v.trim();
  if (!s) return true;
  const digits = s.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && /^\+?[0-9\s\-().]+$/.test(s);
}

function validateField(f: FormFieldConfig, raw: string): string | null {
  const v = raw.trim();
  if (f.type === "honeypot") return null;
  if (f.required && !v) return "This field is required.";
  if (!v) return null;
  if (f.maxLength && v.length > f.maxLength) return `Maximum length is ${f.maxLength} characters.`;
  if (f.type === "email" && !validateEmail(v)) return "Enter a valid email address.";
  if (f.type === "url" && !validateUrl(v)) return "Enter a valid http(s) URL.";
  if (f.type === "tel" && !validatePhone(v)) return "Enter a valid phone number (E.164-style preferred).";
  return null;
}

export default function PlatformForm({
  formId,
  compact,
  onSuccess,
}: {
  formId: FormId;
  compact?: boolean;
  /** Called once after a successful submit (e.g. auto-close a popup). */
  onSuccess?: () => void;
}) {
  const def = FORMS[formId];
  const marketingOk = useMarketingConsent();

  const initialValues = useMemo(() => {
    const o: Record<string, string> = {};
    for (const f of def.fields) {
      o[f.name] = "";
    }
    return o;
  }, [def.fields]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setValues({ ...initialValues });
    setErrors({});
    setConsentPrivacy(false);
    setConsentMarketing(false);
    setStatus("idle");
    setGlobalError(null);
  }, [initialValues]);

  const onChange = (name: string, v: string) => {
    setValues((prev) => ({ ...prev, [name]: v }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateAll = (): boolean => {
    const next: Record<string, string> = {};
    for (const f of def.fields) {
      const err = validateField(f, values[f.name] ?? "");
      if (err) next[f.name] = err;
    }
    if (def.requireConsent && !consentPrivacy) {
      setGlobalError("Please confirm you agree to the privacy terms before submitting.");
      setErrors(next);
      return false;
    }
    if (def.requireMarketingConsent) {
      if (!readMarketingConsent()) {
        setGlobalError("Marketing consent is required for this form. Enable marketing cookies in Cookie Settings.");
        setErrors(next);
        return false;
      }
      if (!consentMarketing) {
        setGlobalError("Please confirm you want product emails.");
        setErrors(next);
        return false;
      }
    }
    setGlobalError(null);
    if (Object.keys(next).length) {
      setErrors(next);
      return false;
    }
    setErrors({});
    return true;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    if (!validateAll()) return;
    setStatus("loading");
    setGlobalError(null);
    try {
      const res = await appFetch("/api/platform-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          consentPrivacy: def.requireConsent ? consentPrivacy : true,
          consentMarketing: def.requireMarketingConsent ? consentMarketing && marketingOk : false,
          fields: values,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setGlobalError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      onSuccess?.();
    } catch {
      setStatus("error");
      setGlobalError("Network error. Check your connection and try again.");
    }
  };

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center ${compact ? "p-4" : ""}`}
        role="status"
      >
        <p className="text-sm font-semibold text-emerald-200">Thank you</p>
        <p className="mt-2 text-sm text-[var(--ss-text-secondary)]">
          Your message was received. If a mailbox is configured on the server, it will be forwarded; otherwise this
          stays a demo acknowledgement.
        </p>
        {!compact ? (
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex rounded-xl border border-[var(--ss-border)] px-4 py-2 text-sm font-medium text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)]"
          >
            Send another
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`relative space-y-4 ${compact ? "space-y-3" : ""}`}
      noValidate
    >
      {!compact ? (
        <div>
          <h2 className="text-xl font-semibold text-[var(--ss-text)]">{def.title}</h2>
          <p className="mt-1 text-sm text-[var(--ss-text-secondary)]">{def.description}</p>
        </div>
      ) : null}

      {def.fields.map((f) => {
        if (f.type === "honeypot") {
          return (
            <div key={f.name} className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
              <label htmlFor={`${formId}-${f.name}`}>{f.label}</label>
              <input
                id={`${formId}-${f.name}`}
                name={f.name}
                tabIndex={-1}
                autoComplete="off"
                value={values[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
              />
            </div>
          );
        }
        const err = errors[f.name];
        const common =
          "w-full rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2.5 text-sm text-[var(--ss-text)] placeholder:text-[var(--ss-text-secondary)] focus:border-[var(--ss-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ss-ring)]";
        return (
          <div key={f.name}>
            <label htmlFor={`${formId}-${f.name}`} className="block text-xs font-medium text-[var(--ss-text-secondary)]">
              {f.label}
              {f.required ? <span className="text-red-400"> *</span> : null}
            </label>
            {f.type === "textarea" ? (
              <textarea
                id={`${formId}-${f.name}`}
                className={`${common} mt-1 min-h-[120px] resize-y`}
                value={values[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
                maxLength={f.maxLength}
                placeholder={f.placeholder}
                required={f.required}
              />
            ) : f.type === "select" ? (
              <select
                id={`${formId}-${f.name}`}
                className={`${common} mt-1`}
                value={values[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
                required={f.required}
              >
                <option value="">Select…</option>
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`${formId}-${f.name}`}
                type={f.type === "email" ? "email" : f.type === "url" ? "url" : f.type === "tel" ? "tel" : "text"}
                className={`${common} mt-1`}
                value={values[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
                maxLength={f.maxLength}
                placeholder={f.placeholder}
                required={f.required}
                autoComplete={f.type === "email" ? "email" : f.name === "name" ? "name" : undefined}
              />
            )}
            {f.hint ? <p className="mt-1 text-xs text-[var(--ss-text-secondary)]">{f.hint}</p> : null}
            {err ? (
              <p className="mt-1 text-xs text-red-400" role="alert">
                {err}
              </p>
            ) : null}
          </div>
        );
      })}

      {def.requireConsent ? (
        <div className="rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)] p-4">
          <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-[var(--ss-text-secondary)]">
            <input
              type="checkbox"
              checked={consentPrivacy}
              onChange={(e) => setConsentPrivacy(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--ss-border)] text-[var(--ss-accent)] focus:ring-[var(--ss-ring)]"
            />
            <span>
              {FORM_CONSENT_HINT}{" "}
              <Link href="/privacy" className="font-medium text-[var(--ss-accent)] hover:underline">
                Privacy Policy
              </Link>
              {" · "}
              <Link href="/cookies" className="font-medium text-[var(--ss-accent)] hover:underline">
                Cookie Policy
              </Link>
            </span>
          </label>
        </div>
      ) : null}

      {def.requireMarketingConsent ? (
        <div className="rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)] p-4">
          {!marketingOk ? (
            <p className="text-sm text-amber-200/90">
              Marketing cookies are off. Open{" "}
              <Link href="/cookies" className="font-medium text-[var(--ss-accent)] hover:underline">
                Cookie Policy
              </Link>{" "}
              or use Cookie Settings in the footer to allow marketing, then reload.
            </p>
          ) : (
            <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-[var(--ss-text-secondary)]">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--ss-border)] text-[var(--ss-accent)] focus:ring-[var(--ss-ring)]"
              />
              <span>
                I agree to receive occasional product emails. I can withdraw consent via Cookie Settings or the
                unsubscribe link in any email.
              </span>
            </label>
          )}
        </div>
      ) : null}

      {globalError ? (
        <p className="text-sm text-red-400" role="alert">
          {globalError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={
          status === "loading" ||
          (def.requireMarketingConsent && (!marketingOk || !consentMarketing))
        }
        className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--ss-accent)] to-[var(--accent-blue)] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_color-mix(in_srgb,var(--ss-accent)_28%,transparent)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ss-ring)] sm:w-auto"
      >
        {status === "loading" ? "Sending…" : def.submitLabel}
      </button>
    </form>
  );
}

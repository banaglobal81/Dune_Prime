/**
 * Inquiry contract shared by the website and the back end.
 *
 * The website POSTs an `InquiryPayload` as JSON to NEXT_PUBLIC_FORM_ENDPOINT
 * (Cloudflare Worker). Fields map to the inquiry sheet columns in the
 * Developer Handoff v4.4 (page 6): date, name, email, type, timing, message,
 * consent time, source (UTM), status, owner. Status and owner are set by the back end.
 */

export const INQUIRER_TYPES = [
  "investor",
  "owner",
  "broker",
  "financial_partner",
  "other",
] as const;
export type InquirerType = (typeof INQUIRER_TYPES)[number];

/** Raw values from the form. */
export interface InquiryInput {
  name: string;
  email: string;
  type: InquirerType;
  timing: string;
  message: string;
  consent: boolean;
  /** Honeypot. Real visitors never see or fill this field. */
  company: string;
  /** Cloudflare Turnstile token (empty when Turnstile is not configured). */
  turnstileToken: string;
}

export interface InquiryAttribution {
  /** Page the inquiry was sent from, e.g. "/ko/". */
  page: string;
  /** Referrer of the first page in this visit. */
  referrer: string;
  utm: Partial<Record<"source" | "medium" | "campaign" | "term" | "content", string>>;
}

/** JSON body sent to the inquiry endpoint. */
export interface InquiryPayload {
  name: string;
  email: string;
  type: InquirerType;
  timing: string;
  message: string;
  locale: string;
  /** ISO 8601 time the visitor ticked the consent box (UAE PDPL / GDPR record). */
  consentAt: string;
  /** ISO 8601 time the form was submitted. */
  submittedAt: string;
  source: InquiryAttribution;
  /** Verified server-side when the API has TURNSTILE_SECRET_KEY. */
  turnstileToken?: string;
}

export type InquiryField = "name" | "email" | "consent";
export type InquiryFieldErrors = Partial<Record<InquiryField, true>>;

export type InquiryResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; errors: InquiryFieldErrors }
  | { ok: false; reason: "failed" };

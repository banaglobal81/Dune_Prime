import { z } from "zod";

/**
 * Inquiry contract. Must match `InquiryPayload` in the website
 * (`src/services/inquiry/types.ts`). Every string is trimmed and length-capped:
 * the browser validates too, but the server is the source of truth.
 */

export const INQUIRER_TYPES = [
  "investor",
  "owner",
  "broker",
  "financial_partner",
  "other",
] as const;
export type InquirerType = (typeof INQUIRER_TYPES)[number];

export const SUPPORTED_LOCALES = ["en", "ko"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const text = (max: number) => z.string().trim().max(max);

export const inquirySubmissionSchema = z.object({
  name: text(120).min(1),
  email: z.string().trim().toLowerCase().pipe(z.email().max(200)),
  type: z.enum(INQUIRER_TYPES),
  timing: text(120).default(""),
  message: text(4000).default(""),
  locale: z.string().trim().max(10).default("en"),
  consentAt: z.iso.datetime(),
  submittedAt: z.iso.datetime().optional(),
  source: z
    .object({
      page: text(300).default(""),
      referrer: text(500).default(""),
      utm: z
        .object({
          source: text(200).optional(),
          medium: text(200).optional(),
          campaign: text(200).optional(),
          term: text(200).optional(),
          content: text(200).optional(),
        })
        .default({}),
    })
    .default({ page: "", referrer: "", utm: {} }),
  /** Cloudflare Turnstile token, required when Turnstile is configured. */
  turnstileToken: text(4096).optional(),
});

export type InquirySubmission = z.infer<typeof inquirySubmissionSchema>;

/** Pipeline stages from the Developer Handoff v4.4 (page 6). */
export const INQUIRY_STATUSES = [
  "New",
  "Contacted",
  "Meeting",
  "NDA",
  "Materials",
  "Agreement",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface Owner {
  name: string;
  email?: string;
  whatsapp?: string;
}

/** A stored inquiry: the submission plus server-side fields. */
export interface InquiryRecord {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  type: InquirerType;
  timing: string;
  message: string;
  locale: SupportedLocale;
  consentAt: string;
  source: InquirySubmission["source"];
  status: InquiryStatus;
  owner: Owner;
}

export function normalizeLocale(locale: string): SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale)
    ? (locale as SupportedLocale)
    : "en";
}

/** "utm_source / utm_medium / utm_campaign" in one readable sheet cell. */
export function describeSource(source: InquirySubmission["source"]): string {
  const { utm } = source;
  const parts = [utm.source, utm.medium, utm.campaign].filter(Boolean);
  return parts.length ? parts.join(" / ") : "direct";
}

export const INQUIRER_TYPE_LABELS: Record<InquirerType, string> = {
  investor: "Investor",
  owner: "Owner",
  broker: "Broker or developer",
  financial_partner: "Financial partner",
  other: "Guest or other",
};

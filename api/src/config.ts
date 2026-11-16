import { z } from "zod";

import { INQUIRER_TYPES, type InquirerType, type Owner } from "./domain/inquiry.js";

/**
 * Environment configuration. Every integration is optional: when its variables are
 * missing, the API falls back to logging, so it runs locally and on day one.
 * See api/.env.example for every variable.
 */

const list = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

const ownerSchema = z.object({
  name: z.string().min(1),
  email: z.email().optional(),
  whatsapp: z.string().optional(),
});

const ownersSchema = z
  .string()
  .default("{}")
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "INQUIRY_OWNERS must be valid JSON" });
      return z.NEVER;
    }
  })
  .pipe(z.partialRecord(z.enum([...INQUIRER_TYPES, "default"]), ownerSchema));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  ALLOWED_ORIGINS: list,

  // Google Sheets (service account with edit access to the sheet)
  GOOGLE_SHEET_ID: z.string().optional(),
  GOOGLE_SHEET_TAB: z.string().default("Inquiries"),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),

  // Email: Resend (HTTPS API) is preferred; SMTP is the alternative.
  MAIL_FROM: z.string().default("Dune Prime <hello@duneprime.com>"),
  MAIL_REPLY_TO: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Team alerts
  TEAM_ALERT_EMAILS: list,
  TEAM_ALERT_WHATSAPP: list,
  INQUIRY_OWNERS: ownersSchema,

  // WhatsApp Cloud API (Meta). Business-initiated messages need an approved template.
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_TEMPLATE: z.string().default("new_inquiry"),
  WHATSAPP_TEMPLATE_LANG: z.string().default("en"),
  WHATSAPP_API_VERSION: z.string().default("v21.0"),

  // Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Abuse protection
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(10),

  // Follow-up reminder job
  REMINDER_AFTER_HOURS: z.coerce.number().positive().default(24),
});

export interface AppConfig {
  env: "development" | "production" | "test";
  port: number;
  allowedOrigins: string[];
  sheets?: { sheetId: string; tab: string; clientEmail: string; privateKey: string };
  mail: {
    from: string;
    replyTo?: string;
    resendApiKey?: string;
    smtp?: { host: string; port: number; secure: boolean; user?: string; pass?: string };
  };
  team: { emails: string[]; whatsapp: string[] };
  owners: Partial<Record<InquirerType | "default", Owner>>;
  whatsapp?: {
    token: string;
    phoneNumberId: string;
    template: string;
    language: string;
    apiVersion: string;
  };
  turnstileSecret?: string;
  rateLimit: { max: number; windowMs: number };
  reminderAfterHours: number;
}

const DEFAULT_ORIGINS = ["https://www.duneprime.com", "https://duneprime.com"];
const DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  // Hosting dashboards often store unset variables as empty strings: treat those as "not set".
  const defined = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined && value.trim() !== ""),
  );
  const parsed = envSchema.safeParse(defined);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  const env = parsed.data;

  const allowedOrigins = [
    ...(env.ALLOWED_ORIGINS.length ? env.ALLOWED_ORIGINS : DEFAULT_ORIGINS),
    ...(env.NODE_ENV === "production" ? [] : DEV_ORIGINS),
  ];

  const sheets =
    env.GOOGLE_SHEET_ID && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY
      ? {
          sheetId: env.GOOGLE_SHEET_ID,
          tab: env.GOOGLE_SHEET_TAB,
          clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          // Railway stores multi-line values fine, but "\n" escapes are common in copied keys.
          privateKey: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }
      : undefined;

  const whatsapp =
    env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID
      ? {
          token: env.WHATSAPP_TOKEN,
          phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
          template: env.WHATSAPP_TEMPLATE,
          language: env.WHATSAPP_TEMPLATE_LANG,
          apiVersion: env.WHATSAPP_API_VERSION,
        }
      : undefined;

  return {
    env: env.NODE_ENV,
    port: env.PORT,
    allowedOrigins,
    sheets,
    mail: {
      from: env.MAIL_FROM,
      replyTo: env.MAIL_REPLY_TO,
      resendApiKey: env.RESEND_API_KEY,
      smtp: env.SMTP_HOST
        ? {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
    },
    team: { emails: env.TEAM_ALERT_EMAILS, whatsapp: env.TEAM_ALERT_WHATSAPP },
    owners: env.INQUIRY_OWNERS,
    whatsapp,
    turnstileSecret: env.TURNSTILE_SECRET_KEY,
    rateLimit: { max: env.RATE_LIMIT_MAX, windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60_000 },
    reminderAfterHours: env.REMINDER_AFTER_HOURS,
  };
}

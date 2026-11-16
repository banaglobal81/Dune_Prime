import type { InquiryRecord } from "./domain/inquiry.js";

/**
 * Interfaces the application depends on. Each has a real adapter (Google Sheets,
 * Resend/SMTP, WhatsApp, Turnstile) and a logging fallback in `src/adapters/`.
 */

/** A stored inquiry and the sheet row it lives in. */
export interface StoredInquiry {
  rowNumber: number;
  record: InquiryRecord;
  reminderSentAt?: string;
}

export interface InquiryRepository {
  readonly name: string;
  save(record: InquiryRecord): Promise<void>;
  /** Inquiries still "New" that arrived before `receivedBefore` and have not been reminded yet. */
  findOverdue(receivedBefore: Date): Promise<StoredInquiry[]>;
  markReminded(inquiry: StoredInquiry, at: Date): Promise<void>;
}

export interface EmailMessage {
  to: string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export interface Mailer {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

export interface WhatsAppMessage {
  /** Recipient in international format, digits only or with "+". */
  to: string;
  /** Ordered values for the approved template's body placeholders. */
  params: string[];
}

export interface WhatsAppSender {
  readonly name: string;
  send(message: WhatsAppMessage): Promise<void>;
}

export interface SpamGuard {
  readonly name: string;
  /** Resolves true when the request looks human. */
  verify(token: string | undefined, ip: string | undefined): Promise<boolean>;
}

/** Minimal structured logger (JSON lines in production, readable in development). */
export interface Logger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

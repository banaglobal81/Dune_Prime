import type { InquiryRecord } from "../domain/inquiry.js";
import type {
  EmailMessage,
  InquiryRepository,
  Logger,
  Mailer,
  SpamGuard,
  StoredInquiry,
  WhatsAppMessage,
  WhatsAppSender,
} from "../ports.js";

export class FakeRepository implements InquiryRepository {
  readonly name = "fake";
  rows: StoredInquiry[] = [];
  failNextSave = false;

  async save(record: InquiryRecord): Promise<void> {
    if (this.failNextSave) {
      this.failNextSave = false;
      throw new Error("sheet down");
    }
    this.rows.push({ rowNumber: this.rows.length + 2, record });
  }

  async findOverdue(receivedBefore: Date): Promise<StoredInquiry[]> {
    return this.rows.filter(
      (r) =>
        r.record.status === "New" &&
        !r.reminderSentAt &&
        new Date(r.record.receivedAt) < receivedBefore,
    );
  }

  async markReminded(inquiry: StoredInquiry, at: Date): Promise<void> {
    inquiry.reminderSentAt = at.toISOString();
  }
}

export class FakeMailer implements Mailer {
  readonly name = "fake";
  sent: EmailMessage[] = [];
  fail = false;

  async send(message: EmailMessage): Promise<void> {
    if (this.fail) throw new Error("mail down");
    this.sent.push(message);
  }
}

export class FakeWhatsApp implements WhatsAppSender {
  readonly name = "fake";
  sent: WhatsAppMessage[] = [];

  async send(message: WhatsAppMessage): Promise<void> {
    this.sent.push(message);
  }
}

export class FakeGuard implements SpamGuard {
  readonly name = "fake";
  constructor(public allow = true) {}

  async verify(): Promise<boolean> {
    return this.allow;
  }
}

export const silentLogger: Logger = { info() {}, warn() {}, error() {} };

/** A valid payload exactly as the website sends it. */
export function websitePayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "  Sara Kim ",
    email: "Sara@Example.com",
    type: "investor",
    timing: "Q1 2027",
    message: "Interested in the reporting.",
    locale: "ko",
    consentAt: "2026-11-16T09:12:00.000Z",
    submittedAt: "2026-11-16T09:12:30.000Z",
    source: {
      page: "/ko/",
      referrer: "https://www.linkedin.com/",
      utm: { source: "linkedin", campaign: "launch" },
    },
    ...overrides,
  };
}

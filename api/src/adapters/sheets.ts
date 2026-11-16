import { JWT } from "google-auth-library";

import {
  INQUIRER_TYPE_LABELS,
  INQUIRER_TYPES,
  describeSource,
  normalizeLocale,
  type InquirerType,
  type InquiryRecord,
  type InquiryStatus,
} from "../domain/inquiry.js";
import type { InquiryRepository, Logger, StoredInquiry } from "../ports.js";

/**
 * Sheet layout. The first ten columns follow the Developer Handoff v4.4 (page 6);
 * the rest support the pipeline. Row 1 holds these headers (written automatically
 * when the tab is empty). The team edits "Status" and "Owner" by hand.
 */
export const SHEET_COLUMNS = [
  "Date",
  "Name",
  "Email",
  "Type",
  "Timing",
  "Message",
  "Consent time",
  "Source (UTM)",
  "Status",
  "Owner",
  "Locale",
  "Page",
  "Referrer",
  "ID",
  "Reminder sent",
] as const;

const COL = Object.fromEntries(SHEET_COLUMNS.map((name, index) => [name, index])) as Record<
  (typeof SHEET_COLUMNS)[number],
  number
>;
const LAST_COLUMN = String.fromCharCode("A".charCodeAt(0) + SHEET_COLUMNS.length - 1);
const REMINDER_COLUMN = String.fromCharCode("A".charCodeAt(0) + COL["Reminder sent"]);

interface SheetsConfig {
  sheetId: string;
  tab: string;
  clientEmail: string;
  privateKey: string;
}

/** Stores inquiries as rows in a shared Google Sheet via the Sheets REST API. */
export class GoogleSheetsInquiryRepository implements InquiryRepository {
  readonly name = "google-sheets";
  private readonly auth: JWT;
  private headerChecked = false;

  constructor(
    private readonly config: SheetsConfig,
    private readonly logger: Logger,
  ) {
    this.auth = new JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  async save(record: InquiryRecord): Promise<void> {
    await this.ensureHeader();
    // RAW: values are stored as typed text, so input like "=HYPERLINK(...)" is never run as a formula.
    await this.call(
      `values/${this.range(`A:${LAST_COLUMN}`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: { values: [this.toRow(record)] },
      },
    );
  }

  async findOverdue(receivedBefore: Date): Promise<StoredInquiry[]> {
    const data = await this.call<{ values?: string[][] }>(
      `values/${this.range(`A2:${LAST_COLUMN}`)}`,
    );
    const rows = data.values ?? [];
    const overdue: StoredInquiry[] = [];
    rows.forEach((row, index) => {
      const status = (row[COL.Status] ?? "").trim();
      const reminded = (row[COL["Reminder sent"]] ?? "").trim();
      const received = new Date(row[COL.Date] ?? "");
      if (status !== "New" || reminded || Number.isNaN(received.getTime())) return;
      if (received >= receivedBefore) return;
      overdue.push({ rowNumber: index + 2, record: this.fromRow(row) });
    });
    return overdue;
  }

  async markReminded(inquiry: StoredInquiry, at: Date): Promise<void> {
    const cell = this.range(`${REMINDER_COLUMN}${inquiry.rowNumber}`);
    await this.call(`values/${cell}?valueInputOption=RAW`, {
      method: "PUT",
      body: { values: [[at.toISOString()]] },
    });
  }

  private async ensureHeader(): Promise<void> {
    if (this.headerChecked) return;
    const data = await this.call<{ values?: string[][] }>(`values/${this.range("A1:A1")}`);
    if (!data.values?.[0]?.[0]) {
      await this.call(`values/${this.range(`A1:${LAST_COLUMN}1`)}?valueInputOption=RAW`, {
        method: "PUT",
        body: { values: [[...SHEET_COLUMNS]] },
      });
      this.logger.info("Wrote inquiry sheet header row");
    }
    this.headerChecked = true;
  }

  private toRow(record: InquiryRecord): string[] {
    const row: string[] = new Array(SHEET_COLUMNS.length).fill("");
    row[COL.Date] = record.receivedAt;
    row[COL.Name] = record.name;
    row[COL.Email] = record.email;
    row[COL.Type] = INQUIRER_TYPE_LABELS[record.type];
    row[COL.Timing] = record.timing;
    row[COL.Message] = record.message;
    row[COL["Consent time"]] = record.consentAt;
    row[COL["Source (UTM)"]] = describeSource(record.source);
    row[COL.Status] = record.status;
    row[COL.Owner] = record.owner.name;
    row[COL.Locale] = record.locale;
    row[COL.Page] = record.source.page;
    row[COL.Referrer] = record.source.referrer;
    row[COL.ID] = record.id;
    return row;
  }

  private fromRow(row: string[]): InquiryRecord {
    const cell = (name: (typeof SHEET_COLUMNS)[number]) => row[COL[name]] ?? "";
    const typeLabel = cell("Type");
    const type =
      (INQUIRER_TYPES.find((t) => INQUIRER_TYPE_LABELS[t] === typeLabel) as
        InquirerType | undefined) ?? "other";
    return {
      id: cell("ID"),
      receivedAt: cell("Date"),
      name: cell("Name"),
      email: cell("Email"),
      type,
      timing: cell("Timing"),
      message: cell("Message"),
      locale: normalizeLocale(cell("Locale")),
      consentAt: cell("Consent time"),
      source: { page: cell("Page"), referrer: cell("Referrer"), utm: {} },
      status: cell("Status") as InquiryStatus,
      owner: { name: cell("Owner") },
    };
  }

  private range(a1: string): string {
    return encodeURIComponent(`'${this.config.tab.replace(/'/g, "''")}'!${a1}`);
  }

  private async call<T = unknown>(
    path: string,
    init?: { method: string; body: unknown },
  ): Promise<T> {
    const { token } = await this.auth.getAccessToken();
    if (!token) throw new Error("Google auth returned no access token");
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.config.sheetId}/${path}`,
      {
        method: init?.method ?? "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: init ? JSON.stringify(init.body) : undefined,
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      throw new Error(`Google Sheets ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
    return (await response.json()) as T;
  }
}

/** Development fallback: keeps inquiries in memory and logs them. Not for production. */
export class LogInquiryRepository implements InquiryRepository {
  readonly name = "log";
  private readonly rows: StoredInquiry[] = [];

  constructor(private readonly logger: Logger) {}

  async save(record: InquiryRecord): Promise<void> {
    this.rows.push({ rowNumber: this.rows.length + 2, record });
    this.logger.info("Inquiry stored (log repository: not persisted)", {
      id: record.id,
      type: record.type,
    });
  }

  async findOverdue(receivedBefore: Date): Promise<StoredInquiry[]> {
    return this.rows.filter(
      (row) =>
        row.record.status === "New" &&
        !row.reminderSentAt &&
        new Date(row.record.receivedAt) < receivedBefore,
    );
  }

  async markReminded(inquiry: StoredInquiry, at: Date): Promise<void> {
    inquiry.reminderSentAt = at.toISOString();
  }
}

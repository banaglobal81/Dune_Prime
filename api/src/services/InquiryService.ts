import { randomUUID } from "node:crypto";

import { autoReplyEmail } from "../domain/emails.js";
import {
  normalizeLocale,
  type InquirerType,
  type InquiryRecord,
  type InquirySubmission,
  type Owner,
} from "../domain/inquiry.js";
import { errorMessage } from "../adapters/logger.js";
import type { InquiryRepository, Logger, Mailer, SpamGuard } from "../ports.js";
import type { TeamNotifier } from "./TeamNotifier.js";

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; reason: "spam" }
  | { ok: false; reason: "storage_failed" };

interface InquiryServiceDeps {
  repository: InquiryRepository;
  mailer: Mailer;
  notifier: TeamNotifier;
  spamGuard: SpamGuard;
  owners: Partial<Record<InquirerType | "default", Owner>>;
  replyTo?: string;
  logger: Logger;
  /** Injectable clock and id for tests. */
  now?: () => Date;
  newId?: () => string;
}

/**
 * Handles one inquiry: spam check → store (must succeed) → auto-reply and team
 * alerts (best-effort, never lose the inquiry because an email failed).
 */
export class InquiryService {
  constructor(private readonly deps: InquiryServiceDeps) {}

  async submit(submission: InquirySubmission, clientIp?: string): Promise<SubmitResult> {
    const { repository, mailer, notifier, spamGuard, logger } = this.deps;

    const human = await spamGuard
      .verify(submission.turnstileToken, clientIp)
      .catch((error: unknown) => {
        logger.error("Spam check failed", { error: errorMessage(error) });
        return false;
      });
    if (!human) return { ok: false, reason: "spam" };

    const record = this.toRecord(submission);

    try {
      await repository.save(record);
    } catch (error) {
      logger.error("Could not store inquiry", { id: record.id, error: errorMessage(error) });
      return { ok: false, reason: "storage_failed" };
    }
    logger.info("Inquiry received", { id: record.id, type: record.type, owner: record.owner.name });

    const followUps = await Promise.allSettled([
      mailer.send(autoReplyEmail(record, this.deps.replyTo)),
      notifier.notifyNew(record),
    ]);
    for (const result of followUps) {
      if (result.status === "rejected") {
        logger.error("Inquiry follow-up failed", {
          id: record.id,
          error: errorMessage(result.reason),
        });
      }
    }

    return { ok: true, id: record.id };
  }

  private toRecord(submission: InquirySubmission): InquiryRecord {
    const now = this.deps.now?.() ?? new Date();
    return {
      id: this.deps.newId?.() ?? randomUUID(),
      receivedAt: now.toISOString(),
      name: submission.name,
      email: submission.email,
      type: submission.type,
      phone: submission.phone,
      message: submission.message,
      locale: normalizeLocale(submission.locale),
      consentAt: submission.consentAt,
      source: submission.source,
      status: "New",
      owner: this.ownerFor(submission.type),
    };
  }

  /** Each inquiry type has an owner (handoff v4.4, page 6). */
  private ownerFor(type: InquirerType): Owner {
    const { owners } = this.deps;
    return owners[type] ?? owners.default ?? { name: "Unassigned" };
  }
}

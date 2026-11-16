import { errorMessage } from "../adapters/logger.js";
import type { InquiryRepository, Logger } from "../ports.js";
import type { TeamNotifier } from "./TeamNotifier.js";

/**
 * Re-alerts the owner when an inquiry is still "New" after N hours
 * (handoff v4.4, page 6). Each inquiry is reminded once; the "Reminder sent"
 * column records it. Run on a schedule (Railway cron).
 */
export class ReminderService {
  constructor(
    private readonly repository: InquiryRepository,
    private readonly notifier: TeamNotifier,
    private readonly hours: number,
    private readonly logger: Logger,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async run(): Promise<{ reminded: number; failed: number }> {
    const now = this.now();
    const cutoff = new Date(now.getTime() - this.hours * 3_600_000);
    const overdue = await this.repository.findOverdue(cutoff);

    let reminded = 0;
    let failed = 0;
    for (const inquiry of overdue) {
      try {
        await this.notifier.notifyOverdue(inquiry.record, this.hours);
        await this.repository.markReminded(inquiry, now);
        reminded += 1;
      } catch (error) {
        failed += 1;
        this.logger.error("Reminder failed", { id: inquiry.record.id, error: errorMessage(error) });
      }
    }
    this.logger.info("Reminder run finished", { checked: overdue.length, reminded, failed });
    return { reminded, failed };
  }
}

import { reminderEmail, teamAlertEmail } from "../domain/emails.js";
import { INQUIRER_TYPE_LABELS, type InquiryRecord } from "../domain/inquiry.js";
import type { Logger, Mailer, WhatsAppSender } from "../ports.js";
import { errorMessage } from "../adapters/logger.js";

interface Recipients {
  emails: string[];
  whatsapp: string[];
}

/**
 * Alerts the team about inquiries by email and WhatsApp. The inquiry's owner is
 * alerted first; the team-wide lists are always included so nothing is missed.
 * Each channel is best-effort: one failing channel never blocks the other.
 */
export class TeamNotifier {
  constructor(
    private readonly mailer: Mailer,
    private readonly whatsapp: WhatsAppSender,
    private readonly team: Recipients,
    private readonly logger: Logger,
  ) {}

  async notifyNew(record: InquiryRecord): Promise<void> {
    const to = this.recipients(record);
    await this.deliver(record, to, {
      email: teamAlertEmail(record, to.emails),
      whatsappHeadline: "New inquiry",
    });
  }

  async notifyOverdue(record: InquiryRecord, hours: number): Promise<void> {
    const to = this.recipients(record);
    await this.deliver(record, to, {
      email: reminderEmail(record, to.emails, hours),
      whatsappHeadline: `Not contacted after ${hours}h`,
    });
  }

  private recipients(record: InquiryRecord): Recipients {
    const unique = (items: Array<string | undefined>) => [
      ...new Set(items.filter((i): i is string => Boolean(i))),
    ];
    return {
      emails: unique([record.owner.email, ...this.team.emails]),
      whatsapp: unique([record.owner.whatsapp, ...this.team.whatsapp]),
    };
  }

  private async deliver(
    record: InquiryRecord,
    to: Recipients,
    content: { email: ReturnType<typeof teamAlertEmail>; whatsappHeadline: string },
  ): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    if (to.emails.length) tasks.push(this.mailer.send(content.email));
    for (const phone of to.whatsapp) {
      tasks.push(
        this.whatsapp.send({
          to: phone,
          params: [
            content.whatsappHeadline,
            record.name,
            record.email,
            INQUIRER_TYPE_LABELS[record.type],
            record.owner.name,
          ],
        }),
      );
    }
    if (!tasks.length) {
      this.logger.warn("No team recipients configured; set TEAM_ALERT_EMAILS or INQUIRY_OWNERS", {
        id: record.id,
      });
      return;
    }
    const results = await Promise.allSettled(tasks);
    for (const result of results) {
      if (result.status === "rejected") {
        this.logger.error("Team alert failed", {
          id: record.id,
          error: errorMessage(result.reason),
        });
      }
    }
  }
}

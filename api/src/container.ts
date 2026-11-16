import { ConsoleLogger } from "./adapters/logger.js";
import { LogMailer, ResendMailer, SmtpMailer } from "./adapters/mail.js";
import { GoogleSheetsInquiryRepository, LogInquiryRepository } from "./adapters/sheets.js";
import { AllowAllGuard, TurnstileGuard } from "./adapters/turnstile.js";
import { LogWhatsAppSender, WhatsAppCloudSender } from "./adapters/whatsapp.js";
import type { AppConfig } from "./config.js";
import type { InquiryRepository, Logger, Mailer, SpamGuard, WhatsAppSender } from "./ports.js";
import { InquiryService } from "./services/InquiryService.js";
import { ReminderService } from "./services/ReminderService.js";
import { TeamNotifier } from "./services/TeamNotifier.js";

export interface Container {
  config: AppConfig;
  logger: Logger;
  repository: InquiryRepository;
  mailer: Mailer;
  whatsapp: WhatsAppSender;
  spamGuard: SpamGuard;
  notifier: TeamNotifier;
  inquiries: InquiryService;
  reminders: ReminderService;
}

/** Wires adapters from configuration: real integrations when configured, logging otherwise. */
export function buildContainer(config: AppConfig): Container {
  const logger = new ConsoleLogger(config.env === "production");

  const repository: InquiryRepository = config.sheets
    ? new GoogleSheetsInquiryRepository(config.sheets, logger)
    : new LogInquiryRepository(logger);

  const mailer: Mailer = config.mail.resendApiKey
    ? new ResendMailer(config.mail.resendApiKey, config.mail.from)
    : config.mail.smtp
      ? new SmtpMailer(config.mail.smtp, config.mail.from)
      : new LogMailer(logger);

  const whatsapp: WhatsAppSender = config.whatsapp
    ? new WhatsAppCloudSender(config.whatsapp)
    : new LogWhatsAppSender(logger);

  const spamGuard: SpamGuard = config.turnstileSecret
    ? new TurnstileGuard(config.turnstileSecret)
    : new AllowAllGuard();

  const notifier = new TeamNotifier(mailer, whatsapp, config.team, logger);

  const inquiries = new InquiryService({
    repository,
    mailer,
    notifier,
    spamGuard,
    owners: config.owners,
    replyTo: config.mail.replyTo,
    logger,
  });

  const reminders = new ReminderService(repository, notifier, config.reminderAfterHours, logger);

  if (config.env === "production") {
    const missing = [
      repository.name === "log" && "Google Sheets (inquiries are NOT stored)",
      mailer.name === "log" && "email",
      spamGuard.name === "none" && "Turnstile",
    ].filter(Boolean);
    if (missing.length) logger.warn("Running without some integrations", { missing });
  }

  return {
    config,
    logger,
    repository,
    mailer,
    whatsapp,
    spamGuard,
    notifier,
    inquiries,
    reminders,
  };
}

export function integrationNames(c: Container): Record<string, string> {
  return {
    storage: c.repository.name,
    email: c.mailer.name,
    whatsapp: c.whatsapp.name,
    spam: c.spamGuard.name,
  };
}

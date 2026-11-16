import nodemailer, { type Transporter } from "nodemailer";

import type { EmailMessage, Logger, Mailer } from "../ports.js";

/** Sends email through the Resend HTTPS API (works on hosts that block SMTP ports). */
export class ResendMailer implements Mailer {
  readonly name = "resend";

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: this.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
  }
}

/** Sends email over SMTP (e.g. Google Workspace or Microsoft 365). */
export class SmtpMailer implements Mailer {
  readonly name = "smtp";
  private readonly transporter: Transporter;

  constructor(
    smtp: { host: string; port: number; secure: boolean; user?: string; pass?: string },
    private readonly from: string,
  ) {
    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
      connectionTimeout: 10_000,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    });
  }
}

/** Development fallback: logs emails instead of sending them. */
export class LogMailer implements Mailer {
  readonly name = "log";

  constructor(private readonly logger: Logger) {}

  async send(message: EmailMessage): Promise<void> {
    this.logger.info("Email not sent (no mail provider configured)", {
      to: message.to,
      subject: message.subject,
    });
  }
}

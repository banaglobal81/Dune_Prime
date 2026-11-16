import type { Logger, WhatsAppMessage, WhatsAppSender } from "../ports.js";

interface WhatsAppConfig {
  token: string;
  phoneNumberId: string;
  template: string;
  language: string;
  apiVersion: string;
}

/**
 * Sends team alerts through the WhatsApp Cloud API (Meta).
 * Messages a business starts must use an approved template; create one named
 * WHATSAPP_TEMPLATE whose body has placeholders in this order:
 *   {{1}} headline, {{2}} name, {{3}} email, {{4}} inquiry type, {{5}} owner
 */
export class WhatsAppCloudSender implements WhatsAppSender {
  readonly name = "whatsapp-cloud";

  constructor(private readonly config: WhatsAppConfig) {}

  async send(message: WhatsAppMessage): Promise<void> {
    const { apiVersion, phoneNumberId, token, template, language } = this.config;
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: message.to.replace(/\D/g, ""),
          type: "template",
          template: {
            name: template,
            language: { code: language },
            components: [
              {
                type: "body",
                // Template parameters cannot contain new lines or long runs of spaces.
                parameters: message.params.map((text) => ({
                  type: "text",
                  text: text.replace(/\s+/g, " ").slice(0, 200) || "-",
                })),
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      throw new Error(`WhatsApp ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
  }
}

/** Development fallback: logs WhatsApp alerts instead of sending them. */
export class LogWhatsAppSender implements WhatsAppSender {
  readonly name = "log";

  constructor(private readonly logger: Logger) {}

  async send(message: WhatsAppMessage): Promise<void> {
    this.logger.info("WhatsApp alert not sent (WhatsApp not configured)", {
      to: message.to,
      params: message.params,
    });
  }
}

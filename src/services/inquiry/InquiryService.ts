import { siteConfig } from "@/config/site";
import { collectAttribution } from "./attribution";
import { InquiryValidator } from "./InquiryValidator";
import { formatPhone } from "./phone";
import { DemoInquiryTransport, HttpInquiryTransport, type InquiryTransport } from "./transports";
import type { InquiryInput, InquiryPayload, InquiryResult } from "./types";

/** Validates, enriches and delivers inquiries. The UI only talks to this class. */
export class InquiryService {
  constructor(
    private readonly transport: InquiryTransport,
    private readonly validator = new InquiryValidator(),
  ) {}

  /** `true` while no endpoint is configured and inquiries are only simulated. */
  get isDemo(): boolean {
    return this.transport instanceof DemoInquiryTransport;
  }

  async submit(
    input: InquiryInput,
    context: { locale: string; consentAt: string },
  ): Promise<InquiryResult> {
    const errors = this.validator.validate(input);
    if (!this.validator.isValid(errors)) return { ok: false, reason: "invalid", errors };

    // Honeypot filled in: a bot. Pretend success and drop it.
    if (input.company.trim()) return { ok: true };

    try {
      await this.transport.send(this.toPayload(input, context));
      return { ok: true };
    } catch (error) {
      console.error("[inquiry] delivery failed", error);
      return { ok: false, reason: "failed" };
    }
  }

  private toPayload(
    input: InquiryInput,
    context: { locale: string; consentAt: string },
  ): InquiryPayload {
    return {
      name: input.name.trim(),
      email: input.email.trim(),
      type: input.type,
      phone: formatPhone(input.phoneRegion, input.phoneNumber),
      message: input.message.trim(),
      locale: context.locale,
      consentAt: context.consentAt,
      submittedAt: new Date().toISOString(),
      source: collectAttribution(),
      ...(input.turnstileToken ? { turnstileToken: input.turnstileToken } : {}),
    };
  }
}

/** Builds the service from site configuration: HTTP when an endpoint is set, demo otherwise. */
export function createInquiryService(): InquiryService {
  const { endpoint } = siteConfig.inquiry;
  const transport = endpoint ? new HttpInquiryTransport(endpoint) : new DemoInquiryTransport();
  return new InquiryService(transport);
}

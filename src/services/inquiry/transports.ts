import type { InquiryPayload } from "./types";

/** Delivers an inquiry somewhere. Implementations throw on failure. */
export interface InquiryTransport {
  send(payload: InquiryPayload): Promise<void>;
}

/** Sends the inquiry as JSON to the back-end endpoint (Cloudflare Worker). */
export class HttpInquiryTransport implements InquiryTransport {
  constructor(
    private readonly endpoint: string,
    private readonly timeoutMs = 15_000,
  ) {}

  async send(payload: InquiryPayload): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Inquiry endpoint responded ${response.status}`);
      }
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Demo mode, used while no endpoint is configured. Nothing leaves the browser;
 * the payload is logged so the integration can be checked in the console.
 */
export class DemoInquiryTransport implements InquiryTransport {
  constructor(private readonly delayMs = 700) {}

  async send(payload: InquiryPayload): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    console.info("[inquiry:demo] Not sent. Set NEXT_PUBLIC_FORM_ENDPOINT to deliver.", payload);
  }
}

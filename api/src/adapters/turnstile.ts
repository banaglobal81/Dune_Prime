import type { SpamGuard } from "../ports.js";

/** Verifies Cloudflare Turnstile tokens server-side. */
export class TurnstileGuard implements SpamGuard {
  readonly name = "turnstile";

  constructor(private readonly secret: string) {}

  async verify(token: string | undefined, ip: string | undefined): Promise<boolean> {
    if (!token) return false;
    const body = new URLSearchParams({ secret: this.secret, response: token });
    if (ip) body.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  }
}

/** Used while Turnstile is not configured. The form's honeypot and rate limiting still apply. */
export class AllowAllGuard implements SpamGuard {
  readonly name = "none";

  async verify(): Promise<boolean> {
    return true;
  }
}

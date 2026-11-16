import { Hono, type Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { z } from "zod";

import { inquirySubmissionSchema } from "../domain/inquiry.js";
import type { Logger } from "../ports.js";
import type { InquiryService } from "../services/InquiryService.js";
import { RateLimiter } from "./rateLimit.js";

interface AppDeps {
  inquiries: InquiryService;
  allowedOrigins: string[];
  rateLimit: { max: number; windowMs: number };
  logger: Logger;
  /** Integration names for the health endpoint (e.g. { storage: "google-sheets" }). */
  integrations: Record<string, string>;
  /** Fallback client IP when no proxy header is present. */
  remoteAddress?: (c: Context) => string | undefined;
}

/**
 * HTTP API.
 *   GET  /health     → 200 { ok, integrations }   (Railway health check)
 *   POST /inquiries  → 201 { ok, id }
 *                      400 { ok:false, error:"invalid", fields:[...] }
 *                      403 { ok:false, error:"spam" }
 *                      413 / 415 / 429 / 503
 */
export function createApp(deps: AppDeps) {
  const app = new Hono();
  const limiter = new RateLimiter(deps.rateLimit.max, deps.rateLimit.windowMs);

  app.use("*", secureHeaders());
  app.use(
    "*",
    cors({
      origin: (origin) => (deps.allowedOrigins.includes(origin) ? origin : null),
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Accept"],
      maxAge: 86_400,
    }),
  );

  app.get("/health", (c) => c.json({ ok: true, integrations: deps.integrations }));

  app.post(
    "/inquiries",
    bodyLimit({
      maxSize: 32 * 1024,
      onError: (c) => c.json({ ok: false, error: "too_large" }, 413),
    }),
    async (c) => {
      const ip = clientIp(c) ?? deps.remoteAddress?.(c);
      const retryAfter = limiter.hit(ip ?? "unknown");
      if (retryAfter > 0) {
        c.header("Retry-After", String(retryAfter));
        return c.json({ ok: false, error: "rate_limited" }, 429);
      }

      if (!c.req.header("content-type")?.includes("application/json")) {
        return c.json({ ok: false, error: "unsupported_media_type" }, 415);
      }

      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        return c.json({ ok: false, error: "invalid", fields: [] }, 400);
      }

      const parsed = inquirySubmissionSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ ok: false, error: "invalid", fields: invalidFields(parsed.error) }, 400);
      }

      const result = await deps.inquiries.submit(parsed.data, ip);
      if (result.ok) return c.json({ ok: true, id: result.id }, 201);
      if (result.reason === "spam") return c.json({ ok: false, error: "spam" }, 403);
      return c.json({ ok: false, error: "unavailable" }, 503);
    },
  );

  app.notFound((c) => c.json({ ok: false, error: "not_found" }, 404));
  app.onError((error, c) => {
    deps.logger.error("Unhandled error", { error: error.message, path: c.req.path });
    return c.json({ ok: false, error: "server_error" }, 500);
  });

  return app;
}

/** First address in X-Forwarded-For (set by Railway's proxy). */
function clientIp(c: Context): string | undefined {
  const forwarded = c.req.header("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || c.req.header("x-real-ip") || undefined;
}

function invalidFields(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((issue) => issue.path.join(".")).filter(Boolean))];
}

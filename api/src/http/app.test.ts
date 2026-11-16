import { describe, expect, it } from "vitest";

import { InquiryService } from "../services/InquiryService.js";
import { TeamNotifier } from "../services/TeamNotifier.js";
import {
  FakeGuard,
  FakeMailer,
  FakeRepository,
  FakeWhatsApp,
  silentLogger,
  websitePayload,
} from "../test/fakes.js";
import { createApp } from "./app.js";

const ORIGIN = "https://www.dunepr.com";

function setup(options: { allow?: boolean; max?: number } = {}) {
  const repository = new FakeRepository();
  const mailer = new FakeMailer();
  const notifier = new TeamNotifier(
    mailer,
    new FakeWhatsApp(),
    { emails: ["team@dunepr.com"], whatsapp: [] },
    silentLogger,
  );
  const inquiries = new InquiryService({
    repository,
    mailer,
    notifier,
    spamGuard: new FakeGuard(options.allow ?? true),
    owners: {},
    logger: silentLogger,
  });
  const app = createApp({
    inquiries,
    allowedOrigins: [ORIGIN],
    rateLimit: { max: options.max ?? 5, windowMs: 60_000 },
    logger: silentLogger,
    integrations: { storage: "fake" },
  });
  return { app, repository };
}

const post = (body: unknown, headers: Record<string, string> = {}) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: ORIGIN,
    "X-Forwarded-For": "203.0.113.7",
    ...headers,
  },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

describe("HTTP API", () => {
  it("reports health", async () => {
    const { app } = setup();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, integrations: { storage: "fake" } });
  });

  it("accepts a valid inquiry from the website origin", async () => {
    const { app, repository } = setup();
    const res = await app.request("/inquiries", post(websitePayload()));
    expect(res.status).toBe(201);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(repository.rows).toHaveLength(1);
  });

  it("answers CORS preflight only for allowed origins", async () => {
    const { app } = setup();
    const allowed = await app.request("/inquiries", {
      method: "OPTIONS",
      headers: { Origin: ORIGIN, "Access-Control-Request-Method": "POST" },
    });
    expect(allowed.headers.get("access-control-allow-origin")).toBe(ORIGIN);

    const other = await app.request("/inquiries", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" },
    });
    expect(other.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("returns the invalid fields", async () => {
    const { app } = setup();
    const res = await app.request("/inquiries", post(websitePayload({ email: "bad" })));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "invalid", fields: ["email"] });
  });

  it("rejects malformed JSON and other content types", async () => {
    const { app } = setup();
    expect((await app.request("/inquiries", post("{not json"))).status).toBe(400);
    expect(
      (await app.request("/inquiries", post("x", { "Content-Type": "text/plain" }))).status,
    ).toBe(415);
  });

  it("rejects bodies over 32 KB", async () => {
    const { app } = setup();
    const res = await app.request(
      "/inquiries",
      post(websitePayload({ message: "x".repeat(40_000) })),
    );
    expect(res.status).toBe(413);
  });

  it("returns 403 for spam", async () => {
    const { app, repository } = setup({ allow: false });
    const res = await app.request("/inquiries", post(websitePayload()));
    expect(res.status).toBe(403);
    expect(repository.rows).toHaveLength(0);
  });

  it("rate-limits by client IP", async () => {
    const { app } = setup({ max: 2 });
    const send = () => app.request("/inquiries", post(websitePayload()));
    expect((await send()).status).toBe(201);
    expect((await send()).status).toBe(201);
    const limited = await send();
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);

    const otherClient = await app.request(
      "/inquiries",
      post(websitePayload(), { "X-Forwarded-For": "198.51.100.2" }),
    );
    expect(otherClient.status).toBe(201);
  });

  it("returns 503 when the inquiry cannot be stored", async () => {
    const { app, repository } = setup();
    repository.failNextSave = true;
    expect((await app.request("/inquiries", post(websitePayload()))).status).toBe(503);
  });
});

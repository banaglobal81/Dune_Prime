import { describe, expect, it } from "vitest";

import { inquirySubmissionSchema } from "../domain/inquiry.js";
import {
  FakeGuard,
  FakeMailer,
  FakeRepository,
  FakeWhatsApp,
  silentLogger,
  websitePayload,
} from "../test/fakes.js";
import { InquiryService } from "./InquiryService.js";
import { ReminderService } from "./ReminderService.js";
import { TeamNotifier } from "./TeamNotifier.js";

const NOW = new Date("2026-11-16T10:00:00.000Z");

function setup(options: { allow?: boolean } = {}) {
  const repository = new FakeRepository();
  const mailer = new FakeMailer();
  const whatsapp = new FakeWhatsApp();
  const notifier = new TeamNotifier(
    mailer,
    whatsapp,
    { emails: ["team@duneprime.com"], whatsapp: [] },
    silentLogger,
  );
  const service = new InquiryService({
    repository,
    mailer,
    notifier,
    spamGuard: new FakeGuard(options.allow ?? true),
    owners: {
      investor: { name: "Investor desk", email: "invest@duneprime.com", whatsapp: "+971500000001" },
      default: { name: "Front desk" },
    },
    logger: silentLogger,
    now: () => NOW,
    newId: () => "inq-1",
  });
  return { repository, mailer, whatsapp, notifier, service };
}

const parse = (overrides = {}) => inquirySubmissionSchema.parse(websitePayload(overrides));

describe("inquiry schema", () => {
  it("accepts the website payload and normalises it", () => {
    const data = parse();
    expect(data.name).toBe("Sara Kim");
    expect(data.email).toBe("sara@example.com");
  });

  it("rejects missing name, bad email, unknown type and missing consent time", () => {
    const result = inquirySubmissionSchema.safeParse(
      websitePayload({ name: " ", email: "nope", type: "hacker", consentAt: undefined }),
    );
    expect(result.success).toBe(false);
    const fields = result.error!.issues.map((i) => i.path.join("."));
    expect(fields).toEqual(expect.arrayContaining(["name", "email", "type", "consentAt"]));
  });

  it("caps message length", () => {
    expect(
      inquirySubmissionSchema.safeParse(websitePayload({ message: "x".repeat(4001) })).success,
    ).toBe(false);
  });
});

describe("InquiryService", () => {
  it("stores the inquiry, routes it to the owner, replies and alerts", async () => {
    const { service, repository, mailer, whatsapp } = setup();
    const result = await service.submit(parse());

    expect(result).toEqual({ ok: true, id: "inq-1" });
    const record = repository.rows[0]!.record;
    expect(record).toMatchObject({
      status: "New",
      locale: "ko",
      receivedAt: NOW.toISOString(),
      owner: { name: "Investor desk" },
    });

    const autoReply = mailer.sent.find((m) => m.to[0] === "sara@example.com");
    expect(autoReply?.subject).toContain("문의가 접수되었습니다");
    expect(autoReply?.replyTo).toBe("invest@duneprime.com");

    const alert = mailer.sent.find((m) => m.subject.startsWith("New inquiry"));
    expect(alert?.to).toEqual(["invest@duneprime.com", "team@duneprime.com"]);
    expect(whatsapp.sent).toHaveLength(1);
    expect(whatsapp.sent[0]!.params).toEqual([
      "New inquiry",
      "Sara Kim",
      "sara@example.com",
      "Investor",
      "Investor desk",
    ]);
  });

  it("falls back to the default owner", async () => {
    const { service, repository } = setup();
    await service.submit(parse({ type: "owner" }));
    expect(repository.rows[0]!.record.owner.name).toBe("Front desk");
  });

  it("rejects spam before storing anything", async () => {
    const { service, repository, mailer } = setup({ allow: false });
    expect(await service.submit(parse())).toEqual({ ok: false, reason: "spam" });
    expect(repository.rows).toHaveLength(0);
    expect(mailer.sent).toHaveLength(0);
  });

  it("reports failure when the inquiry cannot be stored, and sends nothing", async () => {
    const { service, repository, mailer } = setup();
    repository.failNextSave = true;
    expect(await service.submit(parse())).toEqual({ ok: false, reason: "storage_failed" });
    expect(mailer.sent).toHaveLength(0);
  });

  it("still succeeds when email delivery fails (the inquiry is already stored)", async () => {
    const { service, repository, mailer } = setup();
    mailer.fail = true;
    expect((await service.submit(parse())).ok).toBe(true);
    expect(repository.rows).toHaveLength(1);
  });
});

describe("ReminderService", () => {
  it("re-alerts once for inquiries still New after the threshold", async () => {
    const { service, repository, mailer, notifier } = setup();
    await service.submit(parse());
    mailer.sent = [];

    const later = new Date(NOW.getTime() + 25 * 3_600_000);
    const reminders = new ReminderService(repository, notifier, 24, silentLogger, () => later);

    expect(await reminders.run()).toEqual({ reminded: 1, failed: 0 });
    expect(mailer.sent[0]?.subject).toMatch(/^Not contacted after 24h/);
    expect(await reminders.run()).toEqual({ reminded: 0, failed: 0 });
  });

  it("skips inquiries that were contacted or are not yet overdue", async () => {
    const { service, repository, notifier } = setup();
    await service.submit(parse());
    const early = new ReminderService(
      repository,
      notifier,
      24,
      silentLogger,
      () => new Date(NOW.getTime() + 3_600_000),
    );
    expect((await early.run()).reminded).toBe(0);

    repository.rows[0]!.record.status = "Contacted";
    const late = new ReminderService(
      repository,
      notifier,
      24,
      silentLogger,
      () => new Date(NOW.getTime() + 48 * 3_600_000),
    );
    expect((await late.run()).reminded).toBe(0);
  });
});

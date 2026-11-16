import { describe, expect, it } from "vitest";

import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("treats empty variables as unset and falls back to logging adapters", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      SMTP_PORT: "",
      INQUIRY_OWNERS: "",
      GOOGLE_SHEET_ID: "",
      RESEND_API_KEY: " ",
      ALLOWED_ORIGINS: "",
    });
    expect(config.sheets).toBeUndefined();
    expect(config.mail.resendApiKey).toBeUndefined();
    expect(config.owners).toEqual({});
    expect(config.allowedOrigins).toEqual(["https://www.duneprime.com", "https://duneprime.com"]);
  });

  it("parses owners, lists and the private key", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      ALLOWED_ORIGINS: "https://www.duneprime.com, https://x.up.railway.app",
      TEAM_ALERT_EMAILS: "a@duneprime.com,b@duneprime.com",
      INQUIRY_OWNERS: '{"investor":{"name":"Investor desk","email":"invest@duneprime.com"}}',
      GOOGLE_SHEET_ID: "sheet",
      GOOGLE_SERVICE_ACCOUNT_EMAIL: "svc@project.iam.gserviceaccount.com",
      GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    });
    expect(config.allowedOrigins).toEqual([
      "https://www.duneprime.com",
      "https://x.up.railway.app",
    ]);
    expect(config.team.emails).toEqual(["a@duneprime.com", "b@duneprime.com"]);
    expect(config.owners.investor?.name).toBe("Investor desk");
    expect(config.sheets?.privateKey).toContain("\nabc\n");
  });

  it("rejects invalid owners JSON with a clear message", () => {
    expect(() => loadConfig({ INQUIRY_OWNERS: "{not json" })).toThrow(/INQUIRY_OWNERS/);
  });
});

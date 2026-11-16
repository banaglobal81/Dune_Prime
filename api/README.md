# Dune Prime — Inquiry API

Receives inquiries from the website form and runs the Phase 1 pipeline from the
Developer Handoff v4.4 (pages 5–6):

1. Validate the data again on the server, check Cloudflare Turnstile, rate-limit per IP
2. Store the inquiry as a row in the shared Google Sheet (status `New`, owner by type)
3. Send the visitor an auto-reply in their language (EN/KO)
4. Alert the owner and the team by email and WhatsApp
5. Hourly job: re-alert inquiries still `New` after 24 hours (once per inquiry)

The inquiry is stored before any email is sent, so a failed email never loses an inquiry.
Every integration is optional: until its variables are set, the API logs instead of
sending, and `/health` shows which integrations are live.

## Endpoints

| Method | Path         | Response                                                                                |
| ------ | ------------ | --------------------------------------------------------------------------------------- |
| GET    | `/health`    | `200 { ok, integrations: { storage, email, whatsapp, spam } }`                          |
| POST   | `/inquiries` | `201 { ok, id }`                                                                        |
|        |              | `400 { ok:false, error:"invalid", fields:["email", …] }`                                |
|        |              | `403` spam · `413` too large · `415` not JSON · `429` rate limited · `503` storage down |

Request body: see `src/domain/inquiry.ts` (matches `InquiryPayload` in the website).

## Commands

```bash
npm install
npm run dev        # http://localhost:4000, reloads on change
npm test           # unit + HTTP tests (no network)
npm run typecheck
npm run build      # compile to dist/
npm start          # run dist/server.js
npm run remind     # run the 24-hour reminder once
```

## Code map

| Folder             | Contents                                                                      |
| ------------------ | ----------------------------------------------------------------------------- |
| `src/domain/`      | Inquiry schema and types, email texts                                         |
| `src/services/`    | `InquiryService` (pipeline), `TeamNotifier`, `ReminderService`                |
| `src/adapters/`    | Google Sheets, Resend/SMTP, WhatsApp Cloud, Turnstile, plus logging fallbacks |
| `src/ports.ts`     | Interfaces the services depend on (swap an adapter without touching services) |
| `src/http/`        | Hono app: CORS, body limit, security headers, rate limit, routes              |
| `src/container.ts` | Picks adapters from configuration                                             |
| `src/config.ts`    | Environment variables, validated at start-up                                  |
| `src/jobs/`        | Scheduled reminder job                                                        |

## Google Sheet

Columns are written automatically on the first inquiry:

`Date · Name · Email · Type · Timing · Message · Consent time · Source (UTM) · Status · Owner · Locale · Page · Referrer · ID · Reminder sent`

The team updates **Status** (`New → Contacted → Meeting → NDA → Materials → Agreement`) and
**Owner** by hand. Values are written as plain text (RAW), so nothing a visitor types can run
as a spreadsheet formula.

## Deploy on Railway

The `api` and `reminder` services are defined in `../.railway/railway.ts` (both build from
`/api`; the reminder runs `npm run remind` hourly and exits). The website's
`NEXT_PUBLIC_FORM_ENDPOINT` points at this API's Railway domain automatically.

Set the integration secrets from `.env.example` on the **api** service (dashboard → api →
Variables). The reminder service references the api's values, so set them once. The config
file declares them with `preserve()`, so `railway config apply` never overwrites them.

## Notes

- The rate limiter is in memory: correct for one API instance. Use a shared store if you scale out.
- Auto-replies go to the address the visitor typed. Turnstile + rate limiting stop this being
  abused to send mail to strangers; keep Turnstile on in production.
- WhatsApp business-initiated messages require an approved template (see `.env.example`).

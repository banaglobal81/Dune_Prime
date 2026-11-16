# Dune Prime Holiday Homes — website

Static Next.js site, deployed on Railway, rebuilt from the v4.4 design reference
(`20261116_Dune Prime 웹사이트_v4.4`) following the Developer Handoff v4.4.

- English at `/`, Korean at `/ko/` (linked with hreflang)
- Pages: Home, Story, Portfolio (switched off)
- Every page is pre-rendered to HTML at build time, so all copy is readable by search engines

## Commands

```bash
npm install
npm run dev        # http://localhost:3000 (generates images first)
npm run build      # static export into out/ (generates images first)
npm start          # serves out/ on $PORT (default 3000), as in production
npm run lint
npm run typecheck
npm run format
```

## Deployment (Railway)

Railway project `dune-prime` has three services, all defined in
[`.railway/railway.ts`](.railway/railway.ts) (Railway Infrastructure as Code):

| Service    | What                                    | Source          |
| ---------- | --------------------------------------- | --------------- |
| `website`  | This static site, served by `npm start` | repository root |
| `api`      | Inquiry API (`api/README.md`)           | `/api`          |
| `reminder` | Hourly 24-hour follow-up job (cron)     | `/api`          |

To change services, edit that file and run `railway config plan`, then `railway config apply`
(the CLI must be linked: `railway link`). Railway reads it only on plan/apply, not on deploy.
Pushing to `main` deploys the services whose files changed (watch paths).

`npm start` serves the static `out/` folder with `serve`; `public/serve.json` configures
trailing-slash URLs, the 404 page, caching and security headers.

Website variables (baked into the HTML at build time, so redeploy after changing them):

- `NEXT_PUBLIC_SITE_URL` = `https://dunepr.com` (canonical URLs, sitemap, share images)
- `NEXT_PUBLIC_FORM_ENDPOINT` = the API's `/inquiries` URL (set automatically; empty = demo mode)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = Cloudflare Turnstile site key (set in the dashboard; empty = no widget)

API secrets (Google Sheet, Resend, team alerts, Turnstile secret) are set in the dashboard on the
`api` service; the `reminder` service references them. See `api/.env.example`.

Custom domain `dunepr.com` is attached to the `website` service. DNS is on Cloudflare (proxied);
Railway detects the proxy. `www.dunepr.com` should redirect to `dunepr.com` with a Cloudflare
Redirect Rule.

The site is plain static files, so it can also be hosted on Cloudflare Pages or any static host
(output directory `out`) without code changes.

## Where things live

| What                                                         | Where                                                                |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Launch settings: contact details, section switches, endpoint | `src/config/site.ts`                                                 |
| All copy, per language                                       | `src/i18n/dictionaries/en.ts`, `ko.ts`                               |
| Languages and URLs                                           | `src/i18n/config.ts`                                                 |
| Photos (source files)                                        | `assets/photos/` + registry in `src/content/photos.ts`               |
| Homes in the carousel                                        | `src/content/homes.ts`                                               |
| Inquiry pipeline (back-end boundary)                         | `src/services/inquiry/`                                              |
| SEO: metadata, hreflang, JSON-LD                             | `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`          |
| Colours, spacing, type                                       | `src/styles/globals.css` (`:root` tokens)                            |
| Pages                                                        | `src/components/pages/`; routes in `src/app/(en)/` and `src/app/ko/` |

## Back end: inquiry API (`api/`)

The back end lives in [`api/`](api/README.md): a small Node service (Hono + TypeScript) that
validates each inquiry, stores it in the Google Sheet, sends the visitor an auto-reply, alerts
the team by email and WhatsApp, and re-alerts after 24 hours. It deploys as its own Railway
service (Root Directory `api`). See `api/README.md` and `api/.env.example`.

The form POSTs JSON to `NEXT_PUBLIC_FORM_ENDPOINT`. While it is empty the site runs in
**demo mode**: nothing is sent and the payload is logged to the browser console.

Contract: `src/services/inquiry/types.ts` (`InquiryPayload`). It maps to the sheet columns in
the handoff (date, name, email, type, timing, message, consent time, UTM source):

```json
{
  "name": "…",
  "email": "…",
  "type": "investor | owner | broker | financial_partner | other",
  "timing": "…",
  "message": "…",
  "locale": "en",
  "consentAt": "2026-11-16T09:12:00.000Z",
  "submittedAt": "2026-11-16T09:12:30.000Z",
  "source": { "page": "/", "referrer": "…", "utm": { "source": "linkedin", "campaign": "launch" } }
}
```

With Turnstile on, the payload also carries `turnstileToken`. Any 2xx response counts as
success; anything else shows an error to the visitor. A hidden honeypot field drops simple
bots before sending.

## Switches and placeholders

Section switches in `src/config/site.ts` → `features`:

| Switch      | Shows                                      | Now                                                      |
| ----------- | ------------------------------------------ | -------------------------------------------------------- |
| `team`      | Team photo + intro on Story                | on (AI photo, labelled)                                  |
| `reviews`   | Guest reviews on Story                     | off (sample text only)                                   |
| `portfolio` | `/portfolio/` page + "View all homes" link | off                                                      |
| `banner`    | Notice bar above the header                | off                                                      |
| `chat`      | "Chat with us" tab in the inquiry section  | off (mount point: `src/components/inquiry/ChatSlot.tsx`) |

Before launch:

- [ ] Real email and WhatsApp in `siteConfig.contact`, then `isDemo: false` (demo values are shown but not linked)
- [ ] Inquiry API deployed with the Google Sheet and email configured (`api/README.md`)
- [ ] `NEXT_PUBLIC_FORM_ENDPOINT` set to the API, and Turnstile keys set on both sides
- [ ] Real photos for Unit 603, the villa and the team (AI images are labelled "Illustrative image")
- [ ] Legal review of investor wording, projections and consent text
- [ ] GA4 + cookie consent (`src/services/analytics.ts` is ready; events: `generate_lead`, `whatsapp_click`)
- [ ] Privacy policy and terms pages

## Adding a language

1. Add the code to `LOCALES` and `LOCALE_META` in `src/i18n/config.ts`.
2. Add `src/i18n/dictionaries/<code>.ts` typed as `Dictionary` (TypeScript flags any missing text).
3. Copy `src/app/ko/` to `src/app/<code>/` and change `LOCALE`.

## Images

`npm run images` (runs automatically before dev/build) converts `assets/photos/*.jpg` into
responsive WebP files in `public/images/` and share images in `public/og/`. Both folders are
generated and not committed. To add a photo: put the JPG in `assets/photos/` and register it
in `src/content/photos.ts` with its pixel size.

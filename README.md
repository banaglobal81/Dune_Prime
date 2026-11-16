# Dune Prime Holiday Homes — website

Static Next.js site for Cloudflare Pages, rebuilt from the v4.4 design reference
(`20261116_Dune Prime 웹사이트_v4.4`) following the Developer Handoff v4.4.

- English at `/`, Korean at `/ko/` (linked with hreflang)
- Pages: Home, Story, Portfolio (switched off)
- Every page is pre-rendered to HTML at build time, so all copy is readable by search engines

## Commands

```bash
npm install
npm run dev        # http://localhost:3000 (generates images first)
npm run build      # static export into out/ (generates images first)
npm run lint
npm run typecheck
npm run format
```

Cloudflare Pages: build command `npm run build`, output directory `out`.

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

## For the back end: inquiry endpoint

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

Any 2xx response counts as success; anything else shows an error to the visitor. The Worker
should validate again server-side, verify Turnstile (to add), write the sheet row, send the
auto-reply and alert the team. A hidden honeypot field drops simple bots before sending.

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
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain
- [ ] `NEXT_PUBLIC_FORM_ENDPOINT` set to the Worker
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

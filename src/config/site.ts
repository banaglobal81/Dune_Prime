/**
 * Site-wide settings. This is the one file to edit for launch values.
 *
 * Environment variables (set in Railway → Variables, before the build):
 *   NEXT_PUBLIC_SITE_URL       Public origin, default https://www.duneprime.com (canonical URLs, sitemap, OG)
 *   NEXT_PUBLIC_FORM_ENDPOINT  Inquiry API URL (api/ service). Empty = demo mode, nothing is sent.
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY  Cloudflare Turnstile site key. Empty = no anti-spam widget.
 */

export interface ContactDetails {
  /** Public email shown on the site. */
  email: string;
  /** Public WhatsApp number in international format, shown as written. */
  whatsapp: string;
  /**
   * `true` while the values above are placeholders. Demo values are displayed
   * but never linked, so no visitor can email or message a number we do not own.
   */
  isDemo: boolean;
}

export interface FeatureFlags {
  /** Guest reviews on the Story page. Turn on when real reviews exist. */
  reviews: boolean;
  /** Team photo and intro after the Story hero. */
  team: boolean;
  /** All-homes page and "View all homes" link. Turn on with 3+ homes with real photos. */
  portfolio: boolean;
  /** Notice banner at the very top. Turn on when there is news to announce. */
  banner: boolean;
  /** "Chat with us" tab in the inquiry section. Turn on once the AI chat widget is connected. */
  chat: boolean;
}

export const siteConfig = {
  name: "Dune Prime Holiday Homes",
  legalName: "Dune Prime Holiday Homes L.L.C.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.duneprime.com").replace(/\/$/, ""),
  licence: "1657365",
  foundingYear: 2026,
  address: { locality: "Dubai", country: "AE" },

  // DEMO contact details: replace with the real public email and WhatsApp number, then set isDemo to false.
  contact: {
    email: "hello@duneprime.com",
    whatsapp: "+971 50 000 0000",
    isDemo: true,
  } satisfies ContactDetails,

  // Section switches (Developer Handoff v4.4, page 7).
  features: {
    reviews: false,
    team: true,
    portfolio: false,
    banner: false,
    chat: false,
  } satisfies FeatureFlags,

  inquiry: {
    endpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
    /** Cloudflare Turnstile site key (public). Empty = no widget; the API must then run without TURNSTILE_SECRET_KEY. */
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  },
} as const;

export type SiteConfig = typeof siteConfig;

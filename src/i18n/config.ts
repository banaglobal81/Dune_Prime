/**
 * Locale and URL configuration.
 *
 * English is served at the root ("/"), every other locale under its own prefix ("/ko/").
 * To add a language: add it to LOCALES and LOCALE_META, add a dictionary in
 * `src/i18n/dictionaries/`, and add a route folder mirroring `src/app/ko/`.
 */

export const LOCALES = ["en", "ko", "th"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

interface LocaleMeta {
  /** Label in the language switcher, written in that language. */
  label: string;
  /** Language code shown on the closed switcher. */
  shortLabel: string;
  /** Round flag icon in the switcher. */
  flag: `/flags/${string}.svg`;
  /** BCP 47 tag for hreflang and <html lang>. */
  hreflang: string;
  /** Open Graph locale. */
  ogLocale: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    label: "English",
    shortLabel: "EN",
    flag: "/flags/gb.svg",
    hreflang: "en",
    ogLocale: "en_US",
  },
  ko: {
    label: "한국어",
    shortLabel: "KO",
    flag: "/flags/kr.svg",
    hreflang: "ko",
    ogLocale: "ko_KR",
  },
  th: { label: "ไทย", shortLabel: "TH", flag: "/flags/th.svg", hreflang: "th", ogLocale: "th_TH" },
};

/** Every page of the site, as a path relative to the locale root. */
export const ROUTES = {
  home: "/",
  story: "/story/",
  portfolio: "/portfolio/",
} as const;
export type RouteKey = keyof typeof ROUTES;

/** Builds a locale-aware path, e.g. ("ko", "story") → "/ko/story/", ("en", "home", "contact") → "/#contact". */
export function localizedPath(locale: Locale, route: RouteKey, hash?: string): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const path = `${prefix}${ROUTES[route]}`;
  return hash ? `${path}#${hash}` : path;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

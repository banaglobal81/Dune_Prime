/**
 * Locale and URL configuration.
 *
 * English is served at the root ("/"), every other locale under its own prefix ("/ko/").
 * To add a language (e.g. Thai): add it to LOCALES and LOCALE_META, add a dictionary in
 * `src/i18n/dictionaries/`, and add a route folder `src/app/th/` mirroring `src/app/ko/`.
 */

export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

interface LocaleMeta {
  /** Label in the language switcher, written in that language. */
  label: string;
  /** Short label for small screens. */
  shortLabel: string;
  /** BCP 47 tag for hreflang and <html lang>. */
  hreflang: string;
  /** Open Graph locale. */
  ogLocale: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { label: "English", shortLabel: "EN", hreflang: "en", ogLocale: "en_US" },
  ko: { label: "한국어", shortLabel: "한국어", hreflang: "ko", ogLocale: "ko_KR" },
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

import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALES,
  localizedPath,
  type Locale,
  type RouteKey,
} from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const OG_IMAGE: Partial<Record<RouteKey, string>> = {
  home: "/og/home.jpg",
  story: "/og/story.jpg",
};

/** Absolute URL for a site path. */
export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

/** hreflang map for one route: every locale plus x-default (English). */
export function languageAlternates(route: RouteKey): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[LOCALE_META[locale].hreflang] = absoluteUrl(localizedPath(locale, route));
  }
  languages["x-default"] = absoluteUrl(localizedPath(DEFAULT_LOCALE, route));
  return languages;
}

/** Metadata shared by every page of one locale (set in the root layout). */
export function buildLayoutMetadata(locale: Locale, dict: Dictionary): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: dict.meta.home.title, template: `%s · ${dict.meta.siteName}` },
    description: dict.meta.home.description,
    applicationName: dict.meta.siteName,
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
      siteName: dict.meta.siteName,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      type: "website",
    },
  };
}

/** Full per-page metadata: title, description, canonical, hreflang, Open Graph and Twitter. */
export function buildPageMetadata(locale: Locale, route: RouteKey, dict: Dictionary): Metadata {
  const page = dict.meta[route];
  const url = absoluteUrl(localizedPath(locale, route));
  const image = OG_IMAGE[route] ?? OG_IMAGE.home!;
  const isHome = route === "home";

  return {
    // The home title is complete on its own; other pages use the layout template.
    title: isHome ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: url, languages: languageAlternates(route) },
    // Page-level openGraph replaces the layout's object (no deep merge), so repeat the shared fields.
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      title: isHome ? page.title : `${page.title} · ${dict.meta.siteName}`,
      description: page.description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: dict.meta.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: isHome ? page.title : `${page.title} · ${dict.meta.siteName}`,
      description: page.description,
      images: [image],
    },
  };
}

/** Schema.org graph for the business and the website. */
export function organizationJsonLd(locale: Locale, dict: Dictionary) {
  const homeUrl = absoluteUrl(localizedPath(locale, "home"));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        "@id": `${siteConfig.url}/#business`,
        name: siteConfig.legalName,
        alternateName: siteConfig.name,
        url: siteConfig.url,
        logo: absoluteUrl("/brand/icon-512.png"),
        image: absoluteUrl("/og/home.jpg"),
        description: dict.meta.home.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.address.locality,
          addressCountry: siteConfig.address.country,
        },
        areaServed: { "@type": "City", name: "Dubai" },
        ...(siteConfig.contact.isDemo ? {} : { email: siteConfig.contact.email }),
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: homeUrl,
        name: siteConfig.name,
        inLanguage: LOCALE_META[locale].hreflang,
        publisher: { "@id": `${siteConfig.url}/#business` },
      },
    ],
  };
}

/** FAQPage structured data. Only used where the same questions are visible on the page. */
export function faqJsonLd(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

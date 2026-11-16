import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { LOCALES, ROUTES, localizedPath, type RouteKey } from "@/i18n/config";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

export const dynamic = "force-static";

/** Every public page in every language, with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = (Object.keys(ROUTES) as RouteKey[]).filter(
    (route) => route !== "portfolio" || siteConfig.features.portfolio,
  );
  const lastModified = new Date();

  return routes.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, route)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: route === "home" ? 1 : 0.7,
      alternates: { languages: languageAlternates(route) },
    })),
  );
}

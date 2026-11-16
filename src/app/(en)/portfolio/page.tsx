import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PortfolioPage } from "@/components/pages/PortfolioPage";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo";

const LOCALE = "en";

// Off until features.portfolio is enabled (3+ homes with real photos).
export const metadata: Metadata = siteConfig.features.portfolio
  ? buildPageMetadata(LOCALE, "portfolio", getDictionary(LOCALE))
  : { robots: { index: false, follow: false } };

export default function Page() {
  if (!siteConfig.features.portfolio) notFound();
  return <PortfolioPage locale={LOCALE} />;
}

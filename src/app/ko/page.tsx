import type { Metadata } from "next";

import { HomePage } from "@/components/pages/HomePage";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo";

const LOCALE = "ko";

export const metadata: Metadata = buildPageMetadata(LOCALE, "home", getDictionary(LOCALE));

export default function Page() {
  return <HomePage locale={LOCALE} />;
}

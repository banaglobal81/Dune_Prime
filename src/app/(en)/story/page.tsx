import type { Metadata } from "next";

import { StoryPage } from "@/components/pages/StoryPage";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo";

const LOCALE = "en";

export const metadata: Metadata = buildPageMetadata(LOCALE, "story", getDictionary(LOCALE));

export default function Page() {
  return <StoryPage locale={LOCALE} />;
}

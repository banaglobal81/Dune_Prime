import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@/styles/globals.css";

import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { LOCALE_META, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { organizationJsonLd } from "@/lib/seo";

/** <html> and <body> for one locale. Used by each locale's root layout. */
export function RootDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const dict = getDictionary(locale);
  return (
    <html lang={LOCALE_META[locale].hreflang}>
      <body>
        {children}
        <JsonLd data={organizationJsonLd(locale, dict)} />
      </body>
    </html>
  );
}

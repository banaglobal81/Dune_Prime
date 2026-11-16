import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { RootDocument } from "@/components/layout/RootDocument";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildLayoutMetadata } from "@/lib/seo";

const LOCALE = "en";

export const metadata: Metadata = buildLayoutMetadata(LOCALE, getDictionary(LOCALE));

export const viewport: Viewport = {
  themeColor: "#e9e9eb",
  viewportFit: "cover",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <RootDocument locale={LOCALE}>{children}</RootDocument>;
}

import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import type { Locale, RouteKey } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

interface PageShellProps {
  locale: Locale;
  route: RouteKey;
  dict: Dictionary;
  children: ReactNode;
}

/** Skip link, optional banner, header, main content and footer, shared by every page. */
export function PageShell({ locale, route, dict, children }: PageShellProps) {
  return (
    <>
      <a className="skip-link" href="#main">
        {dict.nav.skipToContent}
      </a>
      {siteConfig.features.banner ? <AnnouncementBanner locale={locale} dict={dict} /> : null}
      <SiteHeader locale={locale} route={route} dict={dict} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter locale={locale} dict={dict} />
    </>
  );
}

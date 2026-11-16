import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { LOCALE_META, LOCALES, localizedPath, type Locale, type RouteKey } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./SiteHeader.module.css";

interface SiteHeaderProps {
  locale: Locale;
  route: RouteKey;
  dict: Dictionary;
}

export function SiteHeader({ locale, route, dict }: SiteHeaderProps) {
  // On the Story page the nav link returns home; everywhere else it opens the Story.
  const navTarget: RouteKey = route === "story" ? "home" : "story";

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link
          href={localizedPath(locale, "home")}
          className={styles.logo}
          aria-label={dict.nav.homeLink}
        >
          {/* Plain <img>: tiny vector files that need no optimisation. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.mark} src="/brand/logo-mark.svg" alt="" width={43} height={38} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.wordmark}
            src="/brand/logo-wordmark.svg"
            alt=""
            width={131}
            height={29}
          />
        </Link>

        <Link href={localizedPath(locale, navTarget)} className={styles.navLink}>
          {navTarget === "story" ? dict.nav.story : dict.nav.home}
        </Link>

        <nav className={styles.lang} aria-label={dict.nav.language}>
          {LOCALES.map((l) => (
            <a
              key={l}
              href={localizedPath(l, route)}
              hrefLang={LOCALE_META[l].hreflang}
              lang={LOCALE_META[l].hreflang}
              aria-current={l === locale ? "true" : undefined}
              className={styles.langLink}
            >
              {LOCALE_META[l].shortLabel}
            </a>
          ))}
        </nav>

        <ButtonLink href={localizedPath(locale, "home", "contact")} className={styles.cta}>
          {dict.nav.inquiry}
        </ButtonLink>
      </div>
    </header>
  );
}

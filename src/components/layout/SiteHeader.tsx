import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { localizedPath, type Locale, type RouteKey } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { HeaderFrame } from "./HeaderFrame";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import styles from "./SiteHeader.module.css";

export interface NavItem {
  href: string;
  label: string;
  current?: boolean;
}

interface SiteHeaderProps {
  locale: Locale;
  route: RouteKey;
  dict: Dictionary;
}

/** Sections of the home page and the Story page, in reading order. */
function navItems(locale: Locale, route: RouteKey, dict: Dictionary): NavItem[] {
  const home = (hash: string) => localizedPath(locale, "home", hash);
  return [
    { href: home("how"), label: dict.nav.operating },
    { href: home("units"), label: dict.nav.homes },
    { href: home("faq"), label: dict.nav.faq },
    { href: localizedPath(locale, "story"), label: dict.nav.story, current: route === "story" },
  ];
}

export function SiteHeader({ locale, route, dict }: SiteHeaderProps) {
  const items = navItems(locale, route, dict);
  const cta: NavItem = { href: localizedPath(locale, "home", "contact"), label: dict.nav.inquiry };

  return (
    <HeaderFrame className={styles.header}>
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

        <nav className={styles.nav} aria-label={dict.nav.menu}>
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.end}>
          <LanguageSwitcher locale={locale} route={route} label={dict.nav.language} />
          <ButtonLink href={cta.href} className={styles.cta}>
            {cta.label}
          </ButtonLink>
          <MobileMenu label={dict.nav.menu} items={items} cta={cta} />
        </div>
      </div>
    </HeaderFrame>
  );
}

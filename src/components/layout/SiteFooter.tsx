import Link from "next/link";

import { siteConfig } from "@/config/site";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { ContactValue } from "./ContactLinks";
import styles from "./SiteFooter.module.css";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const home = (hash?: string) => localizedPath(locale, "home", hash);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <Link href={home()} className={styles.logo} aria-label={dict.nav.homeLink}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-full-ivory.svg" alt="" width={170} height={144} />
          </Link>
          <p className={styles.about}>{dict.footer.about}</p>
        </div>

        <nav aria-label={dict.footer.explore}>
          <h2 className={styles.heading}>{dict.footer.explore}</h2>
          <ul className={styles.list}>
            <li>
              <Link href={home("about")}>{dict.nav.about}</Link>
            </li>
            <li>
              <Link href={localizedPath(locale, "story")}>{dict.nav.story}</Link>
            </li>
            <li>
              <Link href={home("units")}>{dict.nav.homes}</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={dict.footer.company}>
          <h2 className={styles.heading}>{dict.footer.company}</h2>
          <ul className={styles.list}>
            <li>
              <Link href={home("operating")}>{dict.nav.operating}</Link>
            </li>
            <li>
              <Link href={home("partners")}>{dict.nav.partners}</Link>
            </li>
            <li>
              <Link href={home("faq")}>{dict.nav.faq}</Link>
            </li>
            <li>
              <Link href={home("contact")}>{dict.nav.inquiry}</Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className={styles.heading}>{dict.footer.contact}</h2>
          <address className={styles.list}>
            <span>{dict.footer.location}</span>
            <ContactValue channel="email" location="footer" />
            <ContactValue channel="whatsapp" location="footer" />
            <Link href={home("contact")}>{dict.nav.inquiry}</Link>
            <span>{dict.footer.licence}</span>
          </address>
        </div>
      </div>

      <div className={styles.legal}>
        <p>{dict.footer.disclaimer}</p>
        <p>{dict.footer.credits}</p>
        <p>
          © {year} {siteConfig.legalName} · {dict.footer.licensedBy} · {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}

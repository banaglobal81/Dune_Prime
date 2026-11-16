import Link from "next/link";

import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./AnnouncementBanner.module.css";

/** Notice bar above the header. Shown only when `features.banner` is on. */
export function AnnouncementBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className={styles.banner} role="region" aria-label={dict.banner.text}>
      <span>{dict.banner.text}</span>{" "}
      <Link href={localizedPath(locale, "home", "contact")} className={styles.link}>
        {dict.banner.link}
      </Link>
    </div>
  );
}

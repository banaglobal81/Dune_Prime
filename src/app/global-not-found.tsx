import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@/styles/globals.css";

import type { Metadata } from "next";

import { localizedPath } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { ko } from "@/i18n/dictionaries/ko";
import styles from "./global-not-found.module.css";

export const metadata: Metadata = {
  title: `${en.meta.notFound.title} · ${en.meta.siteName}`,
};

/** Shared 404 for both locales (the site has two root layouts). Bilingual on purpose. */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className={styles.page}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.svg" alt="Dune Prime Holiday Homes" width={54} height={48} />
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>{en.meta.notFound.title}</h1>
          <p className={styles.body}>{en.meta.notFound.body}</p>
          <p className={styles.body} lang="ko">
            {ko.meta.notFound.body}
          </p>
          <p className={styles.links}>
            <a href={localizedPath("en", "home")}>{en.meta.notFound.back}</a>
            <a href={localizedPath("ko", "home")} lang="ko">
              {ko.meta.notFound.back}
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}

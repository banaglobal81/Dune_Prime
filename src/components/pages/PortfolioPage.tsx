import { PageShell } from "@/components/layout/PageShell";
import { SectionHead } from "@/components/sections/SectionHead";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { LISTED_HOMES } from "@/content/homes";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import styles from "./PortfolioPage.module.css";

/** All contracted homes. Built but only routed when `features.portfolio` is on. */
export function PortfolioPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const homes = dict.home.homes;

  return (
    <PageShell locale={locale} route="portfolio" dict={dict}>
      <Section>
        <SectionHead
          title={dict.portfolio.title}
          aside={<p className="lead">{dict.portfolio.lead}</p>}
        />
        <ul className={styles.grid}>
          {LISTED_HOMES.map((home) => (
            <li key={home.id}>
              <article className={styles.card}>
                <figure className={styles.figure}>
                  <Photo
                    photo={home.photo}
                    alt={homes[home.copyKey].imageAlt}
                    sizes="(max-width: 520px) 100vw, (max-width: 860px) 50vw, 33vw"
                    className={styles.image}
                  />
                </figure>
                <span className={`lab dim ${styles.tag}`}>{homes[home.copyKey].tag}</span>
                <h2 className={styles.title}>{homes[home.copyKey].title}</h2>
              </article>
            </li>
          ))}
        </ul>
      </Section>
    </PageShell>
  );
}

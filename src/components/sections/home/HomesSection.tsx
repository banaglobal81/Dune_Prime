import { ButtonLink, TextLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import { HOMES, type HomeEntry } from "@/content/homes";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { SectionHead } from "../SectionHead";
import { HomesCarousel } from "./HomesCarousel";
import styles from "./HomesSection.module.css";

interface Props {
  locale: Locale;
  dict: Dictionary;
}

export function HomesSection({ locale, dict }: Props) {
  const copy = dict.home.homes;
  const viewAll = siteConfig.features.portfolio ? (
    <TextLink href={localizedPath(locale, "portfolio")} className={styles.viewAll}>
      {copy.viewAll}
    </TextLink>
  ) : null;

  return (
    <Section id="units" tone="paper" aria-labelledby="units-title">
      <SectionHead
        title={copy.title}
        titleId="units-title"
        aside={<p className="lead">{copy.lead}</p>}
      />
      <HomesCarousel
        label={copy.carouselLabel}
        previousLabel={copy.previous}
        nextLabel={copy.next}
        slideLabel={copy.slideLabel}
        trailing={viewAll}
      >
        {HOMES.map((home) => (
          <HomeSlide key={home.id} home={home} locale={locale} dict={dict} />
        ))}
      </HomesCarousel>
    </Section>
  );
}

function HomeSlide({ home, locale, dict }: { home: HomeEntry; locale: Locale; dict: Dictionary }) {
  const copy = dict.home.homes;
  return (
    <article className={styles.slideInner}>
      <figure className={styles.figure}>
        <Photo
          photo={home.photo}
          alt={copy[home.copyKey].imageAlt}
          sizes="(max-width: 860px) 100vw, 55vw"
          illustrativeLabel={dict.common.illustrative}
          className={styles.image}
        />
      </figure>
      <div className={styles.details}>
        {home.kind === "listing" ? (
          <>
            <span className="lab dim">{copy[home.copyKey].tag}</span>
            <h3 className={styles.title}>{copy[home.copyKey].title}</h3>
            <p className={styles.body}>{copy[home.copyKey].body}</p>
            <ul className={styles.facts}>
              {copy[home.copyKey].facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <span className="lab dim">{copy.nextHome.tag}</span>
            <h3 className={styles.title}>{copy.nextHome.title}</h3>
            <p className={styles.body}>{copy.nextHome.body}</p>
            <ButtonLink href={localizedPath(locale, "home", "contact")} className={styles.cta}>
              {copy.nextHome.cta}
            </ButtonLink>
          </>
        )}
      </div>
    </article>
  );
}

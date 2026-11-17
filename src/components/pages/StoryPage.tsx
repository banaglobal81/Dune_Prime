import { PageShell } from "@/components/layout/PageShell";
import { ImageHero } from "@/components/sections/ImageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { SplitFeature } from "@/components/sections/SplitFeature";
import { StatRow } from "@/components/sections/StatRow";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import styles from "./StoryPage.module.css";

/** Story: Dubai and our story, told in photo scenes and figures (Developer Handoff v4.4, page 2). */
export function StoryPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { story } = dict;
  const { features } = siteConfig;

  return (
    <PageShell locale={locale} route="story" dict={dict}>
      <ImageHero
        photo="story"
        alt={story.hero.imageAlt}
        title={story.hero.title}
        lead={story.hero.lead}
        variant="page"
      />

      {features.team ? (
        <Section aria-labelledby="team-title">
          <SplitFeature photo="team" alt={story.team.imageAlt} shape="wide">
            <span className="lab dim">{story.team.eyebrow}</span>
            <h2 id="team-title" className={styles.teamTitle}>
              {story.team.title}
            </h2>
            {story.team.paragraphs.map((text) => (
              <p key={text} className={styles.teamText}>
                {text}
              </p>
            ))}
          </SplitFeature>
        </Section>
      ) : null}

      <ImageHero
        photo="hero"
        alt={story.scenes.evenings.imageAlt}
        title={story.scenes.evenings.title}
        variant="scene"
      />

      <Section aria-labelledby="story-intro-title">
        <SectionHead
          title={story.intro.title}
          titleId="story-intro-title"
          aside={story.intro.paragraphs.map((text) => (
            <p key={text} className="lead">
              {text}
            </p>
          ))}
        />
      </Section>

      <ImageHero
        photo="loc"
        alt={story.scenes.sunsets.imageAlt}
        title={story.scenes.sunsets.title}
        variant="scene"
      />
      <ImageHero
        photo="palm"
        alt={story.scenes.coastline.imageAlt}
        title={story.scenes.coastline.title}
        variant="scene"
      />

      <Section flushTop>
        <StatRow label={story.plan.label} items={story.plan.items} note={story.plan.note} />
      </Section>

      <ImageHero
        photo="part"
        alt={story.scenes.water.imageAlt}
        title={story.scenes.water.title}
        variant="scene"
      />

      <Section flushTop>
        <StatRow label={story.market.label} items={story.market.items} note={story.market.note} />
      </Section>

      <Section aria-labelledby="inspect-title">
        <SplitFeature photo="villa" alt={story.inspect.imageAlt}>
          <h2 id="inspect-title" className={styles.inspectTitle}>
            {story.inspect.title}
          </h2>
          <p className="lead">{story.inspect.lead}</p>
          {story.inspect.items.map((item) => (
            <div key={item.title} className={styles.point}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </SplitFeature>
      </Section>

      {features.reviews ? (
        <Section tone="paper" aria-labelledby="reviews-title">
          <SectionHead title={story.reviews.title} titleId="reviews-title" />
          <div className={styles.voices}>
            {story.reviews.items.map((quote, index) => (
              <figure key={quote} className={index === 0 ? styles.featured : undefined}>
                <blockquote>{quote}</blockquote>
              </figure>
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="dark" aria-labelledby="story-cta-title">
        <h2 id="story-cta-title" className={styles.ctaTitle}>
          {story.cta.title}
        </h2>
        <p className={`lead ${styles.ctaLead}`}>{dict.inquiry.lead}</p>
        <ButtonLink
          href={localizedPath(locale, "home", "contact")}
          variant="outlineOnDark"
          className={styles.ctaButton}
        >
          {dict.nav.inquiry}
        </ButtonLink>
      </Section>
    </PageShell>
  );
}

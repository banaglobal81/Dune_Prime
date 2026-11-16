import { InquirySection } from "@/components/inquiry/InquirySection";
import { PageShell } from "@/components/layout/PageShell";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { FaqSection } from "@/components/sections/home/FaqSection";
import { GallerySection } from "@/components/sections/home/GallerySection";
import { HomesSection } from "@/components/sections/home/HomesSection";
import { ImageHero } from "@/components/sections/ImageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { SplitFeature } from "@/components/sections/SplitFeature";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { localizedPath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { faqJsonLd } from "@/lib/seo";
import styles from "./HomePage.module.css";

/** Home: value proposition, trust, homes and inquiry (Developer Handoff v4.4, page 2). */
export function HomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { home } = dict;
  const contactHref = localizedPath(locale, "home", "contact");

  return (
    <PageShell locale={locale} route="home" dict={dict}>
      <ImageHero
        photo="hero"
        alt={home.hero.imageAlt}
        title={home.hero.title}
        lead={home.hero.lead}
        variant="page"
      >
        <div className={styles.facts}>
          <FeatureGrid items={home.facts} variant="labelled" columns={3} rule={false} />
        </div>
      </ImageHero>

      <Section id="about" aria-labelledby="about-title">
        <SplitFeature
          photo="about"
          alt={home.about.imageAlt}
          illustrativeLabel={dict.common.illustrative}
        >
          <h2 id="about-title">{home.about.title}</h2>
          {home.about.paragraphs.map((text) => (
            <p key={text} className="lead">
              {text}
            </p>
          ))}
          <p>
            <ButtonLink href={localizedPath(locale, "story")}>{home.about.storyLink}</ButtonLink>
          </p>
        </SplitFeature>
      </Section>

      <Section id="principles" flushTop aria-labelledby="principles-title">
        <SectionHead title={home.principles.title} titleId="principles-title" />
        <FeatureGrid items={home.principles.items} variant="headed" columns={3} />
      </Section>

      <Section tone="dark" aria-labelledby="model-title">
        <h2 id="model-title" className={styles.bandTitle}>
          {home.model.title}
        </h2>
        <p className={`lead ${styles.bandLead}`}>{home.model.lead}</p>
        <div className={styles.model}>
          <FeatureGrid items={home.model.steps} variant="boxed" columns={4} ordered />
        </div>
        <p className={styles.bandCta}>
          <TextLink href={contactHref} tone="onDark">
            {home.model.cta}
          </TextLink>
        </p>
      </Section>

      <GallerySection dict={dict} />

      <HomesSection locale={locale} dict={dict} />

      <InquirySection locale={locale} dict={dict} />

      <Section id="operating" aria-labelledby="operating-title">
        <SectionHead
          title={home.operating.title}
          titleId="operating-title"
          aside={<p className="lead">{home.operating.lead}</p>}
        />
        <FeatureGrid items={home.operating.items} variant="labelled" columns={4} />
        <p className={styles.operatingCta}>
          <ButtonLink href={contactHref}>{home.operating.cta}</ButtonLink>
        </p>
      </Section>

      <Section id="partners" flushTop aria-labelledby="partners-title">
        <SplitFeature photo="part" alt={home.partners.imageAlt} imageRight>
          <h2 id="partners-title" className={styles.partnersTitle}>
            {home.partners.title}
          </h2>
          {home.partners.paragraphs.map((text) => (
            <p key={text} className="lead">
              {text}
            </p>
          ))}
        </SplitFeature>
      </Section>

      <FaqSection dict={dict} />
      <JsonLd data={faqJsonLd(home.faq.items)} />
    </PageShell>
  );
}

import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { SectionHead } from "@/components/sections/SectionHead";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./OperatingSection.module.css";
import { StatementCard } from "./StatementCard";

/** "Every dirham, accounted for": what the monthly statement covers, beside a sample of one. */
export function OperatingSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = dict.home.operating;
  return (
    <Section id="operating" aria-labelledby="operating-title">
      <SectionHead
        title={copy.title}
        titleId="operating-title"
        aside={<p className="lead">{copy.lead}</p>}
      />
      <div className={styles.layout}>
        <div>
          <FeatureGrid items={copy.items} variant="labelled" columns={2} />
          <p className={styles.cta}>
            <ButtonLink href={localizedPath(locale, "home", "contact")}>{copy.cta}</ButtonLink>
          </p>
        </div>
        <StatementCard locale={locale} copy={copy.statement} />
      </div>
    </Section>
  );
}

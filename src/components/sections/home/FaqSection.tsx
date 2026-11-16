import { Section } from "@/components/ui/Section";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./FaqSection.module.css";

/** FAQ accordion built on <details>: works without JavaScript and is fully indexable. */
export function FaqSection({ dict }: { dict: Dictionary }) {
  const { faq } = dict.home;
  return (
    <Section id="faq" aria-labelledby="faq-title">
      <div className={styles.wrap}>
        <h2 id="faq-title">{faq.title}</h2>
        <div className={styles.list}>
          {faq.items.map((item, index) => (
            <details key={item.q} className={styles.item} open={index === 0}>
              <summary className={styles.question}>{item.q}</summary>
              <p className={styles.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

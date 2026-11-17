import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./GallerySection.module.css";

/** Two-photo interlude: Palm Jumeirah and Burj Al Arab. */
export function GallerySection({ dict }: { dict: Dictionary }) {
  const { gallery } = dict.home;
  return (
    <Section className={styles.section}>
      <div className={styles.gallery}>
        <figure className={styles.wide}>
          <Photo
            photo="palm"
            alt={gallery.palmAlt}
            sizes="(max-width: 760px) 100vw, 60vw"
            className={styles.image}
          />
        </figure>
        <figure className={styles.tall}>
          <Photo
            photo="loc"
            alt={gallery.locAlt}
            sizes="(max-width: 760px) 100vw, 40vw"
            className={styles.image}
            objectPosition="22% 50%"
          />
        </figure>
      </div>
    </Section>
  );
}

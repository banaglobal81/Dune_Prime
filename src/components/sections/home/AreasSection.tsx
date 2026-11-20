import type { CSSProperties } from "react";

import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import type { Dictionary } from "@/i18n/get-dictionary";
import { SectionHead } from "../SectionHead";
import styles from "./AreasSection.module.css";

/** "Where we operate": the areas Dune Prime focuses on, each with a photo and a short note. */
export function AreasSection({ dict }: { dict: Dictionary }) {
  const { gallery } = dict.home;
  const areas = [
    {
      key: "palm",
      shape: styles.wide,
      copy: gallery.palm,
      alt: gallery.palmAlt,
      sizes: "(max-width: 760px) 100vw, 60vw",
      objectPosition: undefined,
    },
    {
      key: "loc",
      shape: styles.tall,
      copy: gallery.loc,
      alt: gallery.locAlt,
      sizes: "(max-width: 760px) 100vw, 40vw",
      objectPosition: "35% 50%",
    },
  ] as const;

  return (
    <Section id="areas" aria-labelledby="areas-title">
      <SectionHead
        title={gallery.title}
        titleId="areas-title"
        aside={<p className="lead">{gallery.lead}</p>}
      />
      <div className={styles.gallery}>
        {areas.map((area, index) => (
          <figure
            key={area.key}
            className={area.shape}
            data-reveal
            style={{ "--reveal-i": index } as CSSProperties}
          >
            <Photo
              photo={area.key}
              alt={area.alt}
              sizes={area.sizes}
              className={styles.image}
              objectPosition={area.objectPosition}
            />
            <figcaption className={styles.caption}>
              <h3 className={styles.name}>{area.copy.name}</h3>
              <p className={styles.body}>{area.copy.body}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

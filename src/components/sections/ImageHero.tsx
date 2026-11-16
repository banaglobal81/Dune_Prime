import type { ReactNode } from "react";

import { Photo } from "@/components/ui/Photo";
import type { PhotoKey } from "@/content/photos";
import styles from "./ImageHero.module.css";

interface ImageHeroProps {
  photo: PhotoKey;
  alt: string;
  title: string;
  /** "page" renders the page <h1> and loads the image eagerly; "scene" is a large photo interlude with an <h2>. */
  variant: "page" | "scene";
  lead?: string;
  /** Content under the image, e.g. the facts row on the home page. */
  children?: ReactNode;
}

/** Full-width photo with a caption overlaid at the bottom (v4.4 "hero" and "scene"). */
export function ImageHero({ photo, alt, title, variant, lead, children }: ImageHeroProps) {
  const Heading = variant === "page" ? "h1" : "h2";
  return (
    <section className={`${styles.hero} ${styles[variant]}`}>
      <div className={styles.frame}>
        <Photo
          photo={photo}
          alt={alt}
          fill
          eager={variant === "page"}
          sizes="100vw"
          className={styles.image}
        />
        <div className={styles.caption}>
          <Heading className={styles.title}>{title}</Heading>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

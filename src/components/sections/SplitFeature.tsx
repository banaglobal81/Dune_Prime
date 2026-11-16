import type { ReactNode } from "react";

import { Photo } from "@/components/ui/Photo";
import type { PhotoKey } from "@/content/photos";
import styles from "./SplitFeature.module.css";

interface SplitFeatureProps {
  photo: PhotoKey;
  alt: string;
  /** Put the image on the right on desktop. */
  imageRight?: boolean;
  /** "portrait" = 4:5 image (default); "wide" = 3:2 image with a 7:3 split. */
  shape?: "portrait" | "wide";
  illustrativeLabel?: string;
  /** Small caption under the image. */
  caption?: string;
  children: ReactNode;
}

/** Image beside text, stacked on mobile (v4.4 ".half" / ".tsplit"). */
export function SplitFeature({
  photo,
  alt,
  imageRight,
  shape = "portrait",
  illustrativeLabel,
  caption,
  children,
}: SplitFeatureProps) {
  const classes = [styles.split, styles[shape], imageRight && styles.imageRight]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <figure className={styles.figure}>
        <div className={styles.frame}>
          <Photo
            photo={photo}
            alt={alt}
            sizes="(max-width: 860px) 100vw, 60vw"
            illustrativeLabel={illustrativeLabel}
            className={styles.image}
          />
        </div>
        {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
      </figure>
      <div className={`stack ${styles.body}`}>{children}</div>
    </div>
  );
}

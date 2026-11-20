import type { ReactNode } from "react";

import styles from "./SectionHead.module.css";

interface SectionHeadProps {
  title: string;
  titleId?: string;
  /** Text to the right of the title on desktop, below it on mobile. */
  aside?: ReactNode;
}

/** Section title row: large heading left, optional lead right (v4.4 ".head"). */
export function SectionHead({ title, titleId, aside }: SectionHeadProps) {
  return (
    <div className={styles.head} data-reveal>
      <h2 id={titleId}>{title}</h2>
      {aside ? <div className={styles.aside}>{aside}</div> : null}
    </div>
  );
}

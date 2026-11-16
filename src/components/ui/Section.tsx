import type { ReactNode } from "react";

import styles from "./Section.module.css";

type Tone = "default" | "paper" | "dark";

interface SectionProps {
  id?: string;
  tone?: Tone;
  /** Removes top padding, for sections that continue the one above. */
  flushTop?: boolean;
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
}

/** Page section with the standard side gutters and vertical rhythm. */
export function Section({
  id,
  tone = "default",
  flushTop,
  className,
  children,
  ...rest
}: SectionProps) {
  const classes = [styles.section, styles[tone], flushTop && styles.flushTop, className]
    .filter(Boolean)
    .join(" ");
  return (
    <section id={id} className={classes} {...rest}>
      {children}
    </section>
  );
}

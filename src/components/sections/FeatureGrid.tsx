import type { CSSProperties } from "react";

import styles from "./FeatureGrid.module.css";

interface FeatureItem {
  title: string;
  body: string;
}

interface FeatureGridProps {
  items: ReadonlyArray<FeatureItem>;
  /**
   * "headed": title as an <h3> above muted text (principles).
   * "labelled": small uppercase label above strong text (reporting, facts).
   * "boxed": bordered cells for dark sections (operating model).
   */
  variant: "headed" | "labelled" | "boxed";
  columns: 2 | 3 | 4;
  /** Render as an ordered list when the order matters (steps). */
  ordered?: boolean;
  /** Draw the top rule. Off for the facts row under the hero. */
  rule?: boolean;
}

/** Grid of short title + text items, used across both pages. */
export function FeatureGrid({ items, variant, columns, ordered, rule = true }: FeatureGridProps) {
  const List = ordered ? "ol" : "ul";
  const classes = [styles.grid, styles[variant], styles[`cols${columns}`], rule && styles.rule]
    .filter(Boolean)
    .join(" ");

  return (
    <List className={classes}>
      {items.map((item, index) => (
        <li
          key={item.title}
          className={styles.item}
          data-reveal
          style={{ "--reveal-i": index } as CSSProperties}
        >
          {variant === "headed" ? (
            <>
              <h3 className={styles.heading}>{item.title}</h3>
              <p className={styles.body}>{item.body}</p>
            </>
          ) : (
            <>
              <span className={`lab ${styles.label}`}>{item.title}</span>
              <span className={styles.text}>{item.body}</span>
            </>
          )}
        </li>
      ))}
    </List>
  );
}

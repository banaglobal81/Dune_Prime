import type { CSSProperties } from "react";

import { CountUp } from "@/components/motion/CountUp";
import styles from "./StatRow.module.css";

interface StatRowProps {
  /** Accessible name for the group, e.g. "2027 plan". */
  label: string;
  items: ReadonlyArray<{ value: string; label: string }>;
  /** Required note under the figures (projection disclaimer or sources). */
  note: string;
}

/** Three large figures with labels and a mandatory note (v4.4 ".stats"). */
export function StatRow({ label, items, note }: StatRowProps) {
  return (
    <div>
      <dl className={styles.stats} aria-label={label}>
        {items.map((item, index) => (
          <div
            key={item.label}
            className={styles.stat}
            data-reveal
            style={{ "--reveal-i": index } as CSSProperties}
          >
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>
              <CountUp value={item.value} />
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>{note}</p>
    </div>
  );
}

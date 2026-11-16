import styles from "./ChatSlot.module.css";

/**
 * Mount point for the Phase 2 AI chat widget (Developer Handoff v4.4, page 7).
 * The widget must answer only from FAQ and home data, hand partnership questions to a
 * person, and save the conversation to the inquiry sheet. Replace the placeholder below.
 */
export function ChatSlot({ intro }: { intro: string }) {
  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{intro}</p>
      <div className={styles.box} data-chat-mount="">
        AI chat widget mounts here
      </div>
    </div>
  );
}

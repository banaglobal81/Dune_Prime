"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";

import { useDismiss } from "@/hooks/useDismiss";
import type { NavItem } from "./SiteHeader";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  label: string;
  items: ReadonlyArray<NavItem>;
  cta: NavItem;
}

/**
 * Menu button and drop-down panel for narrow screens (disclosure pattern).
 * The links stay in the static HTML while closed.
 */
export function MobileMenu({ label, items, cta }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, rootRef, triggerRef);

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.icon} aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      <nav id={panelId} className={styles.panel} aria-label={label} hidden={!open}>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={styles.link}
                aria-current={item.current ? "page" : undefined}
                onClick={close}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href={cta.href} className={styles.cta} onClick={close}>
          {cta.label}
        </Link>
      </nav>
    </div>
  );
}

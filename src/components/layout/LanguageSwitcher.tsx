"use client";

import { useEffect, useId, useRef, useState, type FocusEvent } from "react";

import { LOCALE_META, LOCALES, localizedPath, type Locale, type RouteKey } from "@/i18n/config";
import styles from "./LanguageSwitcher.module.css";

interface LanguageSwitcherProps {
  locale: Locale;
  route: RouteKey;
  /** Accessible name of the control, in the page language. */
  label: string;
}

function Flag({ locale }: { locale: Locale }) {
  return (
    <span className={styles.flag} aria-hidden="true">
      {/* Plain <img>: tiny vector files that need no optimisation. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOCALE_META[locale].flag} alt="" width={20} height={20} />
    </span>
  );
}

/**
 * Language dropdown (disclosure pattern). The links stay in the static HTML while closed,
 * so every language version remains crawlable.
 */
export function LanguageSwitcher({ locale, route, label }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Keyboard users tabbing past the last language close the list.
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && !event.currentTarget.contains(next)) setOpen(false);
  };

  const current = LOCALE_META[locale];

  return (
    <nav ref={rootRef} className={styles.root} aria-label={label} onBlur={onBlur}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current.label}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Flag locale={locale} />
        <span className={styles.code}>{current.shortLabel}</span>
        <svg className={styles.chevron} viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>

      <ul id={listId} className={styles.list} hidden={!open}>
        {LOCALES.map((item) => {
          const meta = LOCALE_META[item];
          const isCurrent = item === locale;
          return (
            <li key={item}>
              <a
                href={localizedPath(item, route)}
                hrefLang={meta.hreflang}
                lang={meta.hreflang}
                aria-current={isCurrent ? "true" : undefined}
                className={styles.option}
              >
                <Flag locale={item} />
                <span className={styles.name}>{meta.label}</span>
                {isCurrent ? (
                  <svg
                    className={styles.check}
                    viewBox="0 0 14 10"
                    width="14"
                    height="10"
                    aria-hidden="true"
                  >
                    <path d="M1 5l4 4 8-8" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

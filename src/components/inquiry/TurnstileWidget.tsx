"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

import styles from "./TurnstileWidget.module.css";

/** Name of the hidden input Turnstile adds to the form; read with FormData. */
export const TURNSTILE_FIELD = "cf-turnstile-response";

interface TurnstileApi {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  locale: string;
  /** Changing this value resets the widget (e.g. after a failed submit). */
  resetSignal: number;
}

/**
 * Cloudflare Turnstile anti-spam check (handoff v4.4, Phase 1). Rendered explicitly so it
 * also works after client-side navigation. The API verifies the token server-side.
 */
export function TurnstileWidget({ siteKey, locale, resetSignal }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const render = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "dark",
      language: locale,
      "response-field-name": TURNSTILE_FIELD,
    });
  }, [siteKey, locale]);

  useEffect(() => {
    render();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [render]);

  useEffect(() => {
    if (resetSignal > 0 && widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetSignal]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={render}
      />
      <div ref={containerRef} className={styles.widget} />
    </>
  );
}

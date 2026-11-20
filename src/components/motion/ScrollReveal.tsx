"use client";

import { useEffect } from "react";

/** Class on <html> that switches on the hidden "before reveal" state in globals.css. */
const READY_CLASS = "reveal-ready";

/**
 * Fades `[data-reveal]` elements in as they scroll into view.
 *
 * Progressive enhancement: the server HTML is fully visible. Only elements that start below
 * the fold are hidden, and only once this script runs, so nothing flashes and nothing stays
 * hidden without JavaScript. Skipped entirely when the visitor prefers reduced motion.
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const fold = window.innerHeight;
    for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      if (element.hasAttribute("data-revealed")) continue;
      if (element.getBoundingClientRect().top < fold) element.setAttribute("data-revealed", "");
      else observer.observe(element);
    }
    document.documentElement.classList.add(READY_CLASS);

    return () => observer.disconnect();
  }, []);

  return null;
}

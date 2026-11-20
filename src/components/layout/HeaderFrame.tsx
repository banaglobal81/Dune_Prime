"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Scroll distance after which the header slims down. */
const SCROLLED_AFTER_PX = 24;

/** The sticky <header>; marks itself `data-scrolled` once the page moves so CSS can slim it. */
export function HeaderFrame({ className, children }: { className: string; children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLLED_AFTER_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={className} data-scrolled={scrolled ? "" : undefined}>
      {children}
    </header>
  );
}

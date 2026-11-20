"use client";

import { useEffect, useRef } from "react";

const DURATION_MS = 1400;

interface ParsedFigure {
  prefix: string;
  value: number;
  suffix: string;
  decimals: number;
  grouped: boolean;
}

/** Splits a display figure such as "AED 3.7M", "19.6M" or "0%" into its animatable number. */
function parseFigure(text: string): ParsedFigure | null {
  const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/.exec(text);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const value = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(value) || value === 0) return null;
  return {
    prefix,
    value,
    suffix,
    decimals: digits.split(".")[1]?.length ?? 0,
    grouped: digits.includes(","),
  };
}

function render(figure: ParsedFigure, value: number): string {
  const number = value.toLocaleString("en-US", {
    minimumFractionDigits: figure.decimals,
    maximumFractionDigits: figure.decimals,
    useGrouping: figure.grouped,
  });
  return `${figure.prefix}${number}${figure.suffix}`;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * A figure that counts up from zero the first time it scrolls into view.
 * The final text is always in the HTML (and read by screen readers); only the visible copy animates.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const figure = parseFigure(value);
    if (!element || !figure) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    // Already on screen at load: show the final figure rather than flashing back to zero.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.textContent = render(figure, 0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          element.textContent = render(figure, figure.value * easeOutCubic(progress));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = value;
    };
  }, [value]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      <span className="visually-hidden">{value}</span>
    </>
  );
}

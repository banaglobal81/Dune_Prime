"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./HomesSection.module.css";

interface HomesCarouselProps {
  label: string;
  previousLabel: string;
  nextLabel: string;
  /** Pattern like "{current} of {total}". */
  slideLabel: string;
  /** Extra content on the right of the controls (e.g. "View all homes"). */
  trailing?: ReactNode;
  children: ReactNode;
}

/**
 * Scroll-snap carousel. Slides are server-rendered children; this component only adds
 * the previous/next buttons. Swipe and keyboard scrolling work natively.
 */
export function HomesCarousel({
  label,
  previousLabel,
  nextLabel,
  slideLabel,
  trailing,
  children,
}: HomesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const slides = Children.toArray(children);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setEdges({ atStart: track.scrollLeft <= 4, atEnd: track.scrollLeft >= maxScroll - 4 });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const scrollBySlide = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: track.clientWidth * direction,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={trackRef} className={styles.track} onScroll={updateEdges} tabIndex={0}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={slideLabel
              .replace("{current}", String(index + 1))
              .replace("{total}", String(slides.length))}
          >
            {slide}
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => scrollBySlide(-1)}
          disabled={edges.atStart}
          aria-label={previousLabel}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => scrollBySlide(1)}
          disabled={edges.atEnd}
          aria-label={nextLabel}
        >
          <span aria-hidden="true">→</span>
        </button>
        {trailing}
      </div>
    </div>
  );
}

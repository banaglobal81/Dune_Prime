/**
 * Photo registry. Source files live in `assets/photos/`; responsive WebP versions are
 * generated into `public/images/` at build time. Width and height are the source
 * dimensions and give next/image the aspect ratio (no layout shift).
 *
 * `illustrative: true` marks AI-generated or placeholder images. They are labelled on
 * the page (handoff rule: "Label illustrative images") until real photos replace them.
 */

export interface PhotoAsset {
  src: `/images/${string}.jpg`;
  width: number;
  height: number;
  illustrative?: boolean;
}

export const photos = {
  hero: { src: "/images/hero.jpg", width: 2200, height: 1100 },
  about: { src: "/images/about.jpg", width: 1800, height: 1028, illustrative: true },
  palm: { src: "/images/palm.jpg", width: 2600, height: 1407 },
  loc: { src: "/images/loc.jpg", width: 2200, height: 1460 },
  unit: { src: "/images/unit.jpg", width: 1800, height: 1028, illustrative: true },
  villa2: { src: "/images/villa2.jpg", width: 1800, height: 1215, illustrative: true },
  next: { src: "/images/next.jpg", width: 1800, height: 1350, illustrative: true },
  part: { src: "/images/part.jpg", width: 2200, height: 1437 },
  story: { src: "/images/story.jpg", width: 2200, height: 1409 },
  team: { src: "/images/team_group.jpg", width: 1800, height: 1200, illustrative: true },
  villa: { src: "/images/villa.jpg", width: 2200, height: 1189, illustrative: true },
} as const satisfies Record<string, PhotoAsset>;

export type PhotoKey = keyof typeof photos;

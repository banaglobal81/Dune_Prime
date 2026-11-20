/**
 * Photo registry. Source files live in `assets/photos/`; responsive WebP versions are
 * generated into `public/images/` at build time. Width and height are the source
 * dimensions and give next/image the aspect ratio (no layout shift).
 *
 * Replacing a photo? Use a new file name: the CDN caches images by URL for 30 days.
 */

export interface PhotoAsset {
  src: `/images/${string}.jpg`;
  width: number;
  height: number;
}

export const photos = {
  hero: { src: "/images/hero.jpg", width: 2200, height: 1100 },
  about: { src: "/images/about.jpg", width: 1800, height: 1028 },
  palm: { src: "/images/palm-jumeirah.jpg", width: 2600, height: 1197 },
  loc: { src: "/images/downtown-skyline.jpg", width: 2400, height: 1600 },
  unit: { src: "/images/unit.jpg", width: 1800, height: 1028 },
  villa2: { src: "/images/villa2.jpg", width: 1800, height: 1215 },
  next: { src: "/images/next.jpg", width: 1800, height: 1350 },
  part: { src: "/images/part.jpg", width: 2200, height: 1437 },
  story: { src: "/images/story.jpg", width: 2200, height: 1409 },
  team: { src: "/images/team_group.jpg", width: 1800, height: 1200 },
  villa: { src: "/images/villa.jpg", width: 2200, height: 1189 },
} as const satisfies Record<string, PhotoAsset>;

export type PhotoKey = keyof typeof photos;

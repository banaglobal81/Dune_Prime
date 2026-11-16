/**
 * Custom next/image loader for the static export.
 *
 * Source photos live in `assets/photos/` and are referenced as `/images/<name>.jpg`.
 * `scripts/optimize-images.mjs` writes `/images/<name>-<width>.webp` for every
 * configured width, so this loader only has to build that file name.
 */
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  if (!src.startsWith("/images/")) return src;
  const base = src.replace(/\.(jpe?g|png|webp)$/i, "");
  return `${base}-${width}.webp`;
}

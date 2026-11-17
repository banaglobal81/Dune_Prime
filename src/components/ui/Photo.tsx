import Image from "next/image";

import { photos, type PhotoKey } from "@/content/photos";

interface PhotoProps {
  photo: PhotoKey;
  alt: string;
  /** Responsive `sizes` hint for the browser, e.g. "(max-width: 860px) 100vw, 50vw". */
  sizes: string;
  /** Fill the parent box (parent must be positioned) instead of keeping intrinsic size. */
  fill?: boolean;
  /** Load immediately with high priority. Use only for the above-the-fold hero (LCP). */
  eager?: boolean;
  className?: string;
  objectPosition?: string;
}

/** next/image wrapper bound to the photo registry (source size gives the aspect ratio). */
export function Photo({ photo, alt, sizes, fill, eager, className, objectPosition }: PhotoProps) {
  const asset = photos[photo];
  const style = objectPosition ? { objectPosition } : undefined;

  return fill ? (
    <Image
      src={asset.src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      style={style}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
    />
  ) : (
    <Image
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      className={className}
      style={style}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
    />
  );
}

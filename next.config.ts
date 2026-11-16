import type { NextConfig } from "next";

/**
 * Static export for Cloudflare Pages (see Developer Handoff v4.4, Phase 1).
 * - Every route is pre-rendered to HTML at build time, so copy is in the HTML (SEO).
 * - Images are pre-optimised to WebP by `scripts/optimize-images.mjs`; the custom
 *   loader maps each requested width to its generated file.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Must match WIDTHS in scripts/optimize-images.mjs.
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2400],
    imageSizes: [384],
  },
  experimental: {
    // Two root layouts (English at "/", Korean at "/ko/") need one shared 404 page.
    globalNotFound: true,
  },
};

export default nextConfig;

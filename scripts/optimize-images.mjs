// Generates responsive WebP files and Open Graph images from the source photos.
//
//   assets/photos/<name>.jpg  ->  public/images/<name>-<width>.webp   (one per width)
//                             ->  public/og/<page>.jpg                 (1200x630 share images)
//
// Runs automatically before `npm run dev` and `npm run build`. Files are only
// regenerated when the source photo is newer than the output.
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "assets/photos");
const OUT_DIR = path.join(ROOT, "public/images");
const OG_DIR = path.join(ROOT, "public/og");
const LOGO = path.join(ROOT, "public/brand/logo-full-ivory.svg");

// Must match images.deviceSizes + images.imageSizes in next.config.ts.
const WIDTHS = [384, 640, 828, 1080, 1280, 1600, 1920, 2400];
const QUALITY = 72;

// Share images per page: [output name, source photo].
const OG_IMAGES = [
  ["home", "hero"],
  ["story", "story"],
];

async function isFresh(output, sourceMtime) {
  try {
    return (await stat(output)).mtimeMs >= sourceMtime;
  } catch {
    return false;
  }
}

async function buildResponsive(file) {
  const name = path.parse(file).name;
  const input = path.join(SRC_DIR, file);
  const { mtimeMs } = await stat(input);
  let written = 0;
  for (const width of WIDTHS) {
    const output = path.join(OUT_DIR, `${name}-${width}.webp`);
    if (await isFresh(output, mtimeMs)) continue;
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(output);
    written += 1;
  }
  return written;
}

async function buildOgImage(page, photo) {
  const input = path.join(SRC_DIR, `${photo}.jpg`);
  const output = path.join(OG_DIR, `${page}.jpg`);
  const { mtimeMs } = await stat(input);
  if (await isFresh(output, mtimeMs)) return 0;

  const W = 1200;
  const H = 630;
  const shade = Buffer.from(
    `<svg width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/>` +
      `</linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`,
  );
  const logo = await sharp(await readFile(LOGO), { density: 300 })
    .resize({ width: 200 })
    .png()
    .toBuffer();
  const { height: logoHeight = 0 } = await sharp(logo).metadata();
  const margin = 56;

  await sharp(input)
    .resize({ width: W, height: H, fit: "cover" })
    .composite([
      { input: shade, top: 0, left: 0 },
      { input: logo, left: margin, top: H - logoHeight - margin },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(output);
  return 1;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(OG_DIR, { recursive: true });
  const files = (await readdir(SRC_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));

  let total = 0;
  for (const file of files) total += await buildResponsive(file);
  for (const [page, photo] of OG_IMAGES) total += await buildOgImage(page, photo);

  console.log(`[images] ${files.length} photos checked, ${total} files written.`);
}

main().catch((error) => {
  console.error("[images] failed:", error);
  process.exit(1);
});

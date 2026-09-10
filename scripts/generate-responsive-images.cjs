// Deterministic derivatives only: never overwrite the approved source images.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const root = path.resolve(__dirname, "../public");

async function main() {
  const logos = { macmillan: [240, 480, 960], "cancer-research-uk": [240], nhs: [240], maggies: [240, 480], "cancer-care-map": [240, 480] };
  for (const [name, widths] of Object.entries(logos)) {
    const input = path.join(root, "links", `${name}.png`);
    const { width } = await sharp(input).metadata();
    await fs.mkdir(path.join(root, "links/responsive"), { recursive: true });
    for (const size of widths.filter(w => w < width)) {
      // Lossless WebP retains every resized RGBA pixel, without chroma artefacts.
      const output = await sharp(input).resize({ width: size }).webp({ lossless: true, effort: 6 }).toBuffer();
      if (output.length >= (await fs.stat(input)).size) throw new Error(`Derivative is larger than original: ${name}-${size}`);
      await fs.writeFile(path.join(root, "links/responsive", `${name}-${size}.webp`), output);
      console.log(`${name} ${size}: ${output.length} bytes`);
    }
  }
  for (const width of [1280, 1920]) {
    const output = await sharp(path.join(root, "tariffs/hero-plan-a.webp"))
      .resize({ width, withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
    await fs.writeFile(path.join(root, "tariffs", `hero-plan-a-${width}.webp`), output);
    console.log(`fees ${width}: ${output.length} bytes`);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

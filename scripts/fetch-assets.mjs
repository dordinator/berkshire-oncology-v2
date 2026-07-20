// One-off asset fetcher: downloads consultant photos + the practice logo from
// the old live site into /public. Run with: node scripts/fetch-assets.mjs
// Re-run any time; it overwrites. Not part of the app runtime.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const BASE = "https://berkshire-oncology.org.uk";

// slug -> exact source filename on the old server (note the quirks).
const photos = {
  "joss-adams": "dr-joss-adams-200x300.jpg",
  "madhumita-bhattacharyya": "dr-madhumita-bhattacharyya-200xx300.jpg",
  "nicola-dallas": "dr-nicola-dallas-200x300.jpg",
  "ruth-davis": "dr-ruth-davis-200x300.jpg",
  "gelareh-eslamian": "gelareh-eslamian-200x300-2024.jpg",
  "alice-freebairn": "dr-alice-freebairn-200x300.jpg",
  "esme-hill": "dr-esme-hill-200x300.jpg",
  "ayman-madi": "dr-ayman-madi-200x300.jpg",
  "helen-odonnell": "dr-helen-o-donnell-200x300.jpg",
  "paul-rogers": "dr-paul-rogers-200x300.jpg",
};

const extra = {
  "brand/berkshire-oncology-logo.png":
    "/Library/shared/berkshire-oncology-partnership-colour-logo-orig.png",
};

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return buf.length;
}

const jobs = [
  ...Object.entries(photos).map(([slug, file]) => [
    `${BASE}/Site/images/doctors-consultants/${file}`,
    `public/consultants/${slug}.jpg`,
  ]),
  ...Object.entries(extra).map(([dest, path]) => [`${BASE}${path}`, `public/${dest}`]),
];

let ok = 0;
for (const [url, dest] of jobs) {
  try {
    const bytes = await download(url, dest);
    console.log(`✓ ${dest} (${(bytes / 1024).toFixed(0)} kB)`);
    ok++;
  } catch (e) {
    console.warn(`✗ ${dest} — ${e.message}`);
  }
}
console.log(`\nDone: ${ok}/${jobs.length} assets fetched.`);

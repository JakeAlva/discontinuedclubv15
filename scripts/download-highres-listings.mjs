import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from '/Users/jetlifejake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';

const manifestPath = process.argv[2];
if (!manifestPath) throw new Error('Pass the browser asset manifest path.');

const root = process.cwd();
const outputDir = path.join(root, 'assets/images/listings');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const assets = manifest.assets.filter((asset) => asset.kind === 'image');
const sourceSizes = [];

async function upgrade(asset) {
  const url = asset.url.replace('/s-l300.webp', '/s-l960.webp');
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const source = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(source).metadata();
  sourceSizes.push({ width: metadata.width || 0, height: metadata.height || 0 });

  const destination = path.join(outputDir, `${asset.id}.webp`);
  const temporary = path.join(outputDir, `${asset.id}.highres.webp`);
  await sharp(source)
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 1 }, threshold: 16 })
    .resize(900, 900, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      withoutEnlargement: false
    })
    .webp({ quality: 90, effort: 4 })
    .toFile(temporary);
  await fs.rename(temporary, destination);
}

for (let index = 0; index < assets.length; index += 6) {
  await Promise.all(assets.slice(index, index + 6).map(upgrade));
}

const smallestWidth = Math.min(...sourceSizes.map((size) => size.width));
const largestWidth = Math.max(...sourceSizes.map((size) => size.width));
console.log(`Upgraded ${assets.length} listing images from ${smallestWidth}-${largestWidth}px sources.`);

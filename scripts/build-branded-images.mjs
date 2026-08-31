import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from '/Users/jetlifejake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import { soldItems } from './sold-data.mjs';

const require = createRequire(import.meta.url);
const { catalog } = require('../assets/catalog.js');
const root = path.resolve(import.meta.dirname, '..');
const listingDir = path.join(root, 'assets/images/listings');
const soldDir = path.join(root, 'assets/images/sold');
const listingOutputDir = path.join(listingDir, 'branded');
const soldOutputDir = path.join(soldDir, 'branded');
const white = { r: 255, g: 255, b: 255, alpha: 1 };

// Storefront and social assets are branded; clean originals remain available for Merchant Center feeds.

const bottomBrandedSources = new Set([
  'b4b4e35b7cc955df.webp',
  '02ac86d4595c4adc.webp',
  '60503c0b5f7d19ce.webp',
  '3dd9f435b93f0c64.webp',
  '4274a8f620dcdfbc.webp',
  '45cd4bede45565c5.webp',
  '7ee2bde9fd49cb26.webp',
  '1c6ab9f4d119bded.webp',
  '4abf1eaee665ec19.webp',
  '407086740543.webp',
  '407119859391.webp',
  '407119973045.webp',
  '407134856526.webp'
]);
const topBrandedSources = new Set(['8167a13655984166.webp']);

await Promise.all([
  fs.mkdir(listingOutputDir, { recursive: true }),
  fs.mkdir(soldOutputDir, { recursive: true })
]);

const logoMark = await sharp(path.join(root, 'assets/images/logo-mark-clean.png'))
  .resize(58, 58, { fit: 'contain' })
  .png()
  .toBuffer();

const logoType = Buffer.from(`
  <svg width="240" height="62" xmlns="http://www.w3.org/2000/svg">
    <style>
      .name { font: 900 17px Arial, sans-serif; letter-spacing: 1.2px; }
      .club { font: 800 11px Arial, sans-serif; letter-spacing: 7px; }
    </style>
    <text class="name" x="0" y="24" fill="#111311">DISCONTINUED</text>
    <text class="club" x="0" y="50" fill="#111311">CLUB</text>
  </svg>
`);

async function buildBrandedImage(source, destination) {
  const fileName = path.basename(source);
  const metadata = await sharp(source).metadata();
  let left = 0;
  let top = 0;
  let width = metadata.width;
  let height = metadata.height;

  if (!width || !height) throw new Error(`Could not read image dimensions: ${source}`);
  if (bottomBrandedSources.has(fileName)) height = Math.max(1, Math.round(height * 0.865));
  if (topBrandedSources.has(fileName)) {
    top = Math.round(height * 0.12);
    height -= top;
  }

  let productInput = source;
  if (left || top || width !== metadata.width || height !== metadata.height) {
    productInput = await sharp(source).extract({ left, top, width, height }).toBuffer();
  }

  const product = await sharp(productInput)
    .flatten({ background: white })
    .trim({ background: white, threshold: 14 })
    .resize(1080, 1000, {
      fit: 'contain',
      background: white,
      withoutEnlargement: false
    })
    .webp({ quality: 94, effort: 5 })
    .toBuffer();

  await sharp({ create: { width: 1200, height: 1200, channels: 4, background: white } })
    .composite([
      { input: product, left: 60, top: 24 },
      { input: logoMark, left: 450, top: 1084 },
      { input: logoType, left: 526, top: 1082 }
    ])
    .flatten({ background: white })
    .webp({ quality: 94, effort: 5, smartSubsample: true })
    .toFile(destination);
}

for (let index = 0; index < catalog.length; index += 6) {
  await Promise.all(catalog.slice(index, index + 6).map((item) => buildBrandedImage(
    path.join(listingDir, item.image),
    path.join(listingOutputDir, `${item.id}.webp`)
  )));
}

const soldWithImages = soldItems.filter((item) => item.imageUrl);
for (let index = 0; index < soldWithImages.length; index += 6) {
  await Promise.all(soldWithImages.slice(index, index + 6).map((item) => buildBrandedImage(
    path.join(soldDir, `${item.id}.webp`),
    path.join(soldOutputDir, `${item.id}.webp`)
  )));
}

console.log(`Built ${catalog.length} current and ${soldWithImages.length} sold branded image files.`);

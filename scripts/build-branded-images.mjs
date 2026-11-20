import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { soldItems } from './sold-data.mjs';
import { createDrinkImageBuffers } from '../lib/drink-images.mjs';
import { createUniformListingImageBuffers } from '../lib/listing-image-template.mjs';

const require = createRequire(import.meta.url);
const { catalog } = require('../assets/catalog.js');
const root = path.resolve(import.meta.dirname, '..');
const listingDir = path.join(root, 'assets/images/listings');
const soldDir = path.join(root, 'assets/images/sold');
const listingOutputDir = path.join(listingDir, 'branded');
const merchantOutputDir = path.join(listingDir, 'merchant');
const soldOutputDir = path.join(soldDir, 'branded');
const white = { r: 255, g: 255, b: 255, alpha: 1 };
const onlyId = process.argv.find((arg) => arg.startsWith('--only='))?.slice(7);
const category = process.argv.find((arg) => arg.startsWith('--category='))?.slice(11);
const activeOnly = process.argv.includes('--active-only');
const storefrontOnly = process.argv.includes('--storefront-only');
const selectedCatalog = catalog.filter((item) => (!onlyId || item.id === onlyId) && (!category || item.category === category));

// Storefront assets are branded. Merchant assets stay free of retailer overlays for Google Shopping.

const bottomBrandedSources = new Set([
  '407365004609.webp',
  '407363501696.webp',
  '407365194694.webp',
  '407321244836.webp',
  '407276996786.webp',
  '407274649287.webp',
  '407301997130.webp',
  '407300260883.webp',
  '407343435479.webp',
  '407298156099.webp',
  '407298051046.webp',
  '407297979026.webp',
  '407293775090.webp',
  '407293697579.webp',
  '407293550787.webp',
  '407293533835.webp',
  '407293531323.webp',
  '407290859464.webp',
  '407279351355.webp',
  '407279322970.webp',
  '407277346224.webp',
  '407277320481.webp',
  '407277242488.webp',
  '407277210158.webp',
  '407277156219.webp',
  '407277122050.webp',
  '407269224750.webp',
  '407269188492.webp',
  '407264848037.webp',
  '407264808538.webp',
  '407260159541.webp',
  '407253023756.webp',
  '407207453659.webp',
  '407205693415.webp',
  '407205665076.webp',
  '407205596661.webp',
  '407205565491.webp',
  '407205333909.webp',
  '407203191955.webp',
  '407207373104.webp',
  '407203141723.webp',
  '407203121847.webp',
  '407203102419.webp',
  '407202995940.webp',
  '407195902675.webp',
  '407134944288.webp',
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
const reviewedBottom = {
  '407365004609.webp': 0.81,
  '407202995940.webp': 0.91,
  '3dd9f435b93f0c64.webp': 0.90,
  '45cd4bede45565c5.webp': 0.90
};
// The old Etnies mark sits between the shoes; masking only its three lines preserves both collars.
const etniesLogoMasks = [
  { left: 423, top: 0, width: 62, height: 55 },
  { left: 392, top: 57, width: 127, height: 17 },
  { left: 408, top: 77, width: 95, height: 10 }
];
const packLabelSources = new Set(['407293550787.webp', '407293533835.webp', '407293531323.webp']);
const jerseyPhotoSources = new Map([
  ['407064120905', 'fa4d28756c19b882.webp'],
  ['407063808795', 'fa358a9a591b7571.webp'],
  ['407063633707', '208776360ee5b11c.webp'],
  ['407063650804', 'f03dce6552ac19db.webp'],
  ['407063463950', 'fa42d924134b81d4.webp'],
  ['407063539708', '3c31758564fa4869.webp'],
  ['407117217273', '21f5d876d5a58d91.webp'],
  ['407064096234', '93598042f193a008.webp'],
  ['407086613910', '04405f11099cd5f2.webp']
]);
const jerseyPhotoFileNames = new Set(jerseyPhotoSources.values());

await Promise.all([
  fs.mkdir(listingOutputDir, { recursive: true }),
  fs.mkdir(merchantOutputDir, { recursive: true }),
  fs.mkdir(soldOutputDir, { recursive: true })
]);

async function buildBrandedImage(source, destination) {
  const fileName = path.basename(source);
  const metadata = await sharp(source).metadata();
  let left = 0;
  let top = 0;
  let width = metadata.width;
  let height = metadata.height;

  if (!width || !height) throw new Error(`Could not read image dimensions: ${source}`);
  if (bottomBrandedSources.has(fileName)) height = Math.max(1, Math.round(height * (reviewedBottom[fileName] || (fileName === '407253023756.webp' ? 0.90 : 0.865))));
  if (packLabelSources.has(fileName)) {
    top = Math.round(metadata.height * 0.20);
    height -= top;
  }

  let productInput = source;
  if (left || top || width !== metadata.width || height !== metadata.height) {
    productInput = await sharp(source).extract({ left, top, width, height }).toBuffer();
  }

  const images = await createUniformListingImageBuffers(productInput, {
    root, masks: fileName === '8167a13655984166.webp' ? etniesLogoMasks : []
  });
  await fs.writeFile(destination, images.branded);
}

async function buildMerchantImage(source, destination) {
  const fileName = path.basename(source);
  const metadata = await sharp(source).metadata();
  let top = 0;
  let width = metadata.width;
  let height = metadata.height;

  if (!width || !height) throw new Error(`Could not read image dimensions: ${source}`);
  let cleanedSource = source;
  if (bottomBrandedSources.has(fileName) || jerseyPhotoFileNames.has(fileName)) {
    const maskWidth = Math.round(width * 0.38);
    const maskHeight = Math.round(height * (fileName === '407253023756.webp' ? 0.10 : 0.14));
    const mask = await sharp({ create: { width: maskWidth, height: maskHeight, channels: 4, background: white } })
      .png()
      .toBuffer();
    cleanedSource = await sharp(source)
      .composite([{ input: mask, left: Math.round(width * 0.31), top: height - maskHeight }])
      .toBuffer();
  }
  if (topBrandedSources.has(fileName)) {
    top = Math.round(height * 0.12);
    height -= top;
  }
  if (packLabelSources.has(fileName)) {
    top = Math.round(metadata.height * 0.20);
    height -= top;
  }

  const productInput = top || height !== metadata.height
    ? await sharp(cleanedSource).extract({ left: 0, top, width, height }).toBuffer()
    : cleanedSource;
  const product = await sharp(productInput)
    .flatten({ background: white })
    .trim({ background: white, threshold: 14 })
    .resize(1080, 1080, {
      fit: 'contain',
      background: white,
      withoutEnlargement: false
    })
    .webp({ quality: 94, effort: 5 })
    .toBuffer();

  await sharp({ create: { width: 1200, height: 1200, channels: 4, background: white } })
    .composite([{ input: product, left: 60, top: 60 }])
    .flatten({ background: white })
    .webp({ quality: 94, effort: 5, smartSubsample: true })
    .toFile(destination);
}

for (let index = 0; index < selectedCatalog.length; index += 6) {
  await Promise.all(selectedCatalog.slice(index, index + 6).map(async (item) => {
    const storefrontSource = path.join(listingDir, item.image);
    const merchantSource = path.join(listingDir, jerseyPhotoSources.get(item.id) || item.image);
    if (item.category === 'drinks') {
      const images = await createDrinkImageBuffers(storefrontSource, { root });
      await Promise.all([
        fs.writeFile(path.join(listingOutputDir, `${item.id}.webp`), images.branded),
        ...(!storefrontOnly ? [fs.writeFile(path.join(merchantOutputDir, `${item.id}.webp`), images.merchant)] : [])
      ]);
      return;
    }
    return Promise.all([
      buildBrandedImage(storefrontSource, path.join(listingOutputDir, `${item.id}.webp`)),
      ...(!storefrontOnly ? [buildMerchantImage(merchantSource, path.join(merchantOutputDir, `${item.id}.webp`))] : [])
    ]);
  }));
}

const soldWithImages = category || activeOnly ? [] : soldItems.filter((item) => item.imageUrl && (!onlyId || item.id === onlyId));
for (let index = 0; index < soldWithImages.length; index += 6) {
  await Promise.all(soldWithImages.slice(index, index + 6).map((item) => buildBrandedImage(
    path.join(soldDir, `${item.id}.webp`),
    path.join(soldOutputDir, `${item.id}.webp`)
  )));
}

console.log(`Built ${selectedCatalog.length} branded storefront images, ${storefrontOnly ? 0 : selectedCatalog.length} clean merchant images, and ${soldWithImages.length} sold branded images.`);

import path from 'node:path';
import sharp from 'sharp';
import { createUniformListingImageBuffers } from './listing-image-template.mjs';

// Reviewed photo boundaries remove old retailer marks without touching the cans.
export const drinkPhotoCrops = {
  '407376262737.webp': { bottom: 0.865 },
  '407376259572.webp': { bottom: 0.865 },
  '407365349094.webp': { bottom: 0.75 },
  '407365323849.webp': { bottom: 0.71 },
  '407329572793.webp': { bottom: 0.80 },
  '407347352383.webp': { top: 0.17, bottom: 0.80 },
  '407332173468.webp': { bottom: 0.80 },
  '407320758064.webp': { bottom: 0.865 },
  '407320767912.webp': { bottom: 0.865 },
  '407301997130.webp': { bottom: 0.865 },
  '407343435479.webp': { bottom: 0.865 },
  '407298051046.webp': { bottom: 0.865 },
  '407373107823.webp': { bottom: 0.82 },
  '407293775090.webp': { bottom: 0.865 },
  '407293697579.webp': { bottom: 0.865 },
  '407293550787.webp': { top: 0.20, bottom: 0.865 },
  '407293531323.webp': { top: 0.20, bottom: 0.865 },
  '407290859464.webp': { bottom: 0.865 },
  '407207373104.webp': { top: 0.18, bottom: 0.865 },
  '407205665076.webp': { bottom: 0.865 },
  '407205596661.webp': { top: 0.07, bottom: 0.90 },
  '407205565491.webp': { top: 0.07, bottom: 0.90 },
  '407205333909.webp': { top: 0.07, bottom: 0.90 },
  '407203191955.webp': { top: 0.11, bottom: 0.865 },
  '407203121847.webp': { top: 0.11, bottom: 0.865 },
  'b4b4e35b7cc955df.webp': { bottom: 0.865 }
};

export async function createDrinkImageBuffers(source, { root = path.resolve(import.meta.dirname, '..') } = {}) {
  const metadata = await sharp(source).metadata();
  const crop = drinkPhotoCrops[path.basename(source)];
  const top = Math.round(metadata.height * (crop?.top || 0));
  const bottom = Math.round(metadata.height * (crop?.bottom || 1));
  const cropped = await sharp(source)
    .extract({ left: 0, top, width: metadata.width, height: bottom - top })
    .png().toBuffer();
  return createUniformListingImageBuffers(cropped, { root });
}

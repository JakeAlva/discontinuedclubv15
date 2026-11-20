import path from 'node:path';
import sharp from 'sharp';

const white = { r: 255, g: 255, b: 255, alpha: 1 };

export async function createUniformListingImageBuffers(source, {
  root = path.resolve(import.meta.dirname, '..'), masks = []
} = {}) {
  let input = source;
  if (masks.length) {
    const overlays = await Promise.all(masks.map(async ({ left, top, width, height }) => ({
      left, top,
      input: await sharp({ create: { width, height, channels: 3, background: white } }).png().toBuffer()
    })));
    input = await sharp(input).composite(overlays).png().toBuffer();
  }
  const clean = await sharp(input).rotate().flatten({ background: white }).trim({ threshold: 14 }).png().toBuffer();
  const logo = await sharp(path.join(root, 'assets/images/logo.png'))
    .trim().resize(180, 130, { fit: 'contain', background: white })
    .flatten({ background: white }).png().toBuffer();
  const product = await sharp(clean).resize(1080, 940, { fit: 'contain', background: white }).png().toBuffer();
  const merchantProduct = await sharp(clean).resize(1080, 1080, { fit: 'contain', background: white }).png().toBuffer();
  const canvas = () => sharp({ create: { width: 1200, height: 1200, channels: 3, background: white } });
  return {
    branded: await canvas().composite([{ input: product, left: 60, top: 40 }, { input: logo, left: 510, top: 1040 }])
      .webp({ quality: 94, effort: 5, smartSubsample: true }).toBuffer(),
    merchant: await canvas().composite([{ input: merchantProduct, left: 60, top: 60 }])
      .webp({ quality: 94, effort: 5, smartSubsample: true }).toBuffer()
  };
}

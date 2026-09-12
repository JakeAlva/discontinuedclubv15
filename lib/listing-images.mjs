import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const white = { r: 255, g: 255, b: 255, alpha: 1 };

function allowedEbayImageUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'i.ebayimg.com' || url.username || url.password) {
    throw new Error('The eBay image URL did not use the approved HTTPS image host');
  }
  return url;
}
async function downloadImage(url, fetcher = fetch) {
  const response = await fetcher(allowedEbayImageUrl(url), {
    signal: AbortSignal.timeout(30000),
    redirect: 'error'
  });
  if (!response.ok) throw new Error(`Could not download eBay listing photo (HTTP ${response.status})`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) throw new Error('The eBay listing photo response was not an image');
  const announcedSize = Number(response.headers.get('content-length') || 0);
  if (announcedSize > 20_000_000) throw new Error('The eBay listing photo exceeded 20 MB');
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 20_000_000) throw new Error('The eBay listing photo exceeded 20 MB');
  return buffer;
}

function logoType() {
  return Buffer.from(`
    <svg width="240" height="62" xmlns="http://www.w3.org/2000/svg">
      <style>
        .name { font: 900 17px Arial, sans-serif; letter-spacing: 1.2px; }
        .club { font: 800 11px Arial, sans-serif; letter-spacing: 7px; }
      </style>
      <text class="name" x="0" y="24" fill="#111311">DISCONTINUED</text>
      <text class="club" x="0" y="50" fill="#111311">CLUB</text>
    </svg>
  `);
}

export async function createSyncedListingImageBuffers(imageUrl, {
  root = resolve(import.meta.dirname, '..'),
  fetcher = fetch
} = {}) {
  const source = await downloadImage(imageUrl, fetcher);
  const logoMark = await sharp(await readFile(resolve(root, 'assets/images/logo-mark-clean.png')))
    .resize(58, 58, { fit: 'contain' })
    .png()
    .toBuffer();
  const cleanProduct = await sharp(source)
    .rotate()
    .flatten({ background: white })
    .trim({ background: white, threshold: 14 })
    .resize(1080, 1080, { fit: 'contain', background: white, withoutEnlargement: true })
    .webp({ quality: 94, effort: 5 })
    .toBuffer();
  const storefrontProduct = await sharp(source)
    .rotate()
    .flatten({ background: white })
    .trim({ background: white, threshold: 14 })
    .resize(1080, 1000, { fit: 'contain', background: white, withoutEnlargement: true })
    .webp({ quality: 94, effort: 5 })
    .toBuffer();
  const cleanCanvas = await sharp({ create: { width: 1200, height: 1200, channels: 4, background: white } })
    .composite([{ input: cleanProduct, left: 60, top: 60 }])
    .flatten({ background: white })
    .webp({ quality: 94, effort: 5, smartSubsample: true })
    .toBuffer();
  const brandedCanvas = await sharp({ create: { width: 1200, height: 1200, channels: 4, background: white } })
    .composite([
      { input: storefrontProduct, left: 60, top: 24 },
      { input: logoMark, left: 450, top: 1084 },
      { input: logoType(), left: 526, top: 1082 }
    ])
    .flatten({ background: white })
    .webp({ quality: 94, effort: 5, smartSubsample: true })
    .toBuffer();

  return {
    source: cleanCanvas,
    merchant: cleanCanvas,
    branded: brandedCanvas
  };
}

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { createSyncedListingImageBuffers } from '../lib/listing-images.mjs';

const root = resolve(import.meta.dirname, '..');
const update = JSON.parse(await readFile(resolve(root, 'data/ebay-inventory-update-2026-11-16.json'), 'utf8'));
const imageRoot = resolve(root, 'assets/images/listings');
for (const dir of ['branded', 'merchant', 'gallery']) await mkdir(resolve(imageRoot, dir), { recursive: true });
for (const [id, url] of Object.entries(update.photos)) {
  const images = await createSyncedListingImageBuffers(url);
  for (const [variant, buffer] of Object.entries(images)) {
    await writeFile(resolve(imageRoot, variant === 'source' ? `${id}.webp` : `${variant}/${id}.webp`), buffer);
  }
  console.log(`Prepared ${id}`);
}
for (const [id, url] of Object.entries(update.gallery)) {
  if (new URL(url).hostname !== 'i.ebayimg.com') throw new Error('Unexpected image source');
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: 'error' });
  if (!response.ok) throw new Error(`Image failed: ${id}`);
  const buffer = await sharp(Buffer.from(await response.arrayBuffer())).rotate().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 92 }).toBuffer();
  await writeFile(resolve(imageRoot, 'gallery', `${id}.webp`), buffer);
}

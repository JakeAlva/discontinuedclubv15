import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createSyncedListingImageBuffers } from '../lib/listing-images.mjs';

const root = resolve(import.meta.dirname, '..');
const update = JSON.parse(await readFile(resolve(root, 'data/ebay-inventory-update-2026-11-18.json'), 'utf8'));
for (const [id, url] of Object.entries(update.photos)) {
  const images = await createSyncedListingImageBuffers(url);
  for (const [variant, buffer] of Object.entries(images)) {
    await writeFile(resolve(root, 'assets/images/listings', variant === 'source' ? `${id}.webp` : `${variant}/${id}.webp`), buffer);
  }
  console.log(`Prepared ${id}`);
}

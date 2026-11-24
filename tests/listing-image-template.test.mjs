import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { createSyncedListingImageBuffers } from '../lib/listing-images.mjs';
import { browsableSoldItems } from '../lib/browse-catalog.mjs';

test('new synced images use the same logo footer as existing listings', async () => {
  const source = await readFile(new URL('../assets/images/listings/mockups/407064120905.webp', import.meta.url));
  const images = await createSyncedListingImageBuffers('https://i.ebayimg.com/images/example.webp', {
    fetcher: async () => new Response(source, { headers: { 'Content-Type': 'image/webp' } })
  });
  const footer = async (image) => sharp(image).extract({ left: 0, top: 1024, width: 1200, height: 176 }).removeAlpha().raw().toBuffer();
  const expected = await footer(new URL('../assets/images/listings/branded/407376262737.webp', import.meta.url).pathname);
  const actual = await footer(images.branded);
  const difference = actual.reduce((sum, value, i) => sum + Math.abs(value - expected[i]), 0) / actual.length;
  assert.ok(difference < 1);
  assert.deepEqual(images.source, images.merchant);
});

test('all browsable out-of-stock photos share the current logo footer', async () => {
  const footer = async (image) => sharp(image).extract({ left: 0, top: 1024, width: 1200, height: 176 }).removeAlpha().raw().toBuffer();
  const expected = await footer(new URL('../assets/images/listings/branded/407376262737.webp', import.meta.url).pathname);
  for (const item of browsableSoldItems().filter((item) => item.image)) {
    const path = new URL(`../assets/images/sold/branded/${item.id}.webp`, import.meta.url).pathname;
    const metadata = await sharp(path).metadata();
    assert.equal(metadata.width, 1200, item.id);
    assert.equal(metadata.height, 1200, item.id);
    const actual = await footer(path);
    const difference = actual.reduce((sum, value, i) => sum + Math.abs(value - expected[i]), 0) / actual.length;
    assert.ok(difference < 1, `${item.id}: uniform footer difference ${difference}`);
  }
});

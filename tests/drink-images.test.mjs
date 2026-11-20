import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { catalog } from '../lib/store-catalog.mjs';
import { drinkPhotoCrops } from '../lib/drink-images.mjs';

const drinks = catalog.filter((item) => item.category === 'drinks');
const listingPath = (file) => new URL(`../assets/images/listings/${file}`, import.meta.url).pathname;

test('every current drink has the same branded footer and cache version', async () => {
  let reference;
  for (const item of drinks) {
    assert.equal(item.imageVersion, 'uniform-drinks-20261120');
    const image = sharp(listingPath(`branded/${item.id}.webp`));
    const meta = await image.metadata();
    assert.equal(meta.width, 1200, item.id);
    assert.equal(meta.height, 1200, item.id);
    const footer = await image.extract({ left: 0, top: 1024, width: 1200, height: 176 }).removeAlpha().raw().toBuffer();
    reference ||= footer;
    const meanDifference = footer.reduce((sum, value, i) => sum + Math.abs(value - reference[i]), 0) / footer.length;
    assert.ok(meanDifference < 1, `${item.id}: the logo footer changed`);
    assert.ok(footer.some((value) => value < 100), `${item.id}: footer is empty`);
    const merchant = await sharp(listingPath(`merchant/${item.id}.webp`)).metadata();
    assert.equal(merchant.width, 1200);
    assert.equal(merchant.height, 1200);
  }
});

test('reviewed old-logo crops pass through empty background, not the products', async () => {
  for (const [file, crop] of Object.entries(drinkPhotoCrops)) {
    const image = sharp(listingPath(file));
    const meta = await image.metadata();
    for (const fraction of [crop.top, crop.bottom].filter(Boolean)) {
      const row = await image.clone().extract({ left: 0, top: Math.round(meta.height * fraction) - 1, width: meta.width, height: 1 })
        .flatten({ background: 'white' }).greyscale().raw().toBuffer();
      assert.ok(Math.max(...row) - Math.min(...row) < 45, `${file}: crop boundary intersects artwork at ${fraction}`);
    }
  }
});

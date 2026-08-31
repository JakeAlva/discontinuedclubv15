import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog } from '../lib/store-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;

test('every current listing has a dedicated indexable product page', async () => {
  const files = (await readdir(resolve(root, 'products'))).filter((file) => file.endsWith('.html'));
  assert.equal(files.length, catalog.length);

  for (const item of catalog) {
    const filename = slug(item);
    assert.ok(files.includes(filename), `Missing ${filename}`);
    const html = await readFile(resolve(root, 'products', filename), 'utf8');
    assert.match(html, new RegExp(`<link rel="canonical" href="https://discontinuedclub\\.com/products/${filename}">`));
    assert.ok(html.includes(`/assets/images/listings/merchant/${item.id}.webp`));
    assert.ok(html.includes(`data-add-to-cart="${item.id}"`));
  }
});

test('jersey product pages lead with the mockup and include distinct real photos', async () => {
  const item = catalog.find((candidate) => candidate.id === '407064120905');
  const html = await readFile(resolve(root, 'products', slug(item)), 'utf8');
  const firstMainImage = html.match(/<div class="current-gallery-main"><img src="([^"]+)/)?.[1];

  assert.equal(firstMainImage, `assets/images/listings/branded/${item.id}.webp`);
  assert.ok(html.includes(`data-product-gallery-src="assets/images/listings/merchant/${item.id}.webp"`));
  assert.ok(html.includes(`data-product-gallery-src="assets/images/listings/backs/${item.id}.webp"`));
});

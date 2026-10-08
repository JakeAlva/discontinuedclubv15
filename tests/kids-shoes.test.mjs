import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { catalog, categories, directPriceCents, maxQuantity } from '../lib/store-catalog.mjs';
import { productBrand, productCondition } from '../lib/product-metadata.mjs';
import { siteItemFromListing } from '../lib/catalog-sync.mjs';
import { serializeCatalogModule } from '../lib/catalog-file.mjs';
import { runInNewContext } from 'node:vm';

const item = catalog.find((item) => item.id === '407274649287');
const productPath = 'products/balenciaga-triple-s-kids-sneakers-eu-26-us-9-5-407274649287.html';

test('new kids sneakers retain verified price, single-pair stock and sizing', () => {
  assert.equal(item.price, '$174.99');
  assert.equal(directPriceCents(item), 16887);
  assert.equal(maxQuantity(item), 1);
  assert.equal(item.size, '26');
  assert.equal(item.sizeSystem, 'EU');
  assert.equal(productBrand(item), 'Balenciaga');
  assert.equal(productCondition(item), 'used');
  assert.equal(item.taxCode, 'txcd_30011200');
  assert.equal(item.shippingWeightOz, 64);
  assert.equal(categories.all.count, catalog.length);
  assert.equal(categories.apparel.count, catalog.filter((item) => item.category === 'apparel').length);
});

test('product page includes six condition photos, disclosure and searchable schema', async () => {
  const html = await readFile(new URL(`../${productPath}`, import.meta.url), 'utf8');
  assert.equal((html.match(/data-product-gallery-src=/g) || []).length, 6);
  assert.match(html, /Original box not included/);
  assert.match(html, /Direct purchases do not include eBay authentication/);
  assert.match(html, /index, follow/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.brand.name, 'Balenciaga');
  assert.equal(schema.itemCondition, 'https://schema.org/UsedCondition');
  assert.equal(schema.offers.price, '168.87');
  assert.equal(schema.size.name, '26');
  assert.equal(schema.image.length, 6);
  for (const image of item.gallery) await access(new URL(`../${image.src}`, import.meta.url));
  const sitemap = await readFile(new URL('../sitemap-products.xml', import.meta.url), 'utf8');
  assert.ok(sitemap.includes(productPath));
});

test('shopping feed has footwear attributes and condition, without a fabricated GTIN', async () => {
  const xml = await readFile(new URL('../google-merchant-feed.xml', import.meta.url), 'utf8');
  const entry = xml.match(/<item>\s*<g:id>dc-407274649287<\/g:id>[\s\S]*?<\/item>/)[0];
  for (const [field, value] of Object.entries({ size: '26', size_system: 'EU', gender: 'unisex', age_group: 'toddler', color: 'White/Green/Gray', mpn: '654251', condition: 'used', price: '168.87 USD', google_product_category: '187' })) {
    assert.ok(entry.includes(`<g:${field}>${value}</g:${field}>`));
  }
  assert.ok(!entry.includes('<g:gtin>'));
});

test('later inventory sync preserves curated shoe details and gallery', () => {
  const synced = siteItemFromListing({ id: item.id, title: item.name, priceCents: 17499, condition: item.condition }, { existingItem: item, sharedStock: 1 });
  for (const key of ['gallery', 'size', 'sizeLabel', 'color', 'brand', 'mpn', 'ageGroup', 'purchaseNote', 'taxCode']) assert.deepEqual(synced[key], item[key]);
  const context = { module: { exports: {} } };
  runInNewContext(serializeCatalogModule([synced], {}), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.module.exports.catalog[0].gallery)), item.gallery);
  assert.equal(context.module.exports.catalog[0].sizeLabel, item.sizeLabel);
});

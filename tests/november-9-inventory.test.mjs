import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog, storeConfig, findCatalogItem, directPriceCents, maxQuantity, priceLookupKey } from '../lib/store-catalog.mjs';
import { soldItems, slugify } from '../scripts/sold-data.mjs';
import { currentSnapshot, novemberUpdate } from './helpers/current-inventory.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('November 9 catalog matches all 76 eBay listings and 127 sellable units', () => {
  assert.equal(catalog.length, novemberUpdate.activeListingCount);
  assert.equal(catalog.reduce((sum, item) => sum + maxQuantity(item), 0), novemberUpdate.sellableUnits);
  assert.deepEqual(catalog.map((item) => item.id).sort(), currentSnapshot.map(([id]) => id).sort());
  assert.equal(storeConfig.directDiscountPercent, 3.5);
  for (const [id, ebayCents, quantity] of currentSnapshot) {
    const item = findCatalogItem(id);
    assert.equal(maxQuantity(item), quantity, id);
    assert.equal(directPriceCents(item), Math.round(ebayCents * 0.965), id);
  }
});

test('relisted drinks have discounted checkout mappings and published assets', async () => {
  for (const [id, cents, weight] of [['407347352383', 2798, 80], ['407345586271', 2122, 16]]) {
    const item = findCatalogItem(id);
    assert.equal(directPriceCents(item), cents);
    assert.equal(item.shippingWeightOz, weight);
    assert.equal(priceLookupKey(item), `dc_${id}_direct`);
    for (const variant of ['branded', 'merchant']) {
      assert.ok((await readFile(new URL(`../assets/images/listings/${variant}/${id}.webp`, import.meta.url))).length > 1000);
    }
    assert.ok((await read('dist/google-merchant-feed.xml')).includes(`dc-${id}`));
    const page = `products/${slugify(item.name)}-${id}.html`;
    assert.ok((await read('dist/out-now.html')).includes(`href="${page}"`));
    assert.ok((await read(`dist/${page}`)).includes(`data-add-to-cart="${id}"`));
  }
  const redirects = await read('_redirects');
  const old = 'products/red-bull-festive-edition-arctic-berry-8-4-oz-single-can-407297979026';
  const current = 'products/red-bull-festive-edition-arctic-berry-8-4-oz-single-can-407345586271.html';
  for (const suffix of ['', '.html']) assert.ok(redirects.includes(`/${old}${suffix}  /${current}  301`));
});

test('sold items leave all purchase surfaces and retain indexable archive pages', async () => {
  for (const id of novemberUpdate.removedIds) {
    assert.equal(findCatalogItem(id), undefined);
    const item = soldItems.find((row) => row.id === id);
    assert.equal(item.soldOut, true);
    assert.equal(item.priceLabel, 'Last listed price');
    const page = `${slugify(item.name)}-${id}`;
    for (const file of ['dist/out-now.html', 'dist/google-merchant-feed.xml', 'dist/sitemap-products.xml']) {
      assert.ok(!(await read(file)).includes(id), `${id}: ${file}`);
    }
    const html = await read(`dist/sold/${page}.html`);
    assert.match(html, /https:\/\/schema.org\/OutOfStock/);
    assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay/);
    for (const suffix of ['', '.html']) {
      assert.ok((await read('_redirects')).includes(`/products/${page}${suffix}  /sold/${page}.html  301`));
    }
  }
});

test('stale carts and excess can or four-pack quantities fail before Stripe is contacted', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    const rejected = [...novemberUpdate.removedIds, '407297979026'].map((id) => [id, 1]);
    rejected.push(['407329572793', 5], ['407347352383', 2], ['407345586271', 2]);
    for (const [id, quantity] of rejected) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /available quantity changed|no longer available/);
    }
  } finally {
    keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
  }
});

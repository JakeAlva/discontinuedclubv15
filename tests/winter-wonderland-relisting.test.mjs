import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog, findCatalogItem, directPriceCents, priceLookupKey, maxQuantity } from '../lib/store-catalog.mjs';
import { availableStripeQuantity } from '../lib/stripe-inventory.mjs';
import { winterUpdate as update } from './helpers/current-inventory.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const slug = (id) => `alani-nu-winter-wonderland-12-oz-single-can-${id}.html`;

test('Winter Wonderland uses the verified current eBay listing and live stock key', () => {
  const item = findCatalogItem(update.id);
  assert.equal(catalog.filter((row) => /Winter Wonderland/.test(row.name)).length, 1);
  for (const id of update.previousIds) assert.equal(findCatalogItem(id), undefined);
  assert.equal(item.price, '$9.99');
  assert.equal(directPriceCents(item), 964);
  assert.equal(maxQuantity(item), 6);
  assert.equal(item.shippingWeightOz, 32);
  assert.equal(priceLookupKey(item), `dc_${update.id}_direct`);
  for (const stock of [6, 5, 0]) {
    assert.equal(availableStripeQuantity(maxQuantity(item), { active: true, metadata: { dc_stock: String(stock) } }), stock);
  }
});

test('current Winter page, feed and old URLs point to the replacement listing', async () => {
  const html = await read(`dist/products/${slug(update.id)}`);
  assert.ok(html.includes(`https://www.ebay.com/itm/${update.id}`));
  assert.ok(html.includes(`data-add-to-cart="${update.id}"`));
  assert.ok(html.includes(`data-stock-id="${update.id}"`));
  assert.match(html, /Checking stock/);
  assert.match(html, /"price":"9.64"/);
  const redirects = await read('_redirects');
  for (const id of update.previousIds) {
    for (const oldPath of [slug(id), slug(id).replace(/\.html$/, '')]) {
      assert.ok(redirects.includes(`/products/${oldPath}  /products/${slug(update.id)}  301`));
    }
  }
  for (const file of ['out-now.html', 'google-merchant-feed.xml', 'sitemap-products.xml']) {
    const text = await read(`dist/${file}`);
    assert.ok(text.includes(update.id), file);
    for (const id of update.previousIds) assert.ok(!text.includes(id), `${file}: obsolete listing ${id}`);
  }
});

test('obsolete Winter carts and excess quantities are rejected without creating Checkout', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const old = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const id of [...update.previousIds, update.id]) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity: id === update.id ? 7 : 1 }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, id === update.id ? /available quantity changed/ : /no longer available/);
    }
  } finally {
    keys.forEach((key, i) => { if (old[i] === undefined) delete process.env[key]; else process.env[key] = old[i]; });
  }
});

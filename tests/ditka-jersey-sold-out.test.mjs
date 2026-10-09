import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, categories, findCatalogItem } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const id = '407117478926';
const root = resolve(import.meta.dirname, '..');
const slug = 'chicago-bears-mike-ditka-jersey-' + id + '.html';
const read = (file) => readFile(resolve(root, file), 'utf8');

test('sold Ditka jersey is removed from active inventory, feed and recommendations', async () => {
  assert.equal(findCatalogItem(id), undefined);
  assert.equal(categories.all.count, catalog.length);
  assert.equal(categories.apparel.count, catalog.filter((item) => item.category === 'apparel').length);
  for (const file of ['google-merchant-feed.xml', 'sitemap-products.xml', 'index.html', 'out-now.html']) {
    assert.ok(!(await read(file)).includes(id), file);
  }
  const products = await readdir(resolve(root, 'products'));
  assert.ok(!products.includes(slug));
  for (const file of products) {
    assert.ok(!(await read('products/' + file)).includes(id), file + ' must not recommend sold-out stock');
  }
});

test('Ditka jersey has an indexable sold archive and redirects without purchase controls', async () => {
  const item = soldItems.find((item) => item.id === id);
  assert.equal(item.soldOut, true);
  assert.ok(!item.availableAgain);
  const html = await read('sold/' + slug);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(schema.brand.name, 'Nike');
  assert.match(html, /class="sold-status">Sold out/);
  assert.match(html, /Last listed price/);
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay|View current eBay listing/);
  assert.ok((await read('sitemap-sold.xml')).includes('/sold/' + slug));
  for (const path of [slug, slug.replace(/\.html$/, '')]) {
    assert.ok((await read('_redirects')).includes('/products/' + path + '  /sold/' + slug + '  301'));
  }
  assert.ok((await readFile(resolve(root, 'assets/images/sold/branded/' + id + '.webp'))).length > 1000);
});

test('checkout rejects a stale cart containing the sold Ditka jersey before calling Stripe', async () => {
  const previous = { enabled: process.env.STRIPE_CHECKOUT_ENABLED, key: process.env.STRIPE_SECRET_KEY };
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
      body: JSON.stringify({ items: [{ id, quantity: 1 }] })
    }));
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /no longer available/i);
  } finally {
    for (const [key, value] of [['STRIPE_CHECKOUT_ENABLED', previous.enabled], ['STRIPE_SECRET_KEY', previous.key]]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

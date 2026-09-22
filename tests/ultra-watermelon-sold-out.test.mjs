import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, categories, directPriceCents, findCatalogItem, maxQuantity } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const id = '407207453659';
const reserveId = '407205565491';
const root = resolve(import.meta.dirname, '..');
const slug = 'monster-energy-ultra-watermelon-' + id + '.html';
const read = (file) => readFile(resolve(root, file), 'utf8');

test('Ultra Watermelon is removed from active sales while Reserve Watermelon remains unchanged', async () => {
  assert.equal(findCatalogItem(id), undefined);
  assert.equal(categories.all.count, catalog.length);
  assert.equal(categories.drinks.count, catalog.filter((item) => item.category === 'drinks').length);
  for (const file of ['google-merchant-feed.xml', 'sitemap-products.xml', 'index.html', 'rare-drinks.html']) {
    assert.ok(!(await read(file)).includes(id), file);
  }
  for (const file of await readdir(resolve(root, 'products'))) {
    assert.ok(!(await read('products/' + file)).includes(id), file + ' must not recommend sold-out stock');
  }
  const reserve = findCatalogItem(reserveId);
  assert.equal(reserve.name, 'Monster Reserve Watermelon (2-Pack)');
  assert.equal(maxQuantity(reserve), 1);
  assert.equal(reserve.price, '$19.99');
  assert.equal(directPriceCents(reserve), 1929);
  assert.ok((await read('google-merchant-feed.xml')).includes('dc-' + reserveId));
  const reservePage = await read('products/monster-reserve-watermelon-2-pack-' + reserveId + '.html');
  assert.match(reservePage, /https:\/\/schema.org\/InStock/);
  assert.match(reservePage, /data-add-to-cart/);
});

test('Ultra Watermelon archive and journal remain indexable without advertising available stock', async () => {
  const item = soldItems.find((item) => item.id === id);
  assert.equal(item.soldOut, true);
  assert.ok(!item.availableAgain);
  const html = await read('sold/' + slug);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(schema.brand.name, 'Monster Energy');
  assert.match(html, /class="sold-status">Sold out/);
  assert.match(html, /Last listed price/);
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay|View current eBay listing/);
  assert.ok((await read('sitemap-sold.xml')).includes('/sold/' + slug));
  assert.ok((await read('_redirects')).includes('/products/' + slug + '  /sold/' + slug + '  301'));
  const article = await read('journal/is-monster-ultra-watermelon-discontinued.html');
  assert.match(article, /zero cans available/);
  assert.doesNotMatch(article, /article-shop-callout|currently has a full 16-fluid-ounce/);
  assert.ok((await read('sitemap-journal.xml')).includes('is-monster-ultra-watermelon-discontinued.html'));
  assert.ok((await readFile(resolve(root, 'assets/images/sold/branded/' + id + '.webp'))).length > 1000);
});

test('checkout rejects a stale cart containing the sold Ultra Watermelon can before calling Stripe', async () => {
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

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, categories, findCatalogItem, maxQuantity } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const id = '407203102419';
const root = resolve(import.meta.dirname, '..');
const slug = 'red-bull-blue-edition-blueberry-4-pack-' + id + '.html';
const read = (file) => readFile(resolve(root, file), 'utf8');

test('sold-out Blueberry is absent from active inventory, recommendations, and shopping feeds', async () => {
  assert.equal(findCatalogItem(id), undefined);
  assert.equal(categories.all.count, catalog.length);
  assert.equal(categories.drinks.count, catalog.filter((item) => item.category === 'drinks').length);
  for (const file of ['google-merchant-feed.xml', 'sitemap-products.xml', 'index.html', 'rare-drinks.html']) {
    assert.ok(!(await read(file)).includes(id), file);
  }
  for (const file of await readdir(resolve(root, 'products'))) {
    assert.ok(!(await read('products/' + file)).includes(id), file + ' must not recommend sold-out stock');
  }
  for (const watermelonId of ['407207453659', '407205565491']) {
    assert.equal(maxQuantity(findCatalogItem(watermelonId)), 1);
  }
});

test('Blueberry archive and article preserve search access without a purchase action', async () => {
  const item = soldItems.find((item) => item.id === id);
  assert.equal(item.soldOut, true);
  assert.ok(!item.availableAgain);
  const html = await read('sold/' + slug);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(schema.brand.name, 'Red Bull');
  assert.match(html, /class="sold-status">Sold out/);
  assert.match(html, /Last listed price/);
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay|View current eBay listing/);
  assert.ok((await read('sitemap-sold.xml')).includes('/sold/' + slug));
  assert.ok((await read('_redirects')).includes('/products/' + slug + '  /sold/' + slug + '  301'));
  const article = await read('journal/is-red-bull-blue-edition-blueberry-discontinued.html');
  assert.match(article, /zero packs available/);
  assert.doesNotMatch(article, /article-shop-callout|currently lists a four-pack/);
  assert.ok((await read('sitemap-journal.xml')).includes('is-red-bull-blue-edition-blueberry-discontinued.html'));
  assert.ok((await readFile(resolve(root, 'assets/images/sold/branded/' + id + '.webp'))).length > 1000);
});

test('checkout rejects an outdated cart containing a sold-out Blueberry four-pack before calling Stripe', async () => {
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

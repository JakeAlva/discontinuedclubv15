import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, categories, findCatalogItem, directPriceCents, maxQuantity } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const id = '407281698826';
const root = resolve(import.meta.dirname, '..');
const slug = `pokemon-destined-rivals-booster-bundle-${id}.html`;
const read = (file) => readFile(resolve(root, file), 'utf8');

test('both Destined Rivals bundles are removed from purchase surfaces, not the four-pack lot', async () => {
  assert.equal(findCatalogItem(id), undefined);
  assert.equal(categories.all.count, catalog.length);
  assert.equal(categories.collectibles.count, 8);
  const lot = findCatalogItem('407134944288');
  assert.equal(maxQuantity(lot), 2);
  assert.equal(directPriceCents(lot), 3184);
  for (const prefix of ['', 'dist/']) {
    for (const file of ['assets/catalog.js', 'google-merchant-feed.xml', 'sitemap-products.xml', 'index.html', 'out-now.html']) {
      assert.ok(!(await read(prefix + file)).includes(id), prefix + file);
    }
    const products = await readdir(resolve(root, prefix, 'products'));
    assert.ok(!products.includes(slug));
    for (const file of products) {
      assert.ok(!(await read(`${prefix}products/${file}`)).includes(id), `${prefix}${file}: no sold bundle recommendations`);
    }
  }
});

test('sold bundles keep an indexable archive, real images and old product redirects', async () => {
  const item = soldItems.find((row) => row.id === id);
  assert.equal(item.soldOut, true);
  assert.ok(!item.availableAgain);
  const html = await read(`dist/sold/${slug}`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(schema.brand.name, 'The Pokemon Company International');
  assert.match(html, /class="sold-status">Sold out/);
  assert.match(html, /Last listed price/);
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay|View current eBay listing/);
  assert.ok((await read('dist/sitemap-sold.xml')).includes(`/sold/${slug}`));
  for (const path of [slug, slug.replace(/\.html$/, '')]) {
    assert.ok((await read('dist/_redirects')).includes(`/products/${path}  /sold/${slug}  301`));
  }
  for (const variant of ['', 'branded/']) {
    assert.ok((await readFile(resolve(root, `dist/assets/images/sold/${variant}${id}.webp`))).length > 1000);
  }
  const sale = JSON.parse(await read('data/store-sales-update-2026-10-26.json')).soldOut.find((row) => row.id === id);
  assert.equal(sale.soldQuantity, 2);
  assert.equal(sale.remainingQuantity, 0);
});

test('stale carts for one or both sold bundles are rejected before calling Stripe', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const old = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const quantity of [1, 2]) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /no longer available/i);
    }
  } finally {
    keys.forEach((key, index) => { if (old[index] === undefined) delete process.env[key]; else process.env[key] = old[index]; });
  }
});

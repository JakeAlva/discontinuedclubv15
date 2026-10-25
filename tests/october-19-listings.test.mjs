import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { catalog, categories, directPriceCents, maxQuantity, parsePriceCents, storeConfig } from '../lib/store-catalog.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const audit = JSON.parse(await read('data/ebay-inventory-update-2026-10-19.json'));
const sales = JSON.parse(await read('data/ebay-sales-update-2026-10-22.json'));
const latestSales = JSON.parse(await read('data/store-sales-update-2026-10-25.json'));
const soldIds = new Set([...sales.soldOut, ...latestSales.soldOut].map((item) => item.id));
const active = audit.activeSnapshot.filter(([id]) => !soldIds.has(id));
const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;

test('remaining listings preserve the October 19 snapshot after confirmed sales', () => {
  assert.equal(catalog.length, audit.activeListingCount - soldIds.size);
  assert.deepEqual(catalog.map((item) => item.id).sort(), active.map(([id]) => id).sort());
  for (const [id, price, quantity] of active) {
    const item = catalog.find((row) => row.id === id);
    assert.equal(parsePriceCents(item.price), price, `${id} eBay price`);
    assert.equal(maxQuantity(item), quantity, `${id} quantity`);
  }
  assert.equal(categories.all.count, 74);
  assert.equal(categories.drinks.count, 36);
  assert.equal(categories.home.count, 2);
  assert.equal(categories['kids-shoes'].count, 10);
  assert.equal(catalog.at(-1).id, '406760868081');
  assert.equal(storeConfig.freeShippingThresholdCents, 20000);
});

test('new listings have matching prices, weights, schema, feed entries and clear photographs', async () => {
  const feed = new XMLParser({ parseTagValue: false }).parse(await read('dist/google-merchant-feed.xml')).rss.channel.item;
  const shop = await read('dist/out-now.html');
  const sitemap = await read('dist/sitemap-products.xml');
  for (const record of audit.additions) {
    const item = catalog.find((row) => row.id === record.id);
    assert.equal(item.category, record.category);
    assert.equal(directPriceCents(item), record.directPriceCents);
    assert.equal(item.shippingWeightOz, record.shippingWeightOz);
    const href = `products/${slug(item)}`;
    const url = `https://discontinuedclub.com/${href}`;
    const html = await read(`dist/${href}`);
    assert.ok(shop.includes(`href="${href}"`));
    assert.ok(sitemap.includes(url));
    assert.ok(html.includes(`rel="canonical" href="${url}"`));
    assert.ok(html.includes(item.purchaseNote));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema.offers.availability, 'https://schema.org/InStock');
    assert.equal(schema.offers.price, (record.directPriceCents / 100).toFixed(2));
    const entry = feed.find((row) => row['g:id'] === `dc-${record.id}`);
    assert.equal(entry['g:price'], `${(record.directPriceCents / 100).toFixed(2)} USD`);
    assert.equal(entry['g:image_link'], `https://discontinuedclub.com/assets/images/listings/merchant/${record.id}.webp`);
    for (const variant of ['merchant', 'branded']) {
      const image = new URL(`../assets/images/listings/${variant}/${record.id}.webp`, import.meta.url);
      const meta = await sharp(image.pathname).metadata();
      assert.equal(meta.width, 1200);
      assert.equal(meta.height, 1200);
    }
  }
  const toy = catalog.find((item) => item.id === '407298156099');
  assert.equal(toy.gallery.length, 5);
  assert.match(toy.purchaseNote, /not for children under 8/);
  for (const photo of toy.gallery) assert.ok((await readFile(new URL(`../${photo.src}`, import.meta.url))).length > 1000);
});

test('sold Frost Bite is archived and removed from all purchase surfaces', async () => {
  const id = '406794914124';
  const page = `mountain-dew-zero-sugar-frost-bite-${id}.html`;
  assert.equal(catalog.find((item) => item.id === id), undefined);
  for (const file of ['dist/out-now.html', 'dist/google-merchant-feed.xml', 'dist/sitemap-products.xml']) assert.ok(!(await read(file)).includes(id), file);
  const html = await read(`dist/sold/${page}`);
  assert.match(html, /https:\/\/schema.org\/OutOfStock/);
  assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay/);
  for (const path of [page, page.replace(/\.html$/, '')]) assert.ok((await read('_redirects')).includes(`/products/${path}  /sold/${page}  301`));
});

test('checkout rejects excess new inventory and the sold can without calling Stripe', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const old = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const { id, quantity } of [...audit.additions, { id: '406794914124', quantity: 0 }]) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity: quantity + 1 }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /available quantity changed|no longer available/);
    }
  } finally {
    keys.forEach((key, index) => { if (old[index] === undefined) delete process.env[key]; else process.env[key] = old[index]; });
  }
});

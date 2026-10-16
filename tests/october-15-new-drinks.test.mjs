import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { catalog, categories, directPriceCents, maxQuantity, storeConfig } from '../lib/store-catalog.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const audit = JSON.parse(await read('data/ebay-new-drinks-2026-10-15.json'));
const expectedPrices = [771, 1929, 2412, 3376, 1929];

test('five new drinks match verified eBay unit counts, prices and packaged weights', () => {
  for (const [index, record] of audit.listings.entries()) {
    const item = catalog.find((row) => row.id === record.id);
    assert.equal(catalog.filter((row) => row.id === record.id).length, 1);
    assert.equal(item.category, 'drinks');
    assert.equal(maxQuantity(item), record.quantity);
    assert.equal(directPriceCents(item), expectedPrices[index]);
    assert.equal(item.shippingWeightOz, record.shippingWeightOz);
    assert.equal(item.taxCode, 'txcd_41040002');
  }
  assert.equal(categories.all.count, 74);
  assert.equal(categories.drinks.count, 36);
  assert.equal(storeConfig.freeShippingThresholdCents, 20000);
});

test('new drink pages, clean merchant images and sitemaps match the catalog', async () => {
  const feed = new XMLParser({ parseTagValue: false }).parse(await read('dist/google-merchant-feed.xml')).rss.channel.item;
  const shop = await read('dist/out-now.html');
  const sitemap = await read('dist/sitemap-products.xml');
  for (const record of audit.listings) {
    const item = catalog.find((row) => row.id === record.id);
    const entry = feed.find((row) => row['g:id'] === `dc-${record.id}`);
    const href = entry['g:link'].replace('https://discontinuedclub.com/', '');
    const html = await read(`dist/${href}`);
    assert.ok(sitemap.includes(entry['g:link']));
    assert.ok(shop.includes(`href="${href}"`));
    assert.ok(html.includes(`rel="canonical" href="${entry['g:link']}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.ok(html.includes(`data-add-to-cart="${record.id}"`));
    if (record.quantity > 1) assert.ok(html.includes(`data-max="${record.quantity}"`));
    else assert.match(html, /class="product-quantity-single"/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema.offers.price, (directPriceCents(item) / 100).toFixed(2));
    assert.equal(schema.offers.availability, 'https://schema.org/InStock');
    assert.equal(entry['g:image_link'], `https://discontinuedclub.com/assets/images/listings/merchant/${record.id}.webp`);
    for (const variant of ['branded', 'merchant']) {
      const file = new URL(`../assets/images/listings/${variant}/${record.id}.webp`, import.meta.url);
      const meta = await sharp(file.pathname).metadata();
      assert.equal(meta.width, 1200);
      assert.equal(meta.height, 1200);
    }
    if (item.purchaseNote) assert.ok(html.includes(item.purchaseNote));
  }
});

test('older bottles retain collection-only condition warnings and distinct units', () => {
  for (const id of ['407293775090', '407293697579']) {
    const item = catalog.find((row) => row.id === id);
    assert.match(item.purchaseNote, /not (?:for )?consumption/);
    assert.match(item.purchaseNote, /studio photo/);
    assert.match(item.purchaseNote, /mint condition/);
  }
  const cherry = catalog.find((row) => row.id === '407293697579');
  assert.match(cherry.detail, /one bottle, not a multipack/);
  assert.match(cherry.purchaseNote, /February 24, 2020/);
  const lime = catalog.find((row) => row.id === '407293533835');
  assert.equal(lime.gallery.length, 3);
  assert.equal(maxQuantity(lime), 1);
  assert.equal(catalog.find((row) => row.id === '407205693415'), undefined);
});

test('all new drinks reject over-stock quantities before any Stripe request', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const old = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const { id, quantity } of audit.listings) {
      const result = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity: quantity + 1 }] })
      }));
      assert.equal(result.status, 400);
      assert.match((await result.json()).error, /available quantity changed/);
    }
  } finally {
    keys.forEach((key, index) => { if (old[index] === undefined) delete process.env[key]; else process.env[key] = old[index]; });
  }
});

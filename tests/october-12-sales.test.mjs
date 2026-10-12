import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { catalog, categories, findCatalogItem, maxQuantity } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const whiteJerseyId = '407063650804';
const gingerbreadId = '406794860747';
const oldJerseySlug = `nashville-predators-p-k-subban-jersey-${whiteJerseyId}.html`;
const soldJerseySlug = `nashville-predators-p-k-subban-jersey-white-size-m-${whiteJerseyId}.html`;

test('one Gingerbread Snapd can remains and the gold Subban jersey stays available', async () => {
  assert.equal(maxQuantity(findCatalogItem(gingerbreadId)), 1);
  assert.match(findCatalogItem('407063633707').detail, /gold/);
  const html = await read(`products/mountain-dew-gingerbread-snap-d-${gingerbreadId}.html`);
  assert.match(html, /class="sold-status available">Last one/);
  const feed = new XMLParser({ parseTagValue: false }).parse(await read('google-merchant-feed.xml')).rss.channel.item;
  assert.equal(feed.find((item) => item['g:id'] === `dc-${gingerbreadId}`)['g:availability'], 'in_stock');
  assert.equal(categories.all.count, catalog.length);
  for (const [category, value] of Object.entries(categories)) {
    if (category !== 'all') assert.equal(value.count, catalog.filter((item) => item.category === category).length);
  }
});

test('white Subban jersey is removed from active listings, recommendations and feed', async () => {
  assert.equal(findCatalogItem(whiteJerseyId), undefined);
  for (const file of ['google-merchant-feed.xml', 'sitemap-products.xml', 'index.html', 'out-now.html']) {
    assert.ok(!(await read(file)).includes(whiteJerseyId), file);
  }
  for (const file of await readdir(resolve(root, 'products'))) {
    assert.ok(!(await read(`products/${file}`)).includes(whiteJerseyId), file);
  }
});

test('white Subban jersey retains an indexable sold record and old URL redirects', async () => {
  const item = soldItems.find((item) => item.id === whiteJerseyId);
  assert.equal(item.soldOut, true);
  assert.match(item.name, /White, Size M/);
  const html = await read(`sold/${soldJerseySlug}`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(schema.brand.name, 'Fanatics');
  assert.match(html, /<meta name="robots" content="index, follow/);
  assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay|View current eBay listing/);
  assert.ok((await read('sitemap-sold.xml')).includes(`/sold/${soldJerseySlug}`));
  for (const slug of [oldJerseySlug, oldJerseySlug.replace(/\.html$/, '')]) {
    assert.ok((await read('_redirects')).includes(`/products/${slug}  /sold/${soldJerseySlug}  301`));
  }
  assert.ok((await readFile(resolve(root, `assets/images/sold/branded/${whiteJerseyId}.webp`))).length > 1000);
});

test('checkout rejects the sold jersey and two Gingerbread cans before contacting Stripe', async () => {
  const previous = { enabled: process.env.STRIPE_CHECKOUT_ENABLED, key: process.env.STRIPE_SECRET_KEY };
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const [id, quantity, error] of [[whiteJerseyId, 1, /no longer available/i], [gingerbreadId, 2, /available quantity changed/i]]) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, error);
    }
  } finally {
    for (const [key, value] of [['STRIPE_CHECKOUT_ENABLED', previous.enabled], ['STRIPE_SECRET_KEY', previous.key]]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

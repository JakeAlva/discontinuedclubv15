import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { catalog, findCatalogItem, maxQuantity, directPriceCents, storeConfig } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import { dietCokeCherryReturnReport as diet } from '../scripts/diet-coke-cherry-return-report.mjs';
import { cherryFloatStatusReport as float } from '../scripts/cherry-float-status-report.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const id = '407260159541';
const href = `products/pokemon-journey-together-booster-bundle-${id}.html`;

test('Journey Together restock uses the new eBay listing, price and one-box stock', async () => {
  const item = findCatalogItem(id);
  assert.ok(catalog.length >= 56);
  assert.equal(item.price, '$39.99');
  assert.equal(directPriceCents(item), 3859);
  assert.equal(maxQuantity(item), 1);
  assert.match(item.detail, /Factory-sealed English.*6 booster packs/);
  assert.equal(item.shippingWeightOz, 24);
  assert.equal(storeConfig.freeShippingThresholdCents, 10000);
  assert.equal(findCatalogItem('407195902675'), undefined);
  assert.equal(soldItems.find((item) => item.id === '407195902675').soldOut, true);
  const html = await read(href);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.offers.price, '38.59');
  assert.equal(schema.offers.availability, 'https://schema.org/InStock');
  assert.equal(schema.itemCondition, 'https://schema.org/NewCondition');
  assert.ok(html.includes(`data-add-to-cart="${id}"`));
  assert.ok((await read('sitemap-products.xml')).includes(href));
  assert.ok((await read('google-merchant-feed.xml')).includes(`<g:id>dc-${id}</g:id>`));
  assert.ok(!(await read('_redirects')).includes(`/${href} `));
  for (const type of ['branded', 'merchant']) {
    const metadata = await sharp(resolve(root, `assets/images/listings/${type}/${id}.webp`)).metadata();
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 1200);
  }
});

test('two boxes cannot be submitted to checkout when only one is available', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
      body: JSON.stringify({ items: [{ id, quantity: 2 }] })
    }));
    assert.equal(response.status, 400);
  } finally {
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});

test('October 2 articles distinguish current listings, local stock and overseas claims', async () => {
  assert.match(diet.answer, /not an announcement of a new October launch/);
  assert.match(float.answer, /not a guarantee of stock/);
  const copy = float.sections.flatMap((section) => section.paragraphs).join(' ');
  assert.match(copy, /Neither page establishes a permanent U.S. commitment/);
  const index = JSON.parse(await read('assets/journal-index.json'));
  for (const report of [diet, float]) {
    assert.equal(report.checkedDate, '2026-10-02');
    assert.equal(report.statusKey, 'current');
    assert.equal(report.shop, undefined);
    const href = `journal/${report.slug}.html`;
    assert.ok(index.some((item) => item.slug === report.slug));
    assert.ok((await read('sitemap-journal.xml')).includes(href));
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans|U.S.-market definition of discontinued/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-02');
    assert.equal(graph[0].headline, report.title);
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    assert.ok(image.width >= 1000);
    assert.ok(report.sources.length >= 4);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    assert.ok(selectReports(index, { q: report.product, brand: 'Coca-Cola', status: 'current', sort: 'newest', page: 1 }).items.some((item) => item.slug === report.slug));
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { catalog, categories, findCatalogItem, maxQuantity, storeConfig } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { dewTrolli2026Report as dew } from '../scripts/dew-trolli-2026-report.mjs';
import { starbucksAerocanoReport as coffee } from '../scripts/starbucks-aerocano-report.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const soldIds = ['407195902675', '407117217273', '406760474283'];
const costumeId = '407253023756';

test('September 29 inventory matches the eBay reconciliation and preserves shipping', async () => {
  assert.equal(catalog.length, 55);
  for (const [category, metadata] of Object.entries(categories)) {
    assert.equal(metadata.count, category === 'all' ? catalog.length : catalog.filter((item) => item.category === category).length);
  }
  assert.equal(maxQuantity(findCatalogItem('407134944288')), 2);
  assert.notEqual(findCatalogItem('407134944288').directCheckoutEnabled, false, 'Direct orders enabled after Stripe stock reconciliation');
  assert.equal(maxQuantity(findCatalogItem('407205565491')), 1, 'Reserve Watermelon remains available');
  assert.equal(storeConfig.freeShippingThresholdCents, 10000);
  const home = await read('index.html');
  assert.ok(home.includes(`Shop all ${catalog.length} listings`));
  assert.ok((await read('out-now.html')).includes(`${catalog.length} current listings`));
  assert.match(home, /Two lots currently listed/);
  assert.doesNotMatch(home, /Five lots available|Claim a \$31\.84/);
  const feed = await read('google-merchant-feed.xml');
  for (const id of soldIds) {
    assert.equal(findCatalogItem(id), undefined);
    assert.equal(soldItems.find((item) => item.id === id).soldOut, true);
    assert.ok(!feed.includes(id));
    assert.ok(!(await read('sitemap-products.xml')).includes(id));
    const archive = (await read('sitemap-sold.xml')).match(new RegExp(`<loc>https://discontinuedclub.com/(sold/[^<]*${id}[^<]*)</loc>`))?.[1];
    assert.ok(archive);
    const html = await read(archive);
    assert.match(html, /https:\/\/schema.org\/OutOfStock/);
    assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay/);
    assert.ok((await read('_redirects')).includes(`/products/${archive.slice(5)}  /${archive}  301`));
  }
});

test('costume uses verified size, used condition and matching direct checkout offers', async () => {
  const costume = findCatalogItem(costumeId);
  assert.equal(costume.price, '$14.99');
  assert.equal(maxQuantity(costume), 1);
  assert.match(costume.detail, /U.S. size 2-4T/);
  assert.match(costume.detail, /worn once/);
  assert.match(costume.detail, /Microphone not included/);
  const html = await read(`products/rubie-s-elvis-presley-toddler-costume-2-4t-${costumeId}.html`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.itemCondition, 'https://schema.org/UsedCondition');
  assert.equal(schema.brand.name, "Rubie's");
  assert.notEqual(costume.directCheckoutEnabled, false);
  assert.equal(schema.offers.price, '14.47');
  assert.equal(schema.offers.url, `https://discontinuedclub.com/products/rubie-s-elvis-presley-toddler-costume-2-4t-${costumeId}.html`);
  assert.ok(schema.offers.shippingDetails);
  assert.ok(html.includes(`data-add-to-cart="${costumeId}"`));
  assert.doesNotMatch(html, /Expected direct|Direct checkout expected/);
  assert.ok((await read('sitemap-products.xml')).includes(costumeId));
  assert.ok((await read('google-merchant-feed.xml')).includes(costumeId));
});

test('stale sold carts and quantities above reconciled stock are rejected before Stripe', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const [id, quantity] of [...soldIds.map((id) => [id, 1]), ['407134944288', 3], [costumeId, 2]]) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity }] })
      }));
      assert.equal(response.status, 400, `${id}: ${await response.text()}`);
    }
  } finally {
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});

test('September 29 reporting remains factual, linked, indexable and searchable', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  for (const report of [dew, coffee]) {
    assert.equal(report.checkedDate, '2026-09-29');
    assert.equal(report.statusKey, 'launch');
    assert.ok(report.sources.length >= 4);
    assert.equal(report.shop, undefined);
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
    const href = `journal/${report.slug}.html`;
    for (const file of ['index.html', 'blog.html', 'sitemap-journal.xml']) assert.ok((await read(file)).includes(href), file);
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0]['@type'], 'Article');
    assert.equal(graph[0].datePublished, '2026-09-29');
    assert.equal(graph[0].about['@type'], 'Thing');
    assert.doesNotMatch(html, /article-shop-callout|For older full cans|U.S.-market definition of discontinued/);
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.equal(image.format, 'webp');
    assert.ok(image.width >= 768 && image.height >= 768);
    assert.match(report.caption, /official/);
    assert.equal(selectReports(index, { q: report.product, brand: '', status: 'launch', sort: 'newest', page: 1 }).items[0].slug, report.slug);
  }
  assert.match(dew.answer, /August 24 through October/);
  assert.match(coffee.answer, /original and Caramel/);
  assert.match(coffee.sections.flatMap((section) => section.paragraphs).join(' '), /not a U.S. launch announcement/);
});

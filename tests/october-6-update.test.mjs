import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { catalog, categories, findCatalogItem, directPriceCents, maxQuantity, storeConfig } from '../lib/store-catalog.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { holidayCreamyVanillaReport as coke } from '../scripts/holiday-creamy-vanilla-report.mjs';
import { chessmenOrangeCranberryReport as cookies } from '../scripts/chessmen-orange-cranberry-report.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [
  ['407269224750', 3, 578, 8],
  ['407269188492', 2, 675, 8],
  ['407264848037', 1, 578, 8],
  ['407264808538', 1, 3859, 24]
];

test('October 6 listings have reconciled stock, direct prices and feed entries', async () => {
  assert.equal(catalog.length, 62);
  assert.equal(categories.collectibles.count, 9);
  assert.equal(categories.apparel.count, 14);
  assert.equal(categories['kids-shoes'].count, 3);
  assert.equal(maxQuantity(findCatalogItem('406730413999')), 5);
  assert.equal(findCatalogItem('407253023756'), undefined);
  assert.equal(storeConfig.freeShippingThresholdCents, 20000);
  const feed = new XMLParser({ parseTagValue: false }).parse(await read('google-merchant-feed.xml')).rss.channel.item;
  assert.equal(feed.length, catalog.length);
  assert.ok(!feed.some((item) => item['g:id'] === 'dc-407253023756'));
  for (const [id, quantity, price, weight] of additions) {
    const item = findCatalogItem(id);
    assert.equal(item.category, 'collectibles');
    assert.equal(maxQuantity(item), quantity);
    assert.equal(directPriceCents(item), price);
    assert.equal(item.shippingWeightOz, weight);
    const record = feed.find((item) => item['g:id'] === `dc-${id}`);
    assert.equal(record['g:price'], `${(price / 100).toFixed(2)} USD`);
    assert.equal(record['g:availability'], 'in_stock');
    const href = record['g:link'].replace('https://discontinuedclub.com/', '');
    assert.ok((await read('sitemap-products.xml')).includes(href));
    const html = await read(`dist/${href}`);
    assert.match(html, /data-add-to-cart/);
    assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
    for (const folder of ['branded', 'merchant']) {
      const image = await sharp(resolve(root, `assets/images/listings/${folder}/${id}.webp`)).metadata();
      assert.ok(image.width >= 1000 && image.height >= 1000);
    }
  }
});

test('October 6 inventory rejects excess quantities and a stale costume cart', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    const requests = [...additions.map(([id, quantity]) => [id, quantity + 1]), ['406730413999', 6], ['407253023756', 1]];
    for (const [id, quantity] of requests) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity }] })
      }));
      assert.equal(response.status, 400, `${id}: ${await response.text()}`);
    }
  } finally {
    keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
  }
});

test('October 6 articles are linked, searchable and indexable with accurate metadata', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const pages = (await readdir(root)).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  const library = (await Promise.all(pages.map(read))).join('\n');
  for (const report of [coke, cookies]) {
    const href = `journal/${report.slug}.html`;
    assert.ok(library.includes(`href="${href}"`), `A static journal page must link ${href}`);
    assert.ok((await read('sitemap-journal.xml')).includes(href));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-06');
    assert.equal(graph[0].dateModified, '2026-10-06');
    assert.equal(graph[0].headline, report.title);
    assert.equal(graph[1].mainEntity.length, report.faq.length);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    const result = selectReports(index, { q: report.product, brand: report.brand, status: 'launch', sort: 'newest', page: 1 });
    assert.ok(result.items.some((item) => item.slug === report.slug));
  }
});

test('reporting distinguishes sightings, confirmed regions and seasonal releases', () => {
  assert.equal(coke.statusLabel, 'U.S. sightings reported');
  assert.match(coke.answer, /not independently verified/);
  assert.match(coke.answer, /Great Britain and the Netherlands/);
  assert.match(coke.sections.flatMap((section) => section.paragraphs).join(' '), /not an American on-sale date/);
  assert.equal(cookies.statusLabel, 'Confirmed limited edition');
  assert.match(cookies.sections.flatMap((section) => section.paragraphs).join(' '), /not a claim that the cookie debuted today/);
  assert.match(cookies.sections.flatMap((section) => section.paragraphs).join(' '), /catalog naming mismatch/);
  for (const report of [coke, cookies]) assert.match(report.disclosure, /does not currently sell/);
});

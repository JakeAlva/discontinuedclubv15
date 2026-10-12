import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { catalog, categories, findCatalogItem, directPriceCents, maxQuantity } from '../lib/store-catalog.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { alaniLimeSlushReturnReport as lime } from '../scripts/alani-lime-slush-return-report.mjs';
import { javaMonsterDubaiChocolateReport as java } from '../scripts/java-monster-dubai-chocolate-report.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [['407283282883', 1, 8202, 3], ['407281698826', 2, 5789, 4]];

test('October 12 bundles have matching inventory, galleries, prices and indexable pages', async () => {
  assert.equal(catalog.length, 70);
  assert.equal(categories.collectibles.count, 11);
  const feed = new XMLParser({ parseTagValue: false }).parse(await read('google-merchant-feed.xml')).rss.channel.item;
  for (const [id, quantity, cents, photos] of additions) {
    const item = findCatalogItem(id);
    assert.equal(item.category, 'collectibles');
    assert.equal(maxQuantity(item), quantity);
    assert.equal(directPriceCents(item), cents);
    assert.equal(item.shippingWeightOz, 24);
    assert.equal(item.gallery.length + 1, photos);
    for (const photo of item.gallery) assert.ok((await readFile(resolve(root, photo.src))).length > 1000);
    const record = feed.find((row) => row['g:id'] === `dc-${id}`);
    assert.equal(record['g:price'], `${(cents / 100).toFixed(2)} USD`);
    assert.equal(record['g:availability'], 'in_stock');
    const href = record['g:link'].replace('https://discontinuedclub.com/', '');
    assert.ok((await read('sitemap-products.xml')).includes(href));
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${record['g:link']}"`));
    assert.ok(html.includes(`data-add-to-cart="${id}"`));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema.offers.price, (cents / 100).toFixed(2));
    assert.equal(schema.offers.availability, 'https://schema.org/InStock');
  }
  assert.equal(maxQuantity(findCatalogItem('407260159541')), 2);
  assert.equal(directPriceCents(findCatalogItem('407260159541')), 3859);
  assert.equal(maxQuantity(findCatalogItem('407134944288')), 2, 'Separate four-pack lots stay unchanged');
  assert.equal(findCatalogItem('407205693415'), undefined, 'Reserved Lime Slush is not for sale');
});

test('new bundles and Journey Together reject orders above verified stock', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const [id, quantity] of [...additions, ['407260159541', 2]]) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity: quantity + 1 }] })
      }));
      assert.equal(response.status, 400);
    }
  } finally {
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});

test('October 12 reports are discoverable in static links, search, sitemap and article schema', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const pages = (await readdir(root)).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  let library = '';
  for (const page of pages) library += await read(page);
  for (const report of [lime, java]) {
    const href = `journal/${report.slug}.html`;
    assert.ok(library.includes(`href="${href}"`));
    assert.ok((await read('sitemap-journal.xml')).includes(href));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-12');
    assert.equal(graph[0].dateModified, '2026-10-12');
    assert.equal(graph[0].headline, report.title);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    assert.ok(selectReports(index, { q: report.product, brand: report.brand, status: report.statusKey, sort: 'newest', page: 1 }).items.some((item) => item.slug === report.slug));
  }
});

test('Lime Slush history is corrected without inventing a confirmed return or changing publication date', async () => {
  assert.equal(lime.statusKey, 'rumor');
  assert.match(lime.answer, /not found a verified Alani Nu announcement/);
  assert.equal(java.statusKey, 'launch');
  assert.match(java.answer, /200 mg/);
  const old = await read('journal/is-alani-nu-lime-slush-discontinued.html');
  const graph = JSON.parse(old.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  assert.equal(graph[0].datePublished, '2026-09-11');
  assert.equal(graph[0].dateModified, '2026-10-12');
  assert.ok(old.includes(`journal/${lime.slug}.html`));
  assert.match(old, /zero packs available to purchase/);
  assert.match(old, /Earlier wording was too definite/);
});

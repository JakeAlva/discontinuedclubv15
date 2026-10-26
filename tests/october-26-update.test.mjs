import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { catalog, directPriceCents, maxQuantity, parsePriceCents } from '../lib/store-catalog.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { redBullPistachioBerriesReport as redBull } from '../scripts/red-bull-pistachio-berries-report.mjs';
import { starryCranberryBlizzReport as starry } from '../scripts/starry-cranberry-blizz-report.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const audit = JSON.parse(await read('data/ebay-inventory-update-2026-10-26.json'));
const sales = JSON.parse(await read('data/store-sales-update-2026-10-26.json'));
const soldIds = new Set(sales.soldOut.map((item) => item.id));
const remaining = audit.activeSnapshot.filter(([id]) => !soldIds.has(id));

test('website listings match the 75-listing October 26 snapshot less confirmed sales', () => {
  assert.equal(audit.activeSnapshot.length, 75);
  assert.equal(new Set(audit.activeSnapshot.map(([id]) => id)).size, 75);
  assert.deepEqual(catalog.map((item) => item.id).sort(), remaining.map(([id]) => id).sort());
  for (const [id, price, quantity] of remaining) {
    const item = catalog.find((row) => row.id === id);
    assert.equal(parsePriceCents(item.price), price, `${id}: eBay reference price`);
    assert.equal(maxQuantity(item), quantity, `${id}: stock`);
    assert.equal(directPriceCents(item), Math.round(price * 0.965), `${id}: direct discount`);
  }
});

test('Pistachio single can has verified shipping, date, images and direct price', async () => {
  const item = catalog.find((row) => row.id === '407301997130');
  assert.equal(item.shippingWeightOz, 16);
  assert.equal(directPriceCents(item), 964);
  assert.match(item.detail, /Regular version containing sugar, not Sugarfree/);
  assert.match(item.purchaseNote, /06-02-27/);
  assert.doesNotMatch(item.purchaseNote, /02\.11\.22|February|June|nut-free/i);
  for (const variant of ['branded', 'merchant']) {
    const metadata = await sharp(resolve(root, `assets/images/listings/${variant}/${item.id}.webp`)).metadata();
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 1200);
  }
  const html = await read('dist/products/red-bull-winter-edition-pistachio-berries-8-4-oz-single-can-407301997130.html');
  assert.match(html, /data-add-to-cart="407301997130"/);
  assert.match(html, /"price":"9.64"/);
  assert.match(html, /06-02-27/);
  assert.ok((await read('dist/google-merchant-feed.xml')).includes('dc-407301997130'));
});

test('checkout rejects quantities beyond the newly verified limits before contacting Stripe', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const [id, quantity] of [['407301997130', 4], ['407300260883', 7], ['407297979026', 4]]) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /available quantity changed/);
    }
  } finally {
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});

for (const report of [redBull, starry]) {
  test(`${report.slug} is dated today and discoverable with working assets and links`, async () => {
    assert.equal(reports.filter((item) => item.slug === report.slug).length, 1);
    const href = `journal/${report.slug}.html`;
    const html = await read(`dist/${href}`);
    assert.match(html, /"datePublished":"2026-10-26"/);
    assert.ok((await read('dist/blog.html')).includes(href));
    assert.ok((await read('dist/sitemap-journal.xml')).includes(href));
    assert.ok(JSON.parse(await read('dist/assets/journal-index.json')).some((row) => row.slug === report.slug));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((row) => row.slug === slug), slug);
    for (const [, target] of html.matchAll(/href="([^"#]+\.html)(?:#[^"]*)?"/g)) {
      if (!target.startsWith('https://')) await access(resolve(root, 'dist', target));
    }
    const image = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
  });
}

test('new reports distinguish official releases from actual store stock', () => {
  assert.match(redBull.answer, /seasonal/);
  assert.match(redBull.disclosure, /not taste-tested/);
  assert.match(starry.answer, /Mississippi service territory/);
  assert.match(starry.caption, /2025/);
  assert.match(starry.statusParagraphs.join(' '), /does not.*confirm a regular-sugar/);
});

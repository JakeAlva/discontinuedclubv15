import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { catalog, findCatalogItem, maxQuantity, parsePriceCents } from '../lib/store-catalog.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { alaniNowAvailableReport as alani } from '../scripts/alani-now-available-report.mjs';
import { dutchBrosHolidayReport as dutch } from '../scripts/dutch-bros-holiday-report.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const audit = JSON.parse(await read('data/ebay-inventory-update-2026-11-02.json'));
const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;

test('November 2 catalog exactly matches all 78 listings and 132 available listing units', () => {
  assert.equal(audit.activeSnapshot.length, 78);
  assert.equal(new Set(audit.activeSnapshot.map(([id]) => id)).size, 78);
  assert.deepEqual(catalog.map((item) => [item.id, parsePriceCents(item.price), maxQuantity(item)]).sort(), [...audit.activeSnapshot].sort());
  assert.equal(catalog.reduce((sum, item) => sum + maxQuantity(item), 0), 132);
  for (const record of audit.quantityChanges) assert.equal(maxQuantity(findCatalogItem(record.id)), record.current);
});

test('new Alani pages use accurate single-can sizes, verified prices and working eBay offers', async () => {
  for (const record of audit.additions) {
    const item = findCatalogItem(record.id);
    assert.equal(item.price, '$12.99');
    assert.equal(item.directCheckoutEnabled, false);
    assert.equal(item.shippingWeightOz, record.shippingWeightOz);
    const href = `products/${slug(item)}`;
    const html = await read(`dist/${href}`);
    assert.match(html, /"price":"12.99"/);
    assert.ok(html.includes(`https://www.ebay.com/itm/${item.id}`));
    assert.doesNotMatch(html, /data-add-to-cart|data-product-quantity/);
    for (const file of ['index.html', 'out-now.html', 'sitemap-products.xml']) assert.ok((await read(`dist/${file}`)).includes(href));
    assert.ok(!(await read('dist/google-merchant-feed.xml')).includes(`dc-${item.id}`));
    for (const variant of ['', 'branded/', 'merchant/']) {
      const image = await sharp(resolve(root, `assets/images/listings/${variant}${item.id}.webp`)).metadata();
      assert.ok(image.width >= 900 && image.height >= 900);
    }
  }
  assert.match(findCatalogItem('407329572793').detail, /8.4 fl oz/);
  assert.match(findCatalogItem('407332173468').detail, /12 fl oz/);
});

test('new eBay-only products and excess stock are rejected locally without contacting Stripe', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    const requests = [...audit.additions.map(({ id }) => ({ id, quantity: 1, error: /eBay listing only/ })), ...audit.quantityChanges.map(({ id, current }) => ({ id, quantity: current + 1, error: /available quantity changed/ }))];
    for (const { id, quantity, error } of requests) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' }, body: JSON.stringify({ items: [{ id, quantity }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, error);
    }
  } finally {
    keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
  }
});

for (const report of [alani, dutch]) {
  test(`${report.slug} is published November 2 with working discovery links and accurate imagery`, async () => {
    assert.equal(reports.filter((row) => row.slug === report.slug).length, 1);
    const href = `journal/${report.slug}.html`;
    const html = await read(`dist/${href}`);
    assert.match(html, /"datePublished":"2026-11-02"/);
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    for (const file of ['index.html', 'blog.html', 'sitemap-journal.xml']) assert.ok((await read(`dist/${file}`)).includes(href));
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    for (const related of report.relatedSlugs) assert.ok(reports.some((row) => row.slug === related));
    for (const [, link] of html.matchAll(/href="([^"#]+)"/g)) {
      if (/^(?:https?:|mailto:)/.test(link)) continue;
      await access(resolve(root, 'dist', link.split(/[?#]/)[0].replace(/^\//, '')));
    }
    for (const source of report.sources) assert.ok(html.includes(source.url));
    assert.match(report.disclosure, /not taste-tested/);
  });
}

test('arrival article does not publish stock counts or imply a mixed bundle, and news is not shop stock', () => {
  assert.doesNotMatch(JSON.stringify(alani), /\b(?:20|8|6|5|twenty|eight|six|five)\s+(?:cans|units)\b/i);
  assert.match(alani.answer, /not a two-flavor bundle/);
  assert.match(alani.caption, /made with AI/);
  assert.match(dutch.buyerParagraphs.join(' '), /does not sell these prepared drinks/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { catalog, findCatalogItem, maxQuantity, parsePriceCents } from '../lib/store-catalog.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { trubarDrizzleReport } from '../scripts/trubar-drizzle-report.mjs';
import { matzoHanukkahReport } from '../scripts/matzo-hanukkah-report.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const audit = JSON.parse(await read('data/ebay-inventory-update-2026-10-28.json'));
const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;

test('all 76 current listings and 125 available units match the complete signed-in eBay check', () => {
  assert.equal(audit.activeSnapshot.length, 76);
  assert.equal(new Set(audit.activeSnapshot.map(([id]) => id)).size, 76);
  assert.equal(catalog.reduce((sum, item) => sum + maxQuantity(item), 0), 125);
  assert.deepEqual(catalog.map((item) => [item.id, parsePriceCents(item.price), maxQuantity(item)]).sort(), [...audit.activeSnapshot].sort());
  for (const id of ['407260159541', '407281698826']) assert.equal(findCatalogItem(id), undefined);
});

test('new variants have photos, accurate prices and eBay-only purchase surfaces', async () => {
  for (const record of audit.additions) {
    const item = findCatalogItem(record.id);
    assert.equal(item.directCheckoutEnabled, false);
    assert.equal(item.shippingWeightOz, record.shippingWeightOz);
    const html = await read(`dist/products/${slug(item)}`);
    assert.ok(html.includes(`https://www.ebay.com/itm/${item.id}`));
    assert.doesNotMatch(html, /data-add-to-cart|data-product-quantity/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema.offers.price, (parsePriceCents(item.price) / 100).toFixed(2));
    assert.ok((await read('dist/out-now.html')).includes(`products/${slug(item)}`));
    assert.ok(!(await read('dist/google-merchant-feed.xml')).includes(`dc-${item.id}`));
    for (const variant of ['branded', 'merchant']) {
      const image = await sharp(resolve(root, `dist/assets/images/listings/${variant}/${item.id}.webp`)).metadata();
      assert.ok(image.width >= 900 && image.height >= 900);
    }
  }
  assert.match(findCatalogItem('407320758064').detail, /Sugarfree/);
  assert.match(findCatalogItem('407320767912').detail, /regular.*containing sugar, not Sugarfree/);
  for (const id of ['407320758064', '407320767912']) assert.doesNotMatch(findCatalogItem(id).purchaseNote, /06-02-27|nut-free/i);
  assert.match(findCatalogItem('407321244836').purchaseNote, /oversized.*flat-rate shipping does not apply/s);
});

test('unconfigured and oversized new listings cannot create direct checkout sessions', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const { id } of audit.additions) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity: 1 }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /eBay listing only/);
    }
  } finally {
    keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
  }
});

for (const report of [trubarDrizzleReport, matzoHanukkahReport]) {
  test(`${report.slug} is dated October 28 and discoverable with real, credited imagery`, async () => {
    assert.equal(reports.filter((row) => row.slug === report.slug).length, 1);
    const href = `journal/${report.slug}.html`;
    const html = await read(`dist/${href}`);
    assert.match(html, /"datePublished":"2026-10-28"/);
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    for (const file of ['index.html', 'blog.html', 'sitemap-journal.xml']) assert.ok((await read(`dist/${file}`)).includes(href));
    assert.ok(JSON.parse(await read('dist/assets/journal-index.json')).some((row) => row.slug === report.slug));
    for (const related of report.relatedSlugs) assert.ok(reports.some((row) => row.slug === related), related);
    for (const [, target] of html.matchAll(/href="([^"#]+\.html)(?:#[^"]*)?"/g)) {
      if (!target.startsWith('https://')) await access(resolve(root, 'dist', target));
    }
    const image = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart/);
    assert.match(report.disclosure, /not taste-tested/);
  });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { catalog, categories, findCatalogItem, directPriceCents, maxQuantity } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { ritzGlutenFreeReport as ritz } from '../scripts/ritz-gluten-free-report.mjs';
import { dupeLoopsReport as loops } from '../scripts/dupe-loops-report.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const id = '407260159541';
const slug = `pokemon-journey-together-booster-bundle-${id}.html`;

test('Journey Together is archived with honest verification provenance and no active purchase surfaces', async () => {
  assert.equal(findCatalogItem(id), undefined);
  assert.equal(catalog.length, 76);
  assert.equal(categories.collectibles.count, 8);
  assert.equal(maxQuantity(findCatalogItem('407283282883')), 1);
  assert.equal(directPriceCents(findCatalogItem('407283282883')), 6851);
  assert.equal(maxQuantity(findCatalogItem('407134944288')), 2);
  const item = soldItems.find((row) => row.id === id);
  assert.equal(item.soldOut, true);
  assert.equal(item.priceLabel, 'Last listed price');
  const record = JSON.parse(await read('data/store-sales-update-2026-10-27.json'));
  assert.equal(record.soldOut[0].remainingQuantity, 0);
  assert.equal(record.ebayVerification.status, 'blocked');
  assert.equal(record.soldOut[0].soldQuantity, undefined, 'Do not infer the latest transaction size');
  for (const prefix of ['', 'dist/']) {
    for (const file of ['assets/catalog.js', 'google-merchant-feed.xml', 'sitemap-products.xml', 'index.html', 'out-now.html']) {
      assert.ok(!(await read(prefix + file)).includes(id), prefix + file);
    }
    assert.ok(!(await readdir(resolve(root, prefix, 'products'))).includes(slug));
    const html = await read(`${prefix}sold/${slug}`);
    assert.match(html, /https:\/\/schema.org\/OutOfStock/);
    assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay|View current eBay listing/);
    for (const path of [slug, slug.replace(/\.html$/, '')]) {
      assert.ok((await read(`${prefix}_redirects`)).includes(`/products/${path}  /sold/${slug}  301`));
    }
    for (const variant of ['', 'branded/']) {
      assert.ok((await readFile(resolve(root, `${prefix}assets/images/sold/${variant}${id}.webp`))).length > 1000);
    }
  }
});

test('stale Journey Together carts are rejected without network or Stripe calls', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const quantity of [1, 2]) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /no longer available/i);
    }
  } finally {
    keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
  }
});

for (const report of [ritz, loops]) {
  test(`${report.slug} is published with today's date, real images and working discovery links`, async () => {
    assert.equal(reports.filter((row) => row.slug === report.slug).length, 1);
    const href = `journal/${report.slug}.html`;
    const html = await read(`dist/${href}`);
    assert.match(html, /"datePublished":"2026-10-27"/);
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.ok((await read('dist/blog.html')).includes(href));
    assert.ok((await read('dist/sitemap-journal.xml')).includes(href));
    assert.ok(JSON.parse(await read('dist/assets/journal-index.json')).some((row) => row.slug === report.slug));
    for (const related of report.relatedSlugs) assert.ok(reports.some((row) => row.slug === related), related);
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

test('news distinguishes planned distribution, local stock and independent reporting', () => {
  assert.match(ritz.answer, /February 2027/);
  assert.match(loops.answer, /select Costco regions/);
  assert.match(loops.caption, /not the new organic Costco package/);
  for (const report of [ritz, loops]) {
    assert.match(report.disclosure, /not taste-tested/);
    assert.equal(report.shop, undefined);
  }
});

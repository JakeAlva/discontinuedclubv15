import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { findCatalogItem } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { pokemonDeltaReignReport as report } from '../scripts/pokemon-delta-reign-report.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const sold = [
  ['407212006333', 'pokemon-tcg-mega-evolution-booster-pack'],
  ['407203141723', 'red-bull-amber-edition-sugar-free-4-pack']
];

test('confirmed sold-out listings leave active inventory, feeds and product recommendations', async () => {
  const activeFiles = ['assets/catalog.js', 'dist/assets/catalog.js', 'google-merchant-feed.xml', 'sitemap-products.xml', 'dist/out-now.html', 'dist/index.html'];
  for (const file of await readdir(resolve(root, 'dist/products'))) activeFiles.push(`dist/products/${file}`);
  for (const [id] of sold) {
    assert.equal(findCatalogItem(id), undefined);
    for (const file of activeFiles) assert.ok(!(await read(file)).includes(id), `${id}: ${file}`);
  }
  assert.equal(findCatalogItem('407269224750').maxQuantity, 4, 'Chaos Rising remains available');
  assert.equal(findCatalogItem('407269188492').maxQuantity, 2, 'Surging Sparks remains available');
  assert.equal(findCatalogItem('407281698826').maxQuantity, 2, 'Destined Rivals bundles remain available');
});

test('sold-out pages preserve images, OutOfStock schema and both old URL redirects', async () => {
  for (const [id, name] of sold) {
    const slug = `${name}-${id}`;
    assert.equal(soldItems.find((item) => item.id === id).soldOut, true);
    const html = await read(`dist/sold/${slug}.html`);
    assert.match(html, /class="sold-status">Sold out/);
    assert.match(html, /https:\/\/schema.org\/OutOfStock/);
    assert.doesNotMatch(html, /data-add-to-cart|Buy on eBay|View current eBay listing/);
    assert.ok((await read('sitemap-sold.xml')).includes(`/sold/${slug}.html`));
    for (const suffix of ['', '.html']) assert.ok((await read('_redirects')).includes(`/products/${slug}${suffix}  /sold/${slug}.html  301`));
    for (const folder of ['sold', 'sold/branded']) assert.ok((await readFile(resolve(root, `assets/images/${folder}/${id}.webp`))).length > 1000);
  }
  const amber = await read('dist/journal/is-red-bull-sugarfree-strawberry-apricot-discontinued.html');
  assert.match(amber, /last Sugarfree Amber Edition four-pack sold on October 20/);
  assert.doesNotMatch(amber, /currently lists a four-pack|article-shop-callout/);
});

test('old carts cannot start Stripe checkout for either sold listing', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    for (const [id] of sold) {
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity: 1 }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /no longer available/i);
    }
  } finally {
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});

test('October 22 Pokemon article is discoverable, sourced and uses the official local image', async () => {
  const href = `journal/${report.slug}.html`;
  const html = await read(`dist/${href}`);
  assert.ok(reports.includes(report));
  assert.ok((await read('dist/blog.html')).includes(`href="${href}"`));
  assert.ok((await read('dist/sitemap-journal.xml')).includes(href));
  assert.ok(JSON.parse(await read('dist/assets/journal-index.json')).some((item) => item.slug === report.slug));
  assert.match(html, /"datePublished":"2026-10-22"/);
  assert.match(html, /Published October 22, 2026/);
  assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
  assert.doesNotMatch(html, /For older full cans|article-shop-callout|data-add-to-cart/);
  for (const source of report.sources) assert.ok(html.includes(source.url));
  for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
  for (const [, target] of html.matchAll(/href="([^"#]+\.html)(?:#[^"]*)?"/g)) {
    if (!target.startsWith('https://')) await access(resolve(root, 'dist', target));
  }
  const image = await sharp(resolve(root, report.image)).metadata();
  assert.equal(image.width, report.imageWidth);
  assert.equal(image.height, report.imageHeight);
  assert.match(report.answer, /October 24, 2026/);
  assert.match(report.answer, /November 6/);
  assert.match(report.caption, /one promo, not all four/);
  assert.match(report.statusParagraphs.join(' '), /No discontinuation/);
});

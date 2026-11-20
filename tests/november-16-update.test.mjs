import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import sharp from 'sharp';
import { catalog, findCatalogItem, directPriceCents, maxQuantity, priceLookupKey, shippingQuote } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';
import { november16Update as update } from './helpers/current-inventory.mjs';
import { gameFuelCitrusCherryHistoryReport } from '../scripts/game-fuel-citrus-cherry-history-report.mjs';
import { cocaColaOrangeCreamMiniReport } from '../scripts/coca-cola-orange-cream-mini-report.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('five November 16 additions have discounted direct checkout and actual listing photos', async () => {
  const pages = await readdir(new URL('../dist/products/', import.meta.url));
  const feed = await read('dist/google-merchant-feed.xml');
  for (const [id, cents, stock] of update.additions) {
    const item = findCatalogItem(id);
    assert.notEqual(item.directCheckoutEnabled, false);
    assert.equal(maxQuantity(item), stock);
    assert.equal(directPriceCents(item), Math.round(cents * 0.965));
    assert.equal(priceLookupKey(item), `dc_${id}_direct`);
    assert.ok(item.shippingWeightOz > 0);
    const page = pages.find((name) => name.endsWith(`-${id}.html`));
    assert.ok(page, id);
    const html = await read(`dist/products/${page}`);
    assert.ok(html.includes(`data-add-to-cart="${id}"`));
    assert.ok(html.includes(`data-stock-id="${id}"`));
    assert.ok(feed.includes(`dc-${id}`));
    for (const variant of ['branded', 'merchant']) {
      const meta = await sharp(new URL(`../assets/images/listings/${variant}/${id}.webp`, import.meta.url).pathname).metadata();
      assert.equal(meta.width, 1200);
      assert.equal(meta.height, 1200);
    }
  }
  assert.deepEqual(catalog.filter((item) => item.directCheckoutEnabled === false).map((item) => item.id), update.ebayOnlyIds);
});

test('Roblox website orders are mailed physical coin pairs, not instant code delivery', async () => {
  const item = findCatalogItem('407365194694');
  assert.match(item.name, /Physical Coin Pair/);
  assert.match(item.purchaseNote, /two physical coins per quantity/i);
  assert.match(item.purchaseNote, /Codes are not emailed or delivered instantly/);
  assert.match(item.purchaseNote, /code-only delivery.*eBay/i);
  assert.equal(directPriceCents(item), 96);
  assert.ok(shippingQuote(96, [{ item, quantity: 1 }]).amountCents > 0);
  const html = await read('dist/products/roblox-100-robux-physical-coin-pair-407365194694.html');
  assert.match(html, /Website orders ship as two physical coins/);
  assert.match(html, /https:\/\/www.ebay.com\/itm\/407365194694/);
});

test('sold Baja twelve-packs stay archived and reject stale checkout carts', async () => {
  const old = [process.env.STRIPE_CHECKOUT_ENABLED, process.env.STRIPE_SECRET_KEY];
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    const pages = await readdir(new URL('../dist/sold/', import.meta.url));
    for (const id of update.removedIds) {
      assert.equal(findCatalogItem(id), undefined);
      assert.equal(soldItems.find((item) => item.id === id).soldOut, true);
      for (const path of ['dist/out-now.html', 'dist/google-merchant-feed.xml', 'dist/sitemap-products.xml']) {
        assert.ok(!(await read(path)).includes(id), path);
      }
      const archive = pages.find((name) => name.endsWith(`-${id}.html`));
      const html = await read(`dist/sold/${archive}`);
      assert.match(html, /https:\/\/schema.org\/OutOfStock/);
      assert.doesNotMatch(html, /data-add-to-cart/);
      const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
        body: JSON.stringify({ items: [{ id, quantity: 1 }] })
      }));
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /no longer available/);
    }
  } finally {
    ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'].forEach((key, index) => {
      if (old[index] === undefined) delete process.env[key]; else process.env[key] = old[index];
    });
  }
});

test('two November 16 long-form reports have sources, correct dates and crawlable discovery', async () => {
  const journalPages = (await readdir(new URL('../dist/', import.meta.url))).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  const journalHtml = (await Promise.all(journalPages.map((file) => read(`dist/${file}`)))).join('\n');
  for (const report of [gameFuelCitrusCherryHistoryReport, cocaColaOrangeCreamMiniReport]) {
    assert.equal(report.editionDate, '2026-11-16');
    assert.ok(report.sections.length >= 7);
    assert.ok(report.sections.flatMap((section) => section.paragraphs).join(' ').split(/\s+/).length >= 1000);
    assert.ok(report.sources.length >= 3);
    const html = await read(`dist/journal/${report.slug}.html`);
    assert.match(html, /index, follow/);
    assert.ok(html.includes(report.title));
    for (const source of report.sources) assert.ok(html.includes(source.url.replaceAll('&', '&amp;')) || html.includes(source.url));
    assert.ok(journalHtml.includes(report.slug), 'Article remains discoverable through journal pagination');
    assert.ok((await read('dist/sitemap-journal.xml')).includes(report.slug));
  }
});

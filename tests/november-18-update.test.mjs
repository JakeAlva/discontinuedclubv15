import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { findCatalogItem, directPriceCents, priceLookupKey } from '../lib/store-catalog.mjs';
import { readInventory } from '../netlify/functions/inventory.mjs';
import { pepsiPeepsHistoryReport } from '../scripts/pepsi-peeps-history-report.mjs';
import { mountainDewFlaminHotHistoryReport } from '../scripts/mountain-dew-flamin-hot-history-report.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Arctic Berry relisting retains discounted direct checkout and redirects both old IDs', async () => {
  const item = findCatalogItem('407373107823');
  assert.equal(directPriceCents(item), 2122);
  assert.equal(priceLookupKey(item), 'dc_407373107823_direct');
  assert.equal(item.shippingWeightOz, 16);
  const target = '/products/red-bull-festive-edition-arctic-berry-8-4-oz-single-can-407373107823.html';
  const redirects = await read('_redirects');
  for (const id of ['407297979026', '407345586271']) {
    assert.equal(findCatalogItem(id), undefined);
    for (const suffix of ['', '.html']) {
      assert.ok(redirects.includes(`/products/red-bull-festive-edition-arctic-berry-8-4-oz-single-can-${id}${suffix}  ${target}  301`));
    }
    assert.ok(!(await read('dist/sitemap-products.xml')).includes(id));
  }
  const html = await read(`dist${target}`);
  assert.match(html, /data-add-to-cart="407373107823"/);
  assert.match(html, /https:\/\/www.ebay.com\/itm\/407373107823/);
});

test('live inventory preserves Alani website-sale deductions after the catalog refresh', async () => {
  const quantities = { '407329572793': 3, '407332173468': 2, '407343435479': 4, '407373107823': 1 };
  const items = Object.keys(quantities).map(findCatalogItem);
  const stripe = { prices: { list: async () => ({ has_more: false, data: items.map((item) => ({
    lookup_key: priceLookupKey(item), currency: 'usd', unit_amount: directPriceCents(item),
    product: { active: true, metadata: { dc_stock: String(quantities[item.id]) } }
  })) }) } };
  assert.deepEqual(await readInventory(stripe, items), items.map((item) => ({ id: item.id, quantity: quantities[item.id] })));
});

test('two substantial November 18 histories publish with sources, images and discovery links', async () => {
  for (const report of [pepsiPeepsHistoryReport, mountainDewFlaminHotHistoryReport]) {
    assert.equal(report.editionDate, '2026-11-18');
    assert.equal(report.checkedDate, '2026-11-18');
    assert.equal(report.sections.length, 7);
    assert.ok(report.sections.flatMap((section) => section.paragraphs).join(' ').split(/\s+/).length >= 1000);
    assert.equal(report.sources.length, 3);
    assert.ok((await readFile(new URL(`../${report.image}`, import.meta.url))).length > 1000);
    const html = await read(`dist/journal/${report.slug}.html`);
    assert.match(html, /index, follow/);
    assert.ok(html.includes(report.title));
    assert.ok(html.includes('2026-11-18'));
    for (const source of report.sources) assert.ok(html.includes(source.url));
    const pages = (await readdir(new URL('../dist/', import.meta.url))).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
    assert.ok((await Promise.all(pages.map((file) => read('dist/' + file)))).join('\n').includes(report.slug));
    for (const file of ['dist/sitemap-journal.xml', 'dist/assets/journal-index.json']) {
      assert.ok((await read(file)).includes(report.slug), file);
    }
  }
});

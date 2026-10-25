import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { catalog, categories, directPriceCents, maxQuantity } from '../lib/store-catalog.mjs';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const audit = JSON.parse(await read('data/ebay-inventory-audit-2026-10-12.json'));
const latest = JSON.parse(await read('data/ebay-inventory-update-2026-10-19.json'));
const sales = JSON.parse(await read('data/ebay-sales-update-2026-10-22.json'));
const latestSales = JSON.parse(await read('data/store-sales-update-2026-10-25.json'));
const soldIds = new Set([...sales.soldOut, ...latestSales.soldOut].map((item) => item.id));
const active = latest.activeSnapshot.filter(([id]) => !soldIds.has(id)).map(([id, priceCents, quantity]) => [id, quantity, `$${(priceCents / 100).toFixed(2)}`]);

test('active listings match the October 19 audit less confirmed sell-outs through October 25', () => {
  const expected = new Map(active.map(([id, quantity, price]) => [id, { quantity, price }]));
  assert.equal(expected.size, active.length, 'Audit must not contain duplicate listing IDs');
  assert.deepEqual(catalog.map((item) => item.id).sort(), [...expected.keys()].sort());
  for (const item of catalog) {
    assert.equal(maxQuantity(item), expected.get(item.id).quantity, `${item.id} ${item.name}: available listing units`);
    assert.equal(item.price, expected.get(item.id).price, `${item.id} ${item.name}: eBay price`);
  }
  assert.equal(categories.all.count, expected.size);
  for (const [category, { count }] of Object.entries(categories)) {
    if (category !== 'all') assert.equal(count, catalog.filter((item) => item.category === category).length, category);
  }
});

test('published catalog, purchase limits and feed use the audited inventory', async () => {
  const feed = new XMLParser({ parseTagValue: false }).parse(await read('google-merchant-feed.xml')).rss.channel.item;
  assert.deepEqual(feed.map((item) => item['g:id']).sort(), active.map(([id]) => `dc-${id}`).sort());
  const publicCatalog = await read('dist/assets/catalog.js');
  assert.equal(publicCatalog, await read('assets/catalog.js'));
  for (const item of catalog) {
    const slug = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;
    const html = await read(`dist/products/${slug}.html`);
    const quantity = maxQuantity(item);
    if (quantity > 1) assert.ok(html.includes(`data-max="${quantity}"`), `${item.id}: product quantity control`);
    else assert.match(html, /class="product-quantity-single"/);
    const record = feed.find((row) => row['g:id'] === `dc-${item.id}`);
    assert.equal(record['g:availability'], 'in_stock');
    assert.equal(record['g:price'], `${(directPriceCents(item) / 100).toFixed(2)} USD`);
  }
  for (const id of [...audit.endedListingIds, ...latest.soldOut.map((item) => item.id), ...soldIds]) {
    assert.ok(!publicCatalog.includes(id), `${id} must not be purchasable`);
    assert.ok(!(await read('dist/out-now.html')).includes(id), `${id} must not appear in static shop listings`);
  }
  for (const file of ['dist/index.html', 'dist/out-now.html']) {
    assert.ok((await read(file)).includes(`data-listing-count="all">${active.length}</span>`), file);
  }
});

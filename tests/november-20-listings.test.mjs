import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { findCatalogItem, directPriceCents, maxQuantity, priceLookupKey } from '../lib/store-catalog.mjs';
import { november20Update } from './helpers/current-inventory.mjs';

const read = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('November 20 additions preserve the advertised price, quantity and direct discount', async () => {
  const feed = new XMLParser({ parseTagValue: false }).parse(await read('google-merchant-feed.xml')).rss.channel.item;
  assert.deepEqual(november20Update.additions, [['407376262737', 699, 1], ['407376259572', 699, 1]]);
  for (const [id] of november20Update.additions) {
    const item = findCatalogItem(id);
    assert.equal(item.price, '$6.99');
    assert.equal(directPriceCents(item), 675);
    assert.equal(maxQuantity(item), 1);
    assert.equal(item.shippingWeightOz, 32);
    assert.equal(item.taxCode, 'txcd_41040002');
    assert.equal(priceLookupKey(item), `dc_${id}_direct`);
    const entry = feed.find((row) => row['g:id'] === `dc-${id}`);
    assert.equal(entry['g:price'], '6.75 USD');
    const path = new URL(entry['g:link']).pathname.slice(1);
    const html = await read(path);
    assert.ok(html.includes(`data-add-to-cart="${id}"`));
    assert.ok(html.includes('class="product-quantity-single"'));
    assert.ok(html.includes('uniform-drinks-20261120'));
    assert.ok((await read('sitemap-products.xml')).includes(entry['g:link']));
  }
  assert.equal(findCatalogItem('bloom-pear-scare').preorder.shipDate, '2026-11-30');
  assert.equal(directPriceCents(findCatalogItem('bloom-pear-scare')), 799);
  assert.equal(findCatalogItem('407321244836').directCheckoutEnabled, false);
});

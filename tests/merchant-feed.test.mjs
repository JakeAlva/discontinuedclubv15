import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, directPriceCents, shippingQuote } from '../lib/store-catalog.mjs';
import { productBrand, productCondition } from '../lib/product-metadata.mjs';

const root = resolve(import.meta.dirname, '..');
const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;

test('Merchant Center feed exposes every active product with current direct pricing', async () => {
  const feed = await readFile(resolve(root, 'google-merchant-feed.xml'), 'utf8');
  assert.match(feed, /<rss xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0" version="2\.0">/);
  assert.equal((feed.match(/<item>/g) || []).length, catalog.length);

  for (const item of catalog) {
    const directPrice = `${(directPriceCents(item) / 100).toFixed(2)} USD`;
    const shippingPrice = `${(shippingQuote(directPriceCents(item), [{ item, quantity: 1 }]).amountCents / 100).toFixed(2)} USD`;
    assert.ok(feed.includes(`<g:id>dc-${item.id}</g:id>`));
    assert.ok(feed.includes(`https://discontinuedclub.com/products/${slug(item)}.html`));
    assert.ok(feed.includes(`https://discontinuedclub.com/assets/images/listings/merchant/${item.id}.webp`));
    assert.ok(feed.includes(`<g:price>${directPrice}</g:price>`));
    assert.ok(feed.includes(`<g:condition>${productCondition(item)}</g:condition>`));
    assert.ok(feed.includes(`<g:brand>${productBrand(item)}</g:brand>`));
    assert.ok(feed.includes(`<g:price>${shippingPrice}</g:price>`));
  }
});

test('Merchant feed uses stable unique IDs and omits invented product identifiers', async () => {
  const feed = await readFile(resolve(root, 'google-merchant-feed.xml'), 'utf8');
  const ids = [...feed.matchAll(/<g:id>([^<]+)<\/g:id>/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, catalog.length);
  assert.doesNotMatch(feed, /<g:(?:gtin|mpn|identifier_exists)>/);
});

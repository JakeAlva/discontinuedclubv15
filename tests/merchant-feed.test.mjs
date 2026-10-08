import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { catalog, directPriceCents, shippingQuote } from '../lib/store-catalog.mjs';
import { productBrand, productCondition } from '../lib/product-metadata.mjs';

const root = resolve(import.meta.dirname, '..');
const directCatalog = catalog.filter((item) => item.directCheckoutEnabled !== false);
const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;

test('Merchant Center feed exposes direct-checkout products and excludes eBay-only listings', async () => {
  const feed = await readFile(resolve(root, 'google-merchant-feed.xml'), 'utf8');
  assert.equal(XMLValidator.validate(feed), true);
  const entries = new XMLParser({ parseTagValue: false }).parse(feed).rss.channel.item;
  const entriesById = new Map(entries.map((entry) => [entry['g:id'], entry]));
  assert.match(feed, /<rss xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0" version="2\.0">/);
  assert.equal(entries.length, directCatalog.length);

  for (const item of catalog) {
    if (item.directCheckoutEnabled === false) {
      assert.ok(!entriesById.has(`dc-${item.id}`));
      continue;
    }
    const directPrice = `${(directPriceCents(item) / 100).toFixed(2)} USD`;
    const shippingPrice = `${(shippingQuote(directPriceCents(item), [{ item, quantity: 1 }]).amountCents / 100).toFixed(2)} USD`;
    const entry = entriesById.get(`dc-${item.id}`);
    assert.ok(entry, item.id);
    assert.equal(entry['g:link'], `https://discontinuedclub.com/products/${slug(item)}.html`);
    assert.equal(entry['g:image_link'], `https://discontinuedclub.com/assets/images/listings/merchant/${item.id}.webp`);
    assert.equal(entry['g:price'], directPrice);
    assert.equal(entry['g:condition'], productCondition(item));
    assert.equal(entry['g:brand'], productBrand(item));
    assert.equal(entry['g:shipping']['g:price'], shippingPrice);
  }
});

test('Merchant feed uses stable unique IDs and omits invented product identifiers', async () => {
  const feed = await readFile(resolve(root, 'google-merchant-feed.xml'), 'utf8');
  const ids = [...feed.matchAll(/<g:id>([^<]+)<\/g:id>/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, directCatalog.length);
  assert.doesNotMatch(feed, /<g:(?:gtin|identifier_exists)>/);
  const entries = new XMLParser({ parseTagValue: false }).parse(feed).rss.channel.item;
  for (const entry of entries) {
    const item = directCatalog.find((candidate) => `dc-${candidate.id}` === entry['g:id']);
    assert.equal(entry['g:mpn'], item.mpn);
  }
});

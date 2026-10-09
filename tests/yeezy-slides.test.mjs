import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { catalog, categories, directPriceCents, maxQuantity } from '../lib/store-catalog.mjs';

for (const [id, color, mpn] of [['407279322970', 'Black', 'ID5106'], ['407279351355', 'Beige', 'FW6348']]) {
  test(`Yeezy slide ${id} preserves one pair, verified sizing, photos and searchable offers`, async () => {
    const item = catalog.find((candidate) => candidate.id === id);
    assert.equal(item.category, 'kids-shoes');
    assert.equal(item.price, '$24.99');
    assert.equal(directPriceCents(item), 2412);
    assert.equal(maxQuantity(item), 1);
    assert.equal(item.size, '24');
    assert.equal(item.sizeSystem, 'EU');
    assert.match(item.sizeLabel, /US 7K/);
    assert.equal(item.color, color);
    assert.equal(item.mpn, mpn);
    assert.equal(item.shippingWeightOz, 12);
    assert.equal(item.taxCode, 'txcd_30011200');
    const slug = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${id}.html`;
    const html = await readFile(new URL(`../products/${slug}`, import.meta.url), 'utf8');
    assert.equal((html.match(/data-product-gallery-src=/g) || []).length, 5);
    assert.match(html, /data-product-zoom/);
    assert.match(html, /Original box not included/);
    assert.match(html, /1 pair currently listed/);
    assert.match(html, /index, follow/);
    assert.doesNotMatch(html, /Last one|eBay authentication/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema.offers.price, '24.12');
    assert.equal(schema.offers.availability, 'https://schema.org/InStock');
    assert.equal(schema.itemCondition, 'https://schema.org/UsedCondition');
    assert.equal(schema.image.length, 5);
    assert.equal(schema.mpn, mpn);
    for (const image of item.gallery) await access(new URL(`../${image.src}`, import.meta.url));
    for (const kind of ['branded', 'merchant']) await access(new URL(`../assets/images/listings/${kind}/${id}.webp`, import.meta.url));
    const sitemap = await readFile(new URL('../sitemap-products.xml', import.meta.url), 'utf8');
    assert.ok(sitemap.includes('/products/' + slug));
    const feed = await readFile(new URL('../google-merchant-feed.xml', import.meta.url), 'utf8');
    const entry = feed.match(new RegExp(`<item>\\s*<g:id>dc-${id}</g:id>[\\s\\S]*?</item>`))[0];
    for (const [field, value] of Object.entries({price: '24.12 USD', availability: 'in_stock', condition: 'used', brand: 'adidas', size: '24', size_system: 'EU', color, mpn})) {
      assert.ok(entry.includes(`<g:${field}>${value}</g:${field}>`));
    }
    assert.ok(!entry.includes('<g:gtin>'));
  });
}

test('shoe counts include both slides across the homepage and department picker', async () => {
  assert.equal(categories['kids-shoes'].count, 10);
  assert.equal(categories.all.count, catalog.length);
  const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(home, /data-listing-count="kids-shoes">10</);
});

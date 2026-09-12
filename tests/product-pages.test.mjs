import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, storeConfig } from '../lib/store-catalog.mjs';
import { productBrand, productCondition } from '../lib/product-metadata.mjs';

const root = resolve(import.meta.dirname, '..');
const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;

test('every current listing has a dedicated indexable product page', async () => {
  const files = (await readdir(resolve(root, 'products'))).filter((file) => file.endsWith('.html'));
  assert.equal(files.length, catalog.length);

  for (const item of catalog) {
    const filename = slug(item);
    assert.ok(files.includes(filename), `Missing ${filename}`);
    const html = await readFile(resolve(root, 'products', filename), 'utf8');
    assert.match(html, new RegExp(`<link rel="canonical" href="https://discontinuedclub\\.com/products/${filename}">`));
    assert.ok(html.includes(`/assets/images/listings/merchant/${item.id}.webp`));
    assert.ok(html.includes(`https://www.ebay.com/itm/${item.id}`));
    assert.ok(html.includes(`"brand":{"@type":"Brand","name":"${productBrand(item)}"}`));
    assert.ok(html.includes(`https://schema.org/${productCondition(item) === 'used' ? 'UsedCondition' : 'NewCondition'}`));
    assert.ok(html.includes('"@type":"OfferShippingDetails"'));
    assert.ok(html.includes('"@type":"MerchantReturnPolicy"'));
    assert.ok(html.includes('class="product-page"'));
    assert.equal((html.match(/class="product-related-card"/g) || []).length, Math.min(4, catalog.length - 1));
    if (storeConfig.directCheckoutEnabled) {
      assert.ok(html.includes(`data-add-to-cart="${item.id}"`));
      assert.ok(html.includes('class="mobile-product-bar"'));
      assert.ok(html.includes('data-add-label>Add to cart'));
      if ((item.maxQuantity || storeConfig.defaultMaxQuantity || 1) > 1) assert.ok(html.includes(`data-product-id="${item.id}"`));
    }
    else assert.ok(!html.includes('data-add-to-cart='));
  }
});

test('jersey product pages lead with the mockup and include distinct real photos', async () => {
  const item = catalog.find((candidate) => candidate.id === '407064120905');
  const html = await readFile(resolve(root, 'products', slug(item)), 'utf8');
  const firstMainImage = html.match(/<div class="current-gallery-main"><img src="([^"]+)/)?.[1];

  assert.equal(firstMainImage, `assets/images/listings/branded/${item.id}.webp?v=38`);
  assert.ok(html.includes(`data-product-gallery-src="assets/images/listings/merchant/${item.id}.webp?v=38"`));
  assert.ok(html.includes(`data-product-gallery-src="assets/images/listings/backs/${item.id}.webp"`));
});

test('public return policy matches the Merchant Center return settings', async () => {
  const html = await readFile(resolve(root, 'shipping-returns.html'), 'utf8');

  assert.match(html, /within 30 days of delivery/i);
  assert.match(html, /by mail only/i);
  assert.match(html, /buyer is responsible for return shipping/i);
  assert.match(html, /No restocking fee/i);
  assert.match(html, /Exchanges are not offered/i);
  assert.match(html, /within 10 calendar days/i);
  assert.match(html, /online-only retailer/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { catalog, categories, directPriceCents, maxQuantity } from '../lib/store-catalog.mjs';
import { productBrand, productCondition } from '../lib/product-metadata.mjs';
import { siteItemFromListing, inferCategory, inferTaxCode, inferShippingWeightOz } from '../lib/catalog-sync.mjs';
import { serializeCatalogModule } from '../lib/catalog-file.mjs';
import { runInNewContext } from 'node:vm';

const item = catalog.find((item) => item.id === '407274649287');
const productPath = 'products/balenciaga-triple-s-kids-sneakers-eu-26-us-9-5-407274649287.html';

for (const expected of [
  { id: '407277346224', price: '$74.99', directCents: 7237, brand: 'adidas', size: '28', photos: 6, mpn: 'EF2905' },
  { id: '407277320481', price: '$69.99', directCents: 6754, brand: 'adidas', size: '27', photos: 6, mpn: 'FX9033', imageVersion: '20261008-2' },
  { id: '407277242488', price: '$74.99', directCents: 7237, brand: 'adidas', size: '28', photos: 6, mpn: 'EG7492' },
  { id: '407277210158', price: '$64.99', directCents: 6272, brand: 'Burberry', size: '25', photos: 5 }
]) {
  test(`${expected.brand} addition preserves verified size, price, quantity and real photos`, async () => {
    const shoe = catalog.find((candidate) => candidate.id === expected.id);
    assert.equal(shoe.category, 'kids-shoes');
    assert.equal(shoe.price, expected.price);
    assert.equal(directPriceCents(shoe), expected.directCents);
    assert.equal(maxQuantity(shoe), 1);
    assert.equal(shoe.brand, expected.brand);
    assert.equal(shoe.size, expected.size);
    assert.equal(shoe.sizeSystem, 'EU');
    assert.equal(shoe.mpn, expected.mpn);
    assert.equal(shoe.shippingWeightOz, 64);
    assert.equal(shoe.taxCode, 'txcd_30011200');
    const slug = `${shoe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${shoe.id}`;
    const path = `products/${slug}.html`;
    const html = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.equal((html.match(/data-product-gallery-src=/g) || []).length, expected.photos);
    assert.match(html, /Original box not included/);
    assert.doesNotMatch(html, /Last one/);
    assert.match(html, /index, follow/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema.brand.name, expected.brand);
    assert.equal(schema.mpn, expected.mpn);
    assert.equal(schema.size.name, expected.size);
    assert.equal(schema.itemCondition, 'https://schema.org/UsedCondition');
    assert.equal(schema.offers.price, (expected.directCents / 100).toFixed(2));
    assert.equal(schema.offers.availability, 'https://schema.org/InStock');
    assert.equal(schema.image.length, expected.photos);
    for (const image of shoe.gallery) await access(new URL(`../${image.src}`, import.meta.url));
    for (const variant of ['branded', 'merchant']) await access(new URL(`../assets/images/listings/${variant}/${shoe.id}.webp`, import.meta.url));
    const sitemap = await readFile(new URL('../sitemap-products.xml', import.meta.url), 'utf8');
    assert.ok(sitemap.includes(path));
    const feed = await readFile(new URL('../google-merchant-feed.xml', import.meta.url), 'utf8');
    const entry = feed.match(new RegExp(`<item>\\s*<g:id>dc-${shoe.id}</g:id>[\\s\\S]*?</item>`))[0];
    for (const [field, value] of Object.entries({ brand: expected.brand, size: expected.size, size_system: 'EU', price: `${(expected.directCents / 100).toFixed(2)} USD`, condition: 'used', availability: 'in_stock' })) {
      assert.ok(entry.includes(`<g:${field}>${value}</g:${field}>`));
    }
    assert.ok(!entry.includes('<g:gtin>'));
    if (expected.imageVersion) {
      assert.equal(shoe.imageVersion, expected.imageVersion);
      for (const image of schema.image) assert.equal(new URL(image).searchParams.get('v'), expected.imageVersion);
      const feedImage = entry.match(/<g:image_link>(.*?)<\/g:image_link>/)[1];
      assert.equal(new URL(feedImage).searchParams.get('v'), expected.imageVersion);
    }
  });
}

test('Nike Off-White listing uses the photographed size and style code, with one pair available', async () => {
  const nike = catalog.find((candidate) => candidate.id === '407277156219');
  assert.equal(nike.category, 'kids-shoes');
  assert.equal(nike.price, '$79.99');
  assert.equal(directPriceCents(nike), 7719);
  assert.equal(maxQuantity(nike), 1);
  assert.equal(nike.taxCode, 'txcd_30011200');
  assert.equal(nike.shippingWeightOz, 64);
  assert.equal(nike.size, '9C');
  assert.equal(nike.mpn, 'CW7444-100');
  const path = 'products/nike-x-off-white-rubber-dunk-kids-sneakers-us-9c-eu-26-407277156219.html';
  const html = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  assert.equal((html.match(/data-product-gallery-src=/g) || []).length, 6);
  assert.match(html, /index, follow/);
  assert.match(html, /category=kids-shoes/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.brand.name, 'Nike');
  assert.equal(schema.mpn, 'CW7444-100');
  assert.equal(schema.itemCondition, 'https://schema.org/UsedCondition');
  assert.equal(schema.offers.price, '77.19');
  assert.equal(schema.offers.availability, 'https://schema.org/InStock');
  assert.equal(schema.size.name, '9C');
  assert.equal(schema.image.length, 6);
  for (const image of nike.gallery) await access(new URL(`../${image.src}`, import.meta.url));
  const sitemap = await readFile(new URL('../sitemap-products.xml', import.meta.url), 'utf8');
  assert.ok(sitemap.includes(path));
  const feed = await readFile(new URL('../google-merchant-feed.xml', import.meta.url), 'utf8');
  const entry = feed.match(/<item>\s*<g:id>dc-407277156219<\/g:id>[\s\S]*?<\/item>/)[0];
  for (const [field, value] of Object.entries({ size: '9C', size_system: 'US', brand: 'Nike', mpn: 'CW7444-100', condition: 'used', price: '77.19 USD', availability: 'in_stock', google_product_category: '187' })) {
    assert.ok(entry.includes(`<g:${field}>${value}</g:${field}>`));
  }
  assert.ok(!entry.includes('<g:gtin>'));
});

test('new kids sneakers retain verified price, single-pair stock and sizing', () => {
  assert.equal(item.price, '$174.99');
  assert.equal(directPriceCents(item), 16887);
  assert.equal(maxQuantity(item), 1);
  assert.equal(item.size, '26');
  assert.equal(item.sizeSystem, 'EU');
  assert.equal(productBrand(item), 'Balenciaga');
  assert.equal(productCondition(item), 'used');
  assert.equal(item.taxCode, 'txcd_30011200');
  assert.equal(item.shippingWeightOz, 64);
  assert.equal(categories.all.count, catalog.length);
  assert.equal(categories.apparel.count, catalog.filter((item) => item.category === 'apparel').length);
});

test('product page includes six condition photos, disclosure and searchable schema', async () => {
  const html = await readFile(new URL(`../${productPath}`, import.meta.url), 'utf8');
  assert.equal((html.match(/data-product-gallery-src=/g) || []).length, 6);
  assert.match(html, /Original box not included/);
  assert.match(html, /Direct purchases do not include eBay authentication/);
  assert.match(html, /index, follow/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.brand.name, 'Balenciaga');
  assert.equal(schema.itemCondition, 'https://schema.org/UsedCondition');
  assert.equal(schema.offers.price, '168.87');
  assert.equal(schema.size.name, '26');
  assert.equal(schema.image.length, 6);
  assert.equal(item.imageVersion, '20261008-2');
  for (const image of schema.image) assert.equal(new URL(image).searchParams.get('v'), item.imageVersion);
  for (const [, src] of html.matchAll(/data-product-gallery-src="([^"]+)"/g)) {
    assert.equal(new URL(src, 'https://discontinuedclub.com').searchParams.get('v'), item.imageVersion);
  }
  for (const image of item.gallery) await access(new URL(`../${image.src}`, import.meta.url));
  const sitemap = await readFile(new URL('../sitemap-products.xml', import.meta.url), 'utf8');
  assert.ok(sitemap.includes(productPath));
});

test('shopping feed has footwear attributes and condition, without a fabricated GTIN', async () => {
  const xml = await readFile(new URL('../google-merchant-feed.xml', import.meta.url), 'utf8');
  const entry = xml.match(/<item>\s*<g:id>dc-407274649287<\/g:id>[\s\S]*?<\/item>/)[0];
  for (const [field, value] of Object.entries({ size: '26', size_system: 'EU', gender: 'unisex', age_group: 'toddler', color: 'White/Green/Gray', mpn: '654251', condition: 'used', price: '168.87 USD', google_product_category: '187' })) {
    assert.ok(entry.includes(`<g:${field}>${value}</g:${field}>`));
  }
  assert.ok(!entry.includes('<g:gtin>'));
});

test('later inventory sync preserves curated shoe details and gallery', () => {
  const synced = siteItemFromListing({ id: item.id, title: item.name, priceCents: 17499, condition: item.condition }, { existingItem: item, sharedStock: 1 });
  for (const key of ['gallery', 'imageVersion', 'size', 'sizeLabel', 'color', 'brand', 'mpn', 'ageGroup', 'purchaseNote', 'taxCode']) assert.deepEqual(synced[key], item[key]);
  const context = { module: { exports: {} } };
  runInNewContext(serializeCatalogModule([synced], {}), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.module.exports.catalog[0].gallery)), item.gallery);
  assert.equal(context.module.exports.catalog[0].sizeLabel, item.sizeLabel);
  assert.equal(context.module.exports.catalog[0].imageVersion, item.imageVersion);
});

test('designer kids shoes are separate from adult sportswear throughout navigation', async () => {
  const shoes = catalog.filter((candidate) => candidate.category === 'kids-shoes');
  assert.deepEqual(shoes.map((candidate) => candidate.id).sort(), ['407274649287', '407276996786', '407277122050', '407277156219', '407277210158', '407277242488', '407277320481', '407277346224']);
  assert.equal(categories['kids-shoes'].count, 8);
  assert.equal(categories.apparel.count, 13);
  assert.equal(catalog.find((candidate) => candidate.id === '406834655819').category, 'apparel');
  for (const file of ['../out-now.html', '../index.html', '../assets/app.js']) {
    const content = await readFile(new URL(file, import.meta.url), 'utf8');
    assert.match(content, /kids-shoes/);
  }
  const listing = { title: 'Alexander McQueen Unisex Kids Leather Sneakers EU 26', categoryName: "Unisex Kids' Shoes" };
  assert.equal(inferCategory(listing), 'kids-shoes');
  assert.equal(inferShippingWeightOz(listing), 64);
  assert.equal(inferTaxCode({ category: 'kids-shoes' }), 'txcd_30011200');
  assert.equal(inferCategory({ title: 'Etnies Mens Shoes Size 11' }), 'apparel');
});

test('Alexander McQueen listing has verified pricing, stock, six photos and indexable product page', async () => {
  const mcqueen = catalog.find((candidate) => candidate.id === '407276996786');
  assert.equal(mcqueen.price, '$99.99');
  assert.equal(directPriceCents(mcqueen), 9649);
  assert.equal(maxQuantity(mcqueen), 1);
  assert.equal(mcqueen.taxCode, 'txcd_30011200');
  assert.equal(mcqueen.shippingWeightOz, 64);
  const path = 'products/alexander-mcqueen-kids-leather-sneakers-eu-26-us-9-5-407276996786.html';
  const html = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  assert.equal((html.match(/data-product-gallery-src=/g) || []).length, 6);
  assert.match(html, /Original box not included/);
  assert.match(html, /index, follow/);
  assert.match(html, /category=kids-shoes/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.brand.name, 'Alexander McQueen');
  assert.equal(schema.itemCondition, 'https://schema.org/UsedCondition');
  assert.equal(schema.offers.price, '96.49');
  assert.equal(schema.size.name, '26');
  assert.equal(schema.image.length, 6);
  for (const image of mcqueen.gallery) await access(new URL(`../${image.src}`, import.meta.url));
  const sitemap = await readFile(new URL('../sitemap-products.xml', import.meta.url), 'utf8');
  assert.ok(sitemap.includes(path));
  const feed = await readFile(new URL('../google-merchant-feed.xml', import.meta.url), 'utf8');
  assert.match(feed, /<g:id>dc-407276996786<\/g:id>/);
});

test('Versace listing has one pair, original box, six photos and matching searchable offers', async () => {
  const versace = catalog.find((candidate) => candidate.id === '407277122050');
  assert.equal(versace.category, 'kids-shoes');
  assert.equal(versace.price, '$119.99');
  assert.equal(directPriceCents(versace), 11579);
  assert.equal(maxQuantity(versace), 1);
  assert.equal(versace.shippingWeightOz, 64);
  assert.equal(versace.taxCode, 'txcd_30011200');
  const path = 'products/versace-kids-medusa-slip-on-sneakers-eu-26-us-9-5-407277122050.html';
  const html = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  assert.match(html, /Original box included/);
  assert.match(html, /Direct purchases do not include eBay authentication/);
  assert.match(html, /index, follow/);
  assert.equal((html.match(/data-product-gallery-src=/g) || []).length, 6);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.brand.name, 'Versace');
  assert.equal(schema.size.name, '26');
  assert.equal(schema.itemCondition, 'https://schema.org/UsedCondition');
  assert.equal(schema.offers.price, '115.79');
  assert.equal(schema.offers.availability, 'https://schema.org/InStock');
  assert.equal(schema.image.length, 6);
  for (const image of versace.gallery) await access(new URL(`../${image.src}`, import.meta.url));
  const sitemap = await readFile(new URL('../sitemap-products.xml', import.meta.url), 'utf8');
  assert.ok(sitemap.includes(path));
  const feed = await readFile(new URL('../google-merchant-feed.xml', import.meta.url), 'utf8');
  const entry = feed.match(/<item>\s*<g:id>dc-407277122050<\/g:id>[\s\S]*?<\/item>/)[0];
  assert.match(entry, /<g:price>115\.79 USD<\/g:price>/);
  assert.match(entry, /<g:condition>used<\/g:condition>/);
  assert.match(entry, /<g:size>26<\/g:size>/);
  assert.match(entry, /<g:availability>in_stock<\/g:availability>/);
  assert.ok(!entry.includes('<g:gtin>'));
});

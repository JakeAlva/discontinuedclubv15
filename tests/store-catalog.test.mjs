import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, directPriceCents, maxQuantity, parsePriceCents, priceLookupKey, shipmentWeightOz, shippingQuote } from '../lib/store-catalog.mjs';

test('catalog contains unique, shippable current listings', () => {
  assert.ok(catalog.length > 0);
  assert.equal(new Set(catalog.map((item) => item.id)).size, catalog.length);
  for (const item of catalog) {
    assert.ok(Number.isInteger(item.shippingWeightOz) && item.shippingWeightOz > 0);
    assert.match(item.taxCode, /^txcd_\d{8}$/);
  }
});

test('catalog uses specific Stripe tax categories where they are reliable', () => {
  for (const item of catalog.filter((candidate) => candidate.category === 'drinks' && !/liquid death/i.test(candidate.name))) {
    assert.equal(item.taxCode, 'txcd_41040002');
  }
  for (const item of catalog.filter((candidate) => candidate.category === 'apparel' && /jersey/i.test(candidate.name))) {
    assert.equal(item.taxCode, 'txcd_30070022');
  }
  for (const item of catalog.filter((candidate) => candidate.category === 'care')) {
    assert.equal(item.taxCode, /shampoo/i.test(item.name) ? 'txcd_32050036' : 'txcd_32050006');
  }
});

test('direct prices use the approved 3.5 percent starting discount', () => {
  for (const item of catalog) {
    if (!Number.isInteger(item.directPriceCents)) {
      assert.equal(directPriceCents(item), Math.round(parsePriceCents(item.price) * 0.965));
    }
    assert.ok(directPriceCents(item) > 0);
    assert.ok(directPriceCents(item) <= parsePriceCents(item.price));
  }
});

test('checkout identifiers and inventory limits remain valid after a sync', () => {
  for (const item of catalog) {
    assert.match(priceLookupKey(item), /^dc_\d+_direct$/);
    assert.ok(Number.isInteger(maxQuantity(item)) && maxQuantity(item) > 0);
  }
});

test('Mega Evolution single packs match the verified eBay listing', () => {
  const item = catalog.find((candidate) => candidate.id === '407212006333');
  assert.ok(item);
  assert.equal(item.category, 'collectibles');
  assert.equal(parsePriceCents(item.price), 649);
  assert.equal(directPriceCents(item), 626);
  assert.equal(maxQuantity(item), 3);
  assert.equal(item.shippingWeightOz, 8);
  assert.equal(priceLookupKey(item), 'dc_407212006333_direct');
});

test('catalog omits listings already known to have ended', () => {
  assert.equal(catalog.find((item) => item.id === '407119925622'), undefined);
  assert.equal(catalog.find((item) => item.id === '407134859583'), undefined);
});

test('single-can shipping is $7.49 below $200 and free at the threshold', () => {
  const singleCan = [{ item: { shippingWeightOz: 16 }, quantity: 1 }];
  for (const subtotal of [9999, 10000, 10001, 15000, 19999]) {
    assert.deepEqual(shippingQuote(subtotal, singleCan), { amountCents: 749, thresholdCents: 20000, free: false, weightOz: 16 });
  }
  for (const subtotal of [20000, 20001, 25000]) {
    assert.deepEqual(shippingQuote(subtotal, singleCan), { amountCents: 0, thresholdCents: 20000, free: true, weightOz: 16 });
  }
});

test('shipping increases for heavy drink carts below $200', () => {
  const lines = [
    { item: { shippingWeightOz: 16 }, quantity: 10 },
    { item: { shippingWeightOz: 16 }, quantity: 2 }
  ];
  assert.equal(shipmentWeightOz(lines), 192);
  for (const subtotal of [9644, 10000, 15000, 19999]) {
    assert.deepEqual(shippingQuote(subtotal, lines), { amountCents: 2999, thresholdCents: 20000, free: false, weightOz: 192 });
  }
  assert.deepEqual(shippingQuote(20000, lines), { amountCents: 0, thresholdCents: 20000, free: true, weightOz: 192 });
});

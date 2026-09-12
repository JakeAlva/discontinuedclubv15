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

test('catalog omits listings already known to have ended', () => {
  assert.equal(catalog.find((item) => item.id === '407119925622'), undefined);
  assert.equal(catalog.find((item) => item.id === '407134859583'), undefined);
});

test('shipping is $7.49 below $100 and free at the threshold', () => {
  const singleCan = [{ item: { shippingWeightOz: 16 }, quantity: 1 }];
  assert.deepEqual(shippingQuote(9999, singleCan), { amountCents: 749, thresholdCents: 10000, free: false, weightOz: 16 });
  assert.deepEqual(shippingQuote(10000, singleCan), { amountCents: 0, thresholdCents: 10000, free: true, weightOz: 16 });
  assert.deepEqual(shippingQuote(25000, singleCan), { amountCents: 0, thresholdCents: 10000, free: true, weightOz: 16 });
});

test('shipping increases for heavy drink carts below $100', () => {
  const lines = [
    { item: { shippingWeightOz: 16 }, quantity: 10 },
    { item: { shippingWeightOz: 16 }, quantity: 2 }
  ];
  assert.equal(shipmentWeightOz(lines), 192);
  assert.deepEqual(shippingQuote(9644, lines), { amountCents: 2999, thresholdCents: 10000, free: false, weightOz: 192 });
  assert.deepEqual(shippingQuote(10000, lines), { amountCents: 0, thresholdCents: 10000, free: true, weightOz: 192 });
});

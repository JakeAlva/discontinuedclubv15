import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, directPriceCents, maxQuantity, parsePriceCents, priceLookupKey, shipmentWeightOz, shippingQuote } from '../lib/store-catalog.mjs';

test('catalog contains 48 unique current listings', () => {
  assert.equal(catalog.length, 48);
  assert.equal(new Set(catalog.map((item) => item.id)).size, catalog.length);
  for (const item of catalog) {
    assert.ok(Number.isInteger(item.shippingWeightOz) && item.shippingWeightOz > 0);
    assert.match(item.taxCode, /^txcd_\d{8}$/);
  }
});

test('catalog uses specific Stripe tax categories where they are reliable', () => {
  assert.equal(catalog.find((item) => item.id === '406717975092').taxCode, 'txcd_41040002');
  assert.equal(catalog.find((item) => item.id === '407064120905').taxCode, 'txcd_30070022');
  assert.equal(catalog.find((item) => item.id === '406834655819').taxCode, 'txcd_30011000');
  assert.equal(catalog.find((item) => item.id === '406763511763').taxCode, 'txcd_32050036');
  assert.equal(catalog.find((item) => item.id === '406763784733').taxCode, 'txcd_32050006');
  assert.equal(catalog.find((item) => item.id === '407134859583').taxCode, 'txcd_99999999');
});

test('direct prices use the approved 3.5 percent starting discount', () => {
  for (const item of catalog) {
    assert.equal(directPriceCents(item), Math.round(parsePriceCents(item.price) * 0.965));
    assert.ok(directPriceCents(item) < parsePriceCents(item.price));
  }
});

test('checkout identifiers and inventory limits are stable', () => {
  const expectedQuantities = new Map([
    ['407039382525', 2],
    ['406730413999', 6],
    ['406794860747', 2],
    ['406717975092', 10],
    ['406795510403', 3],
    ['406741032490', 4],
    ['407134859583', 2],
    ['407086892969', 2],
    ['406763784733', 2],
    ['406763511763', 3]
  ]);
  for (const item of catalog) {
    assert.match(priceLookupKey(item), /^dc_\d+_direct$/);
    assert.equal(maxQuantity(item), expectedQuantities.get(item.id) || 1);
  }
});

test('shipping is $7.49 below $100 and free at the threshold', () => {
  const singleCan = [{ item: catalog.find((item) => item.id === '406795510403'), quantity: 1 }];
  assert.deepEqual(shippingQuote(9999, singleCan), { amountCents: 749, thresholdCents: 10000, free: false, weightOz: 16 });
  assert.deepEqual(shippingQuote(10000, singleCan), { amountCents: 0, thresholdCents: 10000, free: true, weightOz: 16 });
  assert.deepEqual(shippingQuote(25000, singleCan), { amountCents: 0, thresholdCents: 10000, free: true, weightOz: 16 });
});

test('shipping increases for heavy drink carts below $100', () => {
  const lines = [
    { item: catalog.find((item) => item.id === '406717975092'), quantity: 10 },
    { item: catalog.find((item) => item.id === '406795510403'), quantity: 2 }
  ];
  assert.equal(shipmentWeightOz(lines), 192);
  assert.deepEqual(shippingQuote(9644, lines), { amountCents: 2999, thresholdCents: 10000, free: false, weightOz: 192 });
  assert.deepEqual(shippingQuote(10000, lines), { amountCents: 0, thresholdCents: 10000, free: true, weightOz: 192 });
});

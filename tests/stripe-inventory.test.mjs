import test from 'node:test';
import assert from 'node:assert/strict';
import { availableStripeQuantity, inventoryAdjustment, stripeStock } from '../lib/stripe-inventory.mjs';

const product = (stock, metadata = {}) => ({
  id: 'prod_test',
  metadata: { dc_stock: String(stock), ...metadata }
});

test('Stripe stock accepts zero and rejects missing or invalid values', () => {
  assert.equal(stripeStock(product(4)), 4);
  assert.equal(stripeStock(product(0)), 0);
  assert.equal(stripeStock({ id: 'prod_test', metadata: {} }), null);
  assert.equal(stripeStock(product(-1)), null);
  assert.equal(stripeStock(product('not-a-number')), null);
  assert.equal(stripeStock('prod_test'), null);
});

test('available quantity never falls back when Stripe says sold out', () => {
  assert.equal(availableStripeQuantity(6, product(4)), 4);
  assert.equal(availableStripeQuantity(2, product(4)), 2);
  assert.equal(availableStripeQuantity(6, product(0)), 0);
  assert.equal(availableStripeQuantity(6, { id: 'prod_test', metadata: {} }), null);
});

test('paid checkout inventory is decremented without going negative', () => {
  assert.deepEqual(inventoryAdjustment(product(5), 2, 'cs_paid'), {
    status: 'update',
    previousStock: 5,
    nextStock: 3
  });
  assert.deepEqual(inventoryAdjustment(product(1), 3, 'cs_paid'), {
    status: 'update',
    previousStock: 1,
    nextStock: 0
  });
});

test('repeated delivery of the same checkout session is idempotent', () => {
  assert.deepEqual(
    inventoryAdjustment(product(3, { dc_last_sale_session: 'cs_paid' }), 2, 'cs_paid'),
    { status: 'already_applied', stock: 3 }
  );
});

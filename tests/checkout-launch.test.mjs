import assert from 'node:assert/strict';
import test from 'node:test';
import createCheckout, { checkoutLineItem } from '../netlify/functions/create-checkout.mjs';
import { storeConfig } from '../lib/store-catalog.mjs';

test('direct checkout is visible but still protected by the server launch flag', async () => {
  assert.equal(storeConfig.directCheckoutEnabled, true);

  const previousValue = process.env.STRIPE_CHECKOUT_ENABLED;
  delete process.env.STRIPE_CHECKOUT_ENABLED;
  try {
    const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ items: [{ id: '406760474283', quantity: 1 }] })
    }));
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /not available yet/i);
  } finally {
    if (previousValue === undefined) delete process.env.STRIPE_CHECKOUT_ENABLED;
    else process.env.STRIPE_CHECKOUT_ENABLED = previousValue;
  }
});

test('single-stock checkout lines omit Stripe adjustable quantity controls', () => {
  assert.deepEqual(checkoutLineItem('price_single', 1, 1), {
    price: 'price_single',
    quantity: 1
  });
  assert.deepEqual(checkoutLineItem('price_multi', 1, 3), {
    price: 'price_multi',
    quantity: 1,
    adjustable_quantity: { enabled: true, minimum: 1, maximum: 3 }
  });
});

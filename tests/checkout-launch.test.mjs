import assert from 'node:assert/strict';
import test from 'node:test';
import createCheckout from '../netlify/functions/create-checkout.mjs';
import { storeConfig } from '../lib/store-catalog.mjs';

test('direct checkout remains disabled until the storefront launch flag changes', async () => {
  assert.equal(storeConfig.directCheckoutEnabled, false);

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

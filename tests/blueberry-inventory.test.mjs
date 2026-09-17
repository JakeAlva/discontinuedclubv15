import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { findCatalogItem, maxQuantity, directPriceCents } from '../lib/store-catalog.mjs';
import createCheckout, { checkoutLineItem } from '../netlify/functions/create-checkout.mjs';

const id = '407203102419';

test('Blueberry remains purchasable as one four-pack after the September 17 sale', async () => {
  const item = findCatalogItem(id);
  assert.ok(item);
  assert.equal(maxQuantity(item), 1);
  assert.equal(directPriceCents(item), 4824);
  const html = await readFile(new URL('../products/red-bull-blue-edition-blueberry-4-pack-407203102419.html', import.meta.url), 'utf8');
  assert.match(html, /One available/);
  assert.match(html, /https:\/\/schema.org\/InStock/);
  assert.doesNotMatch(html, /data-product-quantity-increase|2 available/);
  assert.deepEqual(checkoutLineItem('price_test', 1, maxQuantity(item)), { price: 'price_test', quantity: 1 });
});

test('checkout rejects an outdated cart containing two Blueberry four-packs before calling Stripe', async () => {
  const previous = { enabled: process.env.STRIPE_CHECKOUT_ENABLED, key: process.env.STRIPE_SECRET_KEY };
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
      body: JSON.stringify({ items: [{ id, quantity: 2 }] })
    }));
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /available quantity changed/);
  } finally {
    for (const [key, value] of [['STRIPE_CHECKOUT_ENABLED', previous.enabled], ['STRIPE_SECRET_KEY', previous.key]]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

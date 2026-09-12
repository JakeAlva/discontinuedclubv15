import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const netlify = await readFile(new URL('../netlify.toml', import.meta.url), 'utf8');
const checkout = await readFile(new URL('../netlify/functions/create-checkout.mjs', import.meta.url), 'utf8');
const webhook = await readFile(new URL('../netlify/functions/stripe-webhook.mjs', import.meta.url), 'utf8');

test('production responses carry a restrictive browser security baseline', () => {
  for (const header of ['Content-Security-Policy', 'Strict-Transport-Security', 'Permissions-Policy', 'X-Content-Type-Options', 'X-Frame-Options']) {
    assert.ok(netlify.includes(header), `${header} should be configured`);
  }
  assert.match(netlify, /frame-ancestors 'none'/);
  assert.match(netlify, /object-src 'none'/);
});

test('checkout remains authoritative for price, inventory, and promotion behavior', () => {
  assert.match(checkout, /price\.unit_amount !== directPriceCents\(item\)/);
  assert.match(checkout, /availableStripeQuantity\(maxQuantity\(item\), price\.product\)/);
  assert.match(checkout, /allow_promotion_codes: false/);
  assert.match(checkout, /rateLimit: \{ windowSize: 60, windowLimit: 20/);
});

test('paid-order inventory requires a signed, bounded Stripe webhook', () => {
  assert.match(webhook, /stripe\.webhooks\.constructEvent/);
  assert.match(webhook, /body\.length > 1_000_000/);
  assert.match(webhook, /appendProcessedSession\(product, sessionId\)/);
});

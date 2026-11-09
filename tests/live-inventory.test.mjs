import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import inventoryHandler, { readInventory } from '../netlify/functions/inventory.mjs';
import { directPriceCents, priceLookupKey } from '../lib/store-catalog.mjs';

const item = { id: '407329572793', name: 'Voodoo Vanilla', price: '$12.99', maxQuantity: 6 };
const price = (candidate, stock, active = true) => ({
  lookup_key: priceLookupKey(candidate), currency: 'usd', unit_amount: directPriceCents(candidate),
  product: { active, metadata: { dc_stock: String(stock), dc_sale_sessions: 'private_session' } }
});
const stripe = (data) => ({ prices: { list: async () => ({ data, has_more: false }) } });

test('public inventory uses current Stripe stock, including zero, without leaking metadata', async () => {
  assert.deepEqual(await readInventory(stripe([price(item, 5)]), [item]), [{ id: item.id, quantity: 5 }]);
  assert.deepEqual(await readInventory(stripe([price(item, 0)]), [item]), [{ id: item.id, quantity: 0 }]);
  assert.deepEqual(await readInventory(stripe([price(item, 5, false)]), [item]), [{ id: item.id, quantity: 0 }]);
});

test('unconfigured, invalid, or mismatched stock never falls back to static availability', async () => {
  for (const data of [[], [price(item, 'invalid')], [{ ...price(item, 5), currency: 'eur' }], [{ ...price(item, 5), unit_amount: 1 }]]) {
    assert.deepEqual(await readInventory(stripe(data), [item]), [{ id: item.id, quantity: null }]);
  }
  assert.deepEqual(await readInventory(stripe([]), [{ ...item, directCheckoutEnabled: false }]), []);
});

test('inventory reads every listing in ten-key batches and rejects incomplete results', async () => {
  const items = Array.from({ length: 24 }, (_, i) => ({ ...item, id: String(i) }));
  const sizes = [];
  const client = { prices: { list: async ({ lookup_keys }) => {
    sizes.push(lookup_keys.length);
    return { data: items.filter((candidate) => lookup_keys.includes(priceLookupKey(candidate))).map((candidate) => price(candidate, 3)), has_more: false };
  } } };
  const result = await readInventory(client, items);
  assert.deepEqual(sizes, [10, 10, 4]);
  assert.equal(result.length, 24);
  assert.ok(result.every((entry) => entry.quantity === 3));
  await assert.rejects(readInventory({ prices: { list: async () => ({ data: [], has_more: true }) } }, [item]), /incomplete/);
});

test('inventory endpoint is read-only and does not cache failure responses', async () => {
  const post = await inventoryHandler(new Request('https://discontinuedclub.com/.netlify/functions/inventory', { method: 'POST' }));
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('cache-control'), 'no-store');
  const key = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  try {
    const response = await inventoryHandler(new Request('https://discontinuedclub.com/.netlify/functions/inventory'));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  } finally {
    if (key !== undefined) process.env.STRIPE_SECRET_KEY = key;
  }
});

const source = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');

async function storefront(initialCart = []) {
  const listeners = new Map();
  const intervals = [];
  const label = {};
  const arrow = {};
  const badge = { dataset: { stockId: item.id } };
  const feedback = { dataset: { productActionFeedback: item.id } };
  const button = {
    dataset: { addToCart: item.id }, classList: { toggle() {} },
    querySelector: (selector) => selector === '[data-add-label]' ? label : arrow,
    setAttribute() {}
  };
  let responseStock = 5;
  let failed = false;
  let stored = JSON.stringify(initialCart);
  const document = {
    hidden: false, referrer: '', body: { dataset: {} },
    getElementById: () => null, querySelector: () => null,
    querySelectorAll: (selector) => ({
      '[data-add-to-cart]': [button], '[data-stock-id]': [badge], '[data-product-action-feedback]': [feedback]
    }[selector] || []),
    addEventListener: (event, fn) => listeners.set(event, fn)
  };
  const window = {
    DC_CATALOG: [item], DC_STORE_CONFIG: { directCheckoutEnabled: true },
    location: { pathname: '/', search: '' },
    addEventListener: (event, fn) => listeners.set(event, fn),
    setInterval: (fn, ms) => intervals.push({ fn, ms })
  };
  const context = vm.createContext({ window, document, Intl, URLSearchParams, Event, AbortSignal,
    localStorage: { getItem: () => stored, setItem: (key, value) => { stored = value; } },
    fetch: async () => {
      if (failed) throw new Error('offline');
      return { ok: true, json: async () => ({ inventory: [{ id: item.id, quantity: responseStock }] }) };
    }
  });
  // Expose only for the test VM; production still keeps cart state private in its closure.
  const instrumented = source.replace(/\}\(\)\);\s*$/, 'window.testInventory = { refreshInventory, addToCart, getMaxQuantity, stockLabel, getCart: () => cart }; }());');
  vm.runInContext(instrumented, context);
  await window.testInventory.refreshInventory();
  return { ...window.testInventory, label, badge, feedback, button, listeners, intervals, document,
    setStock: (value) => { responseStock = value; }, setFailed: (value) => { failed = value; }
  };
}

test('storefront refresh changes badges and cart maximum without a rebuild', async () => {
  const site = await storefront();
  assert.equal(site.badge.textContent, '5 in stock');
  assert.equal(site.button.disabled, false);
  assert.equal(site.addToCart(item.id, 6).added, 5);
  site.setStock(4);
  await site.refreshInventory();
  assert.equal(site.badge.textContent, '4 in stock');
  assert.equal(site.getCart()[0].quantity, 4);
  assert.equal(site.label.textContent, 'All stock in cart');
  assert.match(site.feedback.textContent, /4 available/);
});

test('zero stock removes stale cart quantities and disables purchase buttons', async () => {
  const site = await storefront([{ id: item.id, quantity: 6 }]);
  site.setStock(0);
  await site.refreshInventory();
  assert.equal(site.getCart().length, 0);
  assert.equal(site.label.textContent, 'Sold out');
  assert.equal(site.badge.textContent, 'Sold out');
  assert.equal(site.button.disabled, true);
  assert.equal(site.addToCart(item.id, 1), null);
});

test('lookup failures hide exact counts and block additions, then recover', async () => {
  const site = await storefront();
  site.setFailed(true);
  await site.refreshInventory();
  assert.equal(site.badge.textContent, 'Stock unavailable');
  assert.equal(site.button.disabled, true);
  assert.equal(site.addToCart(item.id, 1), null);
  site.setFailed(false);
  site.setStock(1);
  await site.refreshInventory();
  assert.equal(site.badge.textContent, 'Last one');
  assert.equal(site.button.disabled, false);
});

test('open storefronts refresh every thirty seconds and when returning to the tab', async () => {
  const site = await storefront();
  assert.equal(site.intervals[0].ms, 30000);
  site.setStock(3);
  site.intervals[0].fn();
  await site.refreshInventory();
  assert.equal(site.badge.textContent, '3 in stock');
  assert.ok(site.listeners.has('visibilitychange'));
  assert.ok(site.listeners.has('pageshow'));
  assert.ok(site.listeners.has('focus'));
});

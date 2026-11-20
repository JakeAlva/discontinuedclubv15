import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog, directPriceCents, priceLookupKey } from '../lib/store-catalog.mjs';
import { createPreorderInventory, preorderForCart, preorderOpen, openPreorderCheckout } from '../lib/preorders.mjs';
import { readInventory } from '../netlify/functions/inventory.mjs';
import { serializeCatalogModule } from '../lib/catalog-file.mjs';
import cancelPreorder from '../netlify/functions/preorder-cancel.mjs';

const item = catalog.find((entry) => entry.id === 'bloom-pear-scare');
const now = () => Date.parse('2026-11-19T18:00:00Z');
function fixture() {
  const rows = new Map();
  let version = 0;
  const store = {
    async getWithMetadata(key) { return structuredClone(rows.get(key) || null); },
    async setJSON(key, data, options) {
      const previous = rows.get(key);
      if ((options.onlyIfNew && previous) || (options.onlyIfMatch && previous?.etag !== options.onlyIfMatch)) return { modified: false };
      const etag = String(++version);
      rows.set(key, { data: structuredClone(data), etag });
      return { modified: true, etag };
    }
  };
  const sessions = new Map();
  const stripe = { checkout: { sessions: {
    async retrieve(id) { if (!sessions.has(id)) throw new Error('Unavailable'); return sessions.get(id); }
  } } };
  return { rows, store, sessions, stripe, inventory: createPreorderInventory(store, { now }) };
}
function sessionFor(claim, state = {}) {
  return { id: `cs_${claim.reservation}`, status: 'open', payment_status: 'unpaid', metadata: {
    source: 'discontinuedclub.com', dc_preorder_item: item.id,
    dc_preorder_reservation: claim.reservation, dc_preorder_slots: claim.indexes.join(',')
  }, ...state };
}

test('approved preorder price, capacity and cutoff stay exact', () => {
  assert.equal(directPriceCents(item), 799);
  assert.equal(item.preorder.capacity, 12);
  assert.equal(item.websiteOnly, true);
  assert.match(item.name, /12 oz/);
  assert.equal(preorderOpen(item, now()), true);
  assert.equal(preorderOpen(item, Date.parse(item.preorder.closesAt)), false);
  assert.equal(preorderForCart([{ item, quantity: 1 }], now()).item, item);
  assert.throws(() => preorderForCart([{ item }, { item: catalog.find((entry) => !entry.preorder) }], now()), /separate/);
  assert.throws(() => preorderForCart([{ item }], Date.parse('2026-12-01')), /closed/);
});

test('concurrent shoppers cannot claim more than twelve physical cans', async () => {
  const f = fixture();
  const attempts = await Promise.allSettled(Array.from({ length: 30 }, () => f.inventory.reserve(item, 1, f.stripe)));
  assert.equal(attempts.filter((a) => a.status === 'fulfilled').length, 12);
  assert.equal(await f.inventory.available(item, f.stripe), 0);
  assert.equal(new Set(attempts.filter((a) => a.status === 'fulfilled').map((a) => a.value.indexes[0])).size, 12);
});

test('partial multi-can reservation rolls back without releasing another customer', async () => {
  const f = fixture();
  const original = await f.inventory.reserve(item, 11, f.stripe);
  await assert.rejects(f.inventory.reserve(item, 2, f.stripe), /quantity changed/);
  assert.equal(await f.inventory.available(item, f.stripe), 1);
  assert.equal([...f.rows.values()].filter((entry) => entry.data.reservation === original.reservation && entry.data.status === 'held').length, 11);
});

test('expired abandoned checkout restores stock and late expiration cannot clear a newer reservation', async () => {
  const f = fixture();
  const claim = await f.inventory.reserve(item, 2, f.stripe);
  const session = sessionFor(claim);
  f.sessions.set(session.id, session);
  await f.inventory.attach(item, claim, session);
  assert.equal(await f.inventory.available(item, f.stripe), 10);
  session.status = 'expired';
  assert.equal(await f.inventory.available(item, f.stripe), 12);
  await f.inventory.reserve(item, 1, f.stripe);
  await f.inventory.settle(item, session);
  assert.equal(await f.inventory.available(item, f.stripe), 11);
});

test('paid sessions decrement once, remain sold on duplicate/out-of-order events and survive restart', async () => {
  const f = fixture();
  const claim = await f.inventory.reserve(item, 2, f.stripe);
  const session = sessionFor(claim, { payment_status: 'paid', status: 'complete' });
  await f.inventory.settle(item, session);
  await f.inventory.attach(item, claim, session);
  await f.inventory.settle(item, session);
  await f.inventory.settle(item, { ...session, payment_status: 'unpaid', status: 'expired' });
  const restarted = createPreorderInventory(f.store, { now });
  assert.equal(await restarted.available(item, f.stripe), 10);
});

test('unknown Stripe outcomes and unreachable sessions fail closed', async () => {
  const f = fixture();
  const claim = await f.inventory.reserve(item, 1, f.stripe);
  assert.equal(await f.inventory.available(item, f.stripe), 11);
  await f.inventory.attach(item, claim, sessionFor(claim));
  await assert.rejects(f.inventory.available(item, f.stripe), /Unavailable/);
  assert.equal([...f.rows.values()][0].data.status, 'held');
});

test('invalid quantities and foreign sessions never change claims', async () => {
  const f = fixture();
  for (const quantity of [0, 13, -1, 1.5]) await assert.rejects(f.inventory.reserve(item, quantity, f.stripe), /quantity/);
  const claim = await f.inventory.reserve(item, 1, f.stripe);
  const session = sessionFor(claim, { status: 'complete', payment_status: 'paid' });
  session.metadata.source = 'another-store';
  await assert.rejects(f.inventory.settle(item, session), /does not match/);
  assert.equal(await f.inventory.available(item, f.stripe), 11);
});

test('missing storage versions and empty claim indexes fail closed', async () => {
  const f = fixture();
  const claim = await f.inventory.reserve(item, 1, f.stripe);
  const session = sessionFor(claim, { status: 'complete', payment_status: 'paid' });
  session.metadata.dc_preorder_slots = '';
  await assert.rejects(f.inventory.settle(item, session), /reference is invalid/);
  const row = [...f.rows.values()][0];
  delete row.etag;
  await assert.rejects(f.inventory.release(item, claim.reservation, claim.indexes), /storage unavailable/);
  assert.equal(row.data.status, 'held');
});

test('checkout makes payment timing explicit and removes ordinary transit estimate', async () => {
  const f = fixture();
  let sent;
  f.stripe.checkout.sessions.create = async (params, options) => {
    sent = params;
    assert.match(options.idempotencyKey, /^preorder-/);
    const session = { id: 'cs_preview', status: 'open', payment_status: 'unpaid', metadata: params.metadata };
    f.sessions.set(session.id, session);
    return session;
  };
  await openPreorderCheckout(f.stripe, f.inventory, { item, quantity: 2 }, {
    cancel_url: 'https://discontinuedclub.com/out-now.html?checkout=cancelled',
    mode: 'payment', line_items: [{ price: 'price_example', quantity: 2 }],
    metadata: { source: 'discontinuedclub.com' }, payment_intent_data: {},
    shipping_options: [{ shipping_rate_data: { fixed_amount: { amount: 1699, currency: 'usd' }, delivery_estimate: { minimum: 2, maximum: 5 } } }]
  });
  assert.deepEqual(sent.payment_method_types, ['card']);
  assert.match(sent.cancel_url, /^https:\/\/discontinuedclub.com\/preorder-return.html#item=bloom-pear-scare&reservation=/);
  assert.equal(sent.shipping_options[0].shipping_rate_data.delivery_estimate, undefined);
  assert.match(sent.custom_text.submit.message, /paying now.*PREORDER/);
  assert.match(sent.custom_text.shipping_address.message, /November 30, 2026/);
  assert.equal(sent.payment_intent_data.metadata.dc_preorder_ship_date, '2026-11-30');
  assert.equal(await f.inventory.available(item, f.stripe), 10);
});

test('definitive Stripe rejection releases claims; uncertain failures do not', async () => {
  for (const type of ['StripeInvalidRequestError', 'StripeConnectionError']) {
    const f = fixture();
    f.stripe.checkout.sessions.create = async () => { throw Object.assign(new Error('Failed'), { type }); };
    await assert.rejects(openPreorderCheckout(f.stripe, f.inventory, { item, quantity: 1 }, { cancel_url: 'https://discontinuedclub.com/out-now.html', metadata: {}, shipping_options: [{ shipping_rate_data: {} }] }));
    assert.equal(await f.inventory.available(item, f.stripe), type === 'StripeInvalidRequestError' ? 12 : 11);
  }
});

test('returning from checkout expires only the matching unpaid reservation', async () => {
  const f = fixture();
  const claim = await f.inventory.reserve(item, 2, f.stripe);
  const session = sessionFor(claim);
  f.sessions.set(session.id, session);
  await f.inventory.attach(item, claim, session);
  f.stripe.checkout.sessions.expire = async (id) => { assert.equal(id, session.id); session.status = 'expired'; return session; };
  assert.deepEqual(await f.inventory.cancel(item, claim.reservation, f.stripe), { released: true, paid: false });
  assert.equal(await f.inventory.available(item, f.stripe), 12);
  assert.deepEqual(await f.inventory.cancel(item, claim.reservation, f.stripe), { released: true, paid: false });
  await assert.rejects(f.inventory.cancel(item, 'another-reservation', f.stripe), /not found/);
});

test('paid, processing and raced payments cannot be released by the return page', async () => {
  for (const state of ['paid', 'processing', 'raced']) {
    const f = fixture();
    const claim = await f.inventory.reserve(item, 1, f.stripe);
    const session = sessionFor(claim, { status: state === 'raced' ? 'open' : 'complete', payment_status: state === 'paid' ? 'paid' : 'unpaid' });
    f.sessions.set(session.id, session);
    await f.inventory.attach(item, claim, session);
    f.stripe.checkout.sessions.expire = async () => { throw new Error('Session has completed'); };
    if (state === 'paid') assert.deepEqual(await f.inventory.cancel(item, claim.reservation, f.stripe), { released: false, paid: true });
    else await assert.rejects(f.inventory.cancel(item, claim.reservation, f.stripe));
    assert.equal(await f.inventory.available(item, f.stripe), 11);
  }
});

test('cancellation endpoint rejects bad methods, origins and references before Stripe', async () => {
  const url = 'https://discontinuedclub.com/.netlify/functions/preorder-cancel';
  assert.equal((await cancelPreorder(new Request(url))).status, 405);
  const request = (origin, payload) => new Request(url, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  assert.equal((await cancelPreorder(request('https://another.example', {}))).status, 403);
  assert.equal((await cancelPreorder(request('https://discontinuedclub.com', { item: item.id, reservation: 'guess' }))).status, 400);
  assert.equal((await cancelPreorder(request('https://discontinuedclub.com', { item: catalog.find((entry) => !entry.preorder).id, reservation: '00000000-0000-4000-8000-000000000001' }))).status, 400);
});

test('public inventory uses reservations and never exposes private claim records', async () => {
  const f = fixture();
  f.stripe.prices = { list: async () => ({ data: [{ currency: 'usd', unit_amount: 799, lookup_key: priceLookupKey(item), product: { active: true, metadata: { dc_stock: '12' } } }] }) };
  await f.inventory.reserve(item, 2, f.stripe);
  assert.deepEqual(await readInventory(f.stripe, [item], f.inventory), [{ id: item.id, quantity: 10 }]);
  assert.deepEqual(await readInventory(f.stripe, [item]), [{ id: item.id, quantity: null }]);
});

test('website-only product survives catalog serialization with its preorder contract', () => {
  const serialized = serializeCatalogModule([item], {});
  assert.match(serialized, /"websiteOnly": true/);
  assert.match(serialized, /"directPriceCents": 799/);
  assert.match(serialized, /"preorder":/);
});

test('generated product page and merchant feed identify preorder without invented eBay offers', async () => {
  const page = await readFile(new URL('../products/bloom-pear-scare-12-oz-single-can-bloom-pear-scare.html', import.meta.url), 'utf8');
  assert.match(page, /schema.org\/PreOrder/);
  assert.match(page, /Expected to ship November 30, 2026/);
  assert.doesNotMatch(page, /ebay.com\/itm\/bloom-pear-scare|Save \$0\.00|same-day carrier drop-off/);
  const feed = await readFile(new URL('../google-merchant-feed.xml', import.meta.url), 'utf8');
  const entry = feed.match(/<item>\s*<g:id>dc-bloom-pear-scare<\/g:id>[\s\S]*?<\/item>/)[0];
  assert.match(entry, /<g:availability>preorder<\/g:availability>/);
  assert.match(entry, /2026-11-30T00:00:00-06:00/);
});

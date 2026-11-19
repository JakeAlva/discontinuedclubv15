import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryReviewStore } from './helpers/review-store.mjs';
import { createFunnelService, sanitizeClientEvent, checkoutAttribution, validJourney } from '../lib/funnel.mjs';
import { funnelHandler } from '../lib/funnel-http.mjs';
import { injectArticleProducts, articleProducts } from '../scripts/blog-commerce.mjs';
import { catalog, directPriceCents, formatMoney } from '../lib/store-catalog.mjs';
import { readFile } from 'node:fs/promises';

const now = Date.parse('2026-11-19T15:00:00Z');
const journey = '2026-11-19_12345678-1234-1234-1234-123456789abc';
const article = '/journal/ghost-aw-root-beer-energy-drink-permanent-2027.html';
const product = '407329572793';
const paid = { id: 'cs_live_testfixture', livemode: true, payment_status: 'paid', mode: 'payment', amount_total: 3707, currency: 'usd', metadata: { source: 'discontinuedclub.com', dc_journey: journey, dc_article: article } };

test('client events strip private fields, reject fake purchases and unknown identifiers', () => {
  assert.deepEqual(sanitizeClientEvent({ journey, article, product, event: 'add_to_cart', email: 'private', address: 'private', query: 'private' }, now), { journey, article, product, event: 'add_to_cart' });
  assert.throws(() => sanitizeClientEvent({ journey, event: 'purchase' }, now));
  assert.throws(() => sanitizeClientEvent({ journey, event: 'product_view', product: 'unknown' }, now));
  assert.throws(() => sanitizeClientEvent({ journey, event: 'article_view', article: '/journal/private-email@example.com' }, now));
  assert.deepEqual(checkoutAttribution({ journey, article: 'https://example.com/private' }, now), { dc_journey: journey, dc_article: '' });
  assert.equal(validJourney('2025-01-01_12345678-1234-1234-1234-123456789abc', now), false);
  assert.equal(validJourney('2026-12-01_12345678-1234-1234-1234-123456789abc', now), false);
});

test('concurrent events survive, repeat events deduplicate, and first article attribution persists', async () => {
  const service = createFunnelService(memoryReviewStore(), () => now);
  await Promise.all(['article_view', 'product_view', 'add_to_cart', 'checkout_attempt'].map((event) => service.record({ journey, article, product, event })));
  await service.record({ journey, article: '/discontinued-monster-energy-flavors.html', event: 'article_view' });
  await service.record({ journey, product, event: 'add_to_cart' });
  const report = await service.report(7);
  assert.equal(report.counts.visit, 1); assert.equal(report.counts.add_to_cart, 1);
  assert.equal(report.articles[0].article, article); assert.equal(report.products[0].carts, 1);
});

test('only live paid purchases count, webhook retries do not duplicate revenue', async () => {
  const store = memoryReviewStore(); const service = createFunnelService(store, () => now);
  for (const patch of [{ livemode: false }, { payment_status: 'unpaid' }, { payment_status: 'no_payment_required' }, { mode: 'subscription' }, { amount_total: 0 }]) assert.equal(await service.purchase({ ...paid, ...patch }), false);
  await service.purchase(paid); await service.purchase(paid);
  const report = await service.report(7);
  assert.equal(report.purchases, 1); assert.equal(report.revenueCents, 3707); assert.equal(report.stopped.paid, 1);
  assert.ok(!JSON.stringify([...store.records.values()]).includes(paid.id));
});

test('cohorts use session date; pending, errors and eBay exits stay distinct from purchases', async () => {
  const service = createFunnelService(memoryReviewStore(), () => now);
  await service.record({ journey, event: 'checkout_error' });
  await service.record({ journey, event: 'ebay_exit' });
  await service.record({ journey: journey.replace('11-19', '11-18'), event: 'checkout_opened' });
  const today = await service.report(1); const week = await service.report(7);
  assert.equal(today.counts.visit, 1); assert.equal(week.counts.visit, 2);
  assert.equal(week.errors, 1); assert.equal(week.ebayExits, 1); assert.equal(week.purchases, 0); assert.equal(week.stopped.checkout, 1);
});

test('report endpoint requires origin and secret; public endpoint cannot forge purchases', async () => {
  const service = createFunnelService(memoryReviewStore());
  const make = (body, headers = {}) => new Request('https://discontinuedclub.com/.netlify/functions/funnel-event', { method: 'POST', headers: { origin: 'https://discontinuedclub.com', 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const admin = funnelHandler(() => service, { admin: true, adminKey: () => 'a'.repeat(35) });
  assert.equal((await admin(make({ days: 7 }))).status, 401);
  assert.equal((await admin(make({ days: 7 }, { authorization: 'Bearer ' + 'a'.repeat(35) }))).status, 200);
  assert.equal((await admin(make({ days: 7 }, { origin: 'https://evil.invalid' }))).status, 403);
  const collect = funnelHandler(() => service);
  assert.equal((await collect(make({ journey, event: 'purchase' }))).status, 400);
  assert.equal((await collect(make({ x: 'a'.repeat(3000) }))).status, 413);
  assert.equal((await collect(make({ journey, event: 'visit' }, { 'sec-gpc': '1' }))).status, 200);
});

test('curated recommendations use current products, honest alternative labels and hidden unverified stock', async () => {
  for (const [path, config] of Object.entries(articleProducts)) {
    const html = await readFile(new URL('..' + path, import.meta.url), 'utf8');
    const rendered = injectArticleProducts(html, path, catalog);
    assert.match(rendered, /data-article-products hidden/);
    for (const id of config.ids) {
      assert.ok(catalog.some((item) => item.id === id), id);
      assert.match(rendered, new RegExp(`data-recommended-product="${id}" hidden`));
      assert.ok(rendered.includes(`<strong>${formatMoney(directPriceCents(catalog.find((item) => item.id === id)))}</strong>`));
    }
    assert.equal((rendered.match(/id="short-answer"/g) || []).length, (html.match(/id="short-answer"/g) || []).length);
  }
  assert.match(articleProducts[article].note, /not Ghost/);
});

test('retention deletes old session records but keeps current records', async () => {
  const store = memoryReviewStore();
  store.delete = async (key) => store.records.delete(key);
  const service = createFunnelService(store, () => now);
  await service.record({ journey, event: 'visit' });
  await service.record({ journey: journey.replace('2026-11-19', '2026-01-01'), event: 'visit' });
  assert.equal(await service.cleanup(), 1);
  assert.equal(store.records.size, 1);
});

test('recommendations fail closed when live stock is unavailable; analytics does not authorize shopping', async () => {
  const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
  assert.match(app, /hasLiveStock\(item\) && getMaxQuantity\(item\) > 0/);
  assert.match(app, /section.hidden = visible === 0/);
  assert.match(app, /analytics: shoppingAnalytics\?\.attribution\(\)/);
  assert.doesNotMatch(app, /await analytics/);
  const client = await readFile(new URL('../assets/funnel.mjs', import.meta.url), 'utf8');
  assert.match(client, /choice !== 'yes'/);
  assert.match(client, /globalPrivacyControl/);
  assert.doesNotMatch(client, /document\.cookie|navigator\.sendBeacon/);
});

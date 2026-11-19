import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createReviewService } from '../lib/reviews.mjs';
import { createReviewHandlers } from '../lib/review-http.mjs';
import { verifiedReviewPurchase, canonicalReviewProductId } from '../lib/review-purchase.mjs';
import { reviewStoreName } from '../lib/review-runtime.mjs';
import { memoryReviewStore, samplePurchase, submission } from './helpers/review-store.mjs';

async function fixture() {
  const store = memoryReviewStore();
  let date = new Date('2026-11-17T16:00:00Z');
  const service = createReviewService({ store, now: () => date });
  const invitation = await service.invite(samplePurchase);
  return { store, service, invitation, advance: (days) => { date = new Date(date.getTime() + days * 86400000); } };
}

test('invitations store only a hash of the secret and expose no order or contact identifiers', async () => {
  const { store, service, invitation } = await fixture();
  assert.match(invitation.token, /^[a-f0-9]{64}\.[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify([...store.records.values()]).includes(invitation.token));
  const data = await service.invitation(invitation.token);
  assert.deepEqual(Object.keys(data).sort(), ['expiresAt', 'products', 'submitted']);
  assert.ok(!JSON.stringify(data).includes(samplePurchase.paymentIntentId));
});

test('tampered, missing, unknown and expired invitation tokens fail closed', async () => {
  const { service, invitation, advance } = await fixture();
  for (const token of ['', null, 'pi_TESTonly', 'a'.repeat(64) + '.' + 'b'.repeat(64), invitation.token.slice(0, -1) + (invitation.token.endsWith('a') ? 'b' : 'a')]) {
    await assert.rejects(service.invitation(token), { status: 404 });
  }
  advance(45);
  await assert.rejects(service.invitation(invitation.token), { status: 410 });
  await assert.rejects(service.submit(submission(invitation.token)), { status: 410 });
});

test('reissuing invalidates the previous link and cannot reset an existing review', async () => {
  const { service, invitation } = await fixture();
  await assert.rejects(service.invite(samplePurchase), { status: 409 });
  const next = await service.invite(samplePurchase, { renew: true });
  await assert.rejects(service.invitation(invitation.token), { status: 404 });
  await service.submit(submission(next.token));
  await assert.rejects(service.invite(samplePurchase, { renew: true }), { status: 409 });
});

test('concurrent submissions accept exactly one and never overwrite the winner', async () => {
  const { service, invitation } = await fixture();
  const results = await Promise.allSettled([service.submit(submission(invitation.token)), service.submit(submission(invitation.token, { displayName: 'Second' }))]);
  assert.equal(results.filter((entry) => entry.status === 'fulfilled').length, 1);
  assert.equal(results.find((entry) => entry.status === 'rejected').reason.status, 409);
  assert.equal((await service.queue()).count, 1);
  await assert.rejects(service.submit(submission(invitation.token)), { status: 409 });
});

test('storage without a read version cannot accidentally make unconditional writes', async () => {
  const { store, invitation } = await fixture();
  const unsafeStore = {
    ...store,
    getWithMetadata: async (...args) => {
      const entry = await store.getWithMetadata(...args);
      return entry ? { data: entry.data } : null;
    },
    setJSON: async () => assert.fail('An unversioned record must never be written')
  };
  const service = createReviewService({ store: unsafeStore });
  await assert.rejects(service.invitation(invitation.token), { status: 503 });
  await assert.rejects(service.submit(submission(invitation.token)), { status: 503 });
  await assert.rejects(service.invite(samplePurchase, { renew: true }), { status: 503 });
});

test('new and hidden reviews are private, while approved product and company scores stay separate', async () => {
  const { service, invitation } = await fixture();
  await service.submit(submission(invitation.token));
  assert.deepEqual(await service.published(), { count: 0, average: null, reviews: [], nextOffset: null });
  const entry = (await service.queue()).reviews[0];
  await service.moderate({ id: entry.id, etag: entry.etag, status: 'approved' });
  const company = await service.published();
  const product = await service.published({ productId: samplePurchase.products[0].id });
  assert.equal(company.average, 5); assert.equal(product.average, 2);
  assert.equal((await service.published({ productId: samplePurchase.products[1].id })).count, 0);
  assert.deepEqual(Object.keys(company.reviews[0]).sort(), ['body', 'displayName', 'rating', 'submittedAt', 'verifiedPurchase']);
  assert.ok(!JSON.stringify(company).includes(entry.id));
  assert.ok(!JSON.stringify(product).includes('pi_'));
  const published = (await service.queue({ status: 'approved' })).reviews[0];
  await service.moderate({ id: published.id, etag: published.etag, status: 'hidden', reason: 'author_request' });
  assert.equal((await service.published()).count, 0);
});

test('stale moderation cannot overwrite a newer decision, and hiding requires a neutral reason', async () => {
  const { service, invitation } = await fixture();
  await service.submit(submission(invitation.token));
  const entry = (await service.queue()).reviews[0];
  await assert.rejects(service.moderate({ ...entry, status: 'hidden', reason: 'negative_review' }), { status: 400 });
  await service.moderate({ id: entry.id, etag: entry.etag, status: 'approved' });
  await assert.rejects(service.moderate({ id: entry.id, etag: entry.etag, status: 'hidden', reason: 'spam' }), { status: 409 });
});

for (const [name, changes] of [
  ['missing consent', { consent: false }], ['bad name', { displayName: 'private@example.com' }],
  ['long name', { displayName: 'a'.repeat(41) }], ['honeypot', { website: 'spam' }],
  ['empty review', { products: [], company: null }], ['unknown product', { products: [{ id: '123456789012', rating: 5, body: 'Not purchased', buyAgain: null }] }],
  ['duplicate product', { products: [submission('').products[0], submission('').products[0]] }],
  ['fractional rating', { company: { rating: 4.5, body: 'Sample review' } }],
  ['string rating', { company: { rating: '5', body: 'Sample review' } }],
  ['out of range', { company: { rating: 6, body: 'Sample review' } }],
  ['empty comment', { company: { rating: 5, body: '' } }],
  ['oversized comment', { company: { rating: 5, body: 'a'.repeat(2001) } }],
  ['invalid preference', { products: [{ ...submission('').products[0], buyAgain: 'yes' }] }]
]) test(`submission rejects ${name}`, async () => {
  const { service, invitation } = await fixture();
  await assert.rejects(service.submit(submission(invitation.token, changes)), { status: 400 });
  assert.equal((await service.invitation(invitation.token)).submitted, false);
});

test('a buyer may skip an untasted product or submit only a product review', async () => {
  for (const changes of [{ products: [] }, { company: null }]) {
    const { service, invitation } = await fixture();
    await service.submit(submission(invitation.token, changes));
    assert.equal((await service.queue()).count, 1);
  }
});

test('all storage pages contribute to totals, and public lists paginate without duplicating entries', async () => {
  const { service } = await fixture();
  for (let i = 0; i < 23; i++) {
    const invite = await service.invite({ ...samplePurchase, paymentIntentId: `pi_sample${i}` });
    await service.submit(submission(invite.token, { displayName: `Sample ${i}` }));
    const entry = (await service.queue()).reviews.find((item) => item.id === invite.id);
    await service.moderate({ id: entry.id, etag: entry.etag, status: 'approved' });
  }
  const all = [];
  for (let offset = 0; offset !== null;) {
    const page = await service.published({ offset }); assert.equal(page.count, 23);
    all.push(...page.reviews); offset = page.nextOffset;
  }
  assert.equal(new Set(all.map((item) => item.displayName)).size, 23);
  assert.equal((await service.queue({ status: 'approved' })).nextOffset, 20);
});

const adminKey = 'a-local-test-key-that-is-long-enough';
const request = (body, { method = 'POST', headers = {}, path = '' } = {}) => new Request(`https://discontinuedclub.com/${path}`, {
  method, headers: { 'Content-Type': 'application/json', ...headers }, body: method === 'POST' ? JSON.stringify(body) : undefined
});
function handlers(options = {}) {
  return createReviewHandlers({ getStore: () => memoryReviewStore(), loadPurchase: async () => samplePurchase, adminKey: () => adminKey, ...options });
}

test('administration requires a configured long key and never accepts it in query parameters', async () => {
  const admin = handlers().admin;
  for (const headers of [{}, { Authorization: 'Bearer wrong' }]) assert.equal((await admin(request({ action: 'list' }, { headers }))).status, 401);
  assert.equal((await admin(request({ action: 'list' }, { path: `?key=${adminKey}` }))).status, 401);
  assert.equal((await handlers({ adminKey: () => '' }).admin(request({ action: 'list' }))).status, 503);
  assert.equal((await admin(request({ action: 'list' }, { headers: { Authorization: `Bearer ${adminKey}` } }))).status, 200);
});

test('HTTP rejects cross-site requests, wrong methods, invalid JSON and oversized streams', async () => {
  const h = handlers();
  assert.equal((await h.submit(request({}, { headers: { Origin: 'https://evil.example' } }))).status, 403);
  assert.equal((await h.submit(request({}, { headers: { 'Sec-Fetch-Site': 'cross-site' } }))).status, 403);
  assert.equal((await h.submit(request({}, { method: 'GET' }))).status, 405);
  assert.equal((await h.publicReviews(request({}))).status, 405);
  assert.equal((await h.submit(request({}, { headers: { 'Content-Type': 'text/plain' } }))).status, 415);
  assert.equal((await h.submit(new Request('https://discontinuedclub.com/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' }))).status, 400);
  assert.equal((await h.submit(request({ text: 'a'.repeat(25000) }))).status, 413);
});

test('HTTP response projections and cache headers exclude private state; full happy path works', async () => {
  const store = memoryReviewStore();
  const h = handlers({ getStore: () => store });
  const auth = { headers: { Authorization: `Bearer ${adminKey}` } };
  const response = await h.admin(request({ action: 'invite', paymentIntentId: 'pi_TESTonly' }, auth));
  assert.equal(response.status, 201);
  const invitation = await response.json();
  const url = new URL(invitation.url);
  assert.equal(url.search, '');
  const token = new URLSearchParams(url.hash.slice(1)).get('invite');
  assert.equal((await h.invitation(request({ token }))).status, 200);
  assert.equal((await h.submit(request(submission(token)))).status, 201);
  const queue = await (await h.admin(request({ action: 'list' }, auth))).json();
  const entry = queue.reviews[0];
  assert.equal((await h.admin(request({ action: 'moderate', id: entry.id, etag: entry.etag, status: 'approved' }, auth))).status, 200);
  const published = await h.publicReviews(request(null, { method: 'GET' }));
  assert.equal(published.headers.get('cache-control'), 'no-store');
  const body = await published.text();
  for (const secret of [adminKey, token, entry.id, 'paymentIntentId', 'tokenHash', 'etag']) assert.ok(!body.includes(secret), secret);
});

test('infrastructure errors never expose secrets or masquerade as no reviews', async () => {
  const response = await handlers({ getStore: () => { throw new Error('private-secret'); } }).publicReviews(request(null, { method: 'GET' }));
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes('private-secret'));
});

function stripeFixture({ payment = {}, session = {}, line = {} } = {}) {
  return {
    paymentIntents: { retrieve: async () => ({ livemode: true, status: 'succeeded', amount_received: 2003, metadata: { source: 'discontinuedclub.com' }, ...payment }) },
    checkout: { sessions: {
      list: async function* () { yield { id: 'cs_live_sample', livemode: true, payment_status: 'paid', status: 'complete', metadata: { source: 'discontinuedclub.com' }, ...session }; },
      listLineItems: async function* () { yield { quantity: 1, description: 'Winter Wonderland', price: { product: { metadata: { dc_listing_id: '407300260883' } } }, ...line }; }
    } }
  };
}

test('purchase verification requires a live successful payment and paid website checkout', async () => {
  const result = await verifiedReviewPurchase(stripeFixture(), 'pi_sample');
  assert.equal(result.products[0].id, '407343435479');
  assert.equal(canonicalReviewProductId('407297979026'), '407373107823');
  assert.equal(canonicalReviewProductId('407345586271'), '407373107823');
  for (const options of [
    { payment: { livemode: false } }, { payment: { status: 'processing' } }, { payment: { status: 'requires_payment_method' } },
    { payment: { amount_received: 0 } }, { payment: { metadata: {} } },
    { session: { livemode: false } }, { session: { payment_status: 'unpaid' } }, { session: { status: 'open' } },
    { session: { metadata: {} } }, { line: { price: null } }
  ]) await assert.rejects(verifiedReviewPurchase(stripeFixture(options), 'pi_sample'), { status: 422 });
});

test('purchase line pagination handles every purchased product and groups repeated lines', async () => {
  const stripe = stripeFixture();
  stripe.checkout.sessions.listLineItems = async function* () {
    for (const id of ['407300260883', '407329572793', '407300260883']) yield { quantity: 1, price: { product: { metadata: { dc_listing_id: id } } } };
  };
  const result = await verifiedReviewPurchase(stripe, 'pi_sample');
  assert.equal(result.products.length, 2);
});

test('trusted Netlify deploy context isolates preview stores from persistent production storage', () => {
  assert.equal(reviewStoreName({ deploy: { context: 'production', id: 'deployA' } }), 'dc-reviews-v1-production');
  assert.equal(reviewStoreName({ deploy: { context: 'production', id: 'deployB' } }), 'dc-reviews-v1-production');
  assert.equal(reviewStoreName({ deploy: { context: 'deploy-preview', id: 'deployA' } }), 'dc-reviews-v1-preview-deployA');
  assert.throws(() => reviewStoreName({}), { status: 503 });
});

test('private pages are not indexed; user content is rendered with textContent, not HTML', async () => {
  for (const file of ['review.html', 'review-admin.html']) {
    const page = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(page, /noindex, nofollow/); assert.match(page, /no-referrer/);
    assert.doesNotMatch(page, /https:\/\/fonts|analytics|gtag/);
  }
  for (const file of ['review-form.mjs', 'review-admin.mjs', 'reviews.mjs']) {
    const script = await readFile(new URL(`../assets/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(script, /innerHTML|insertAdjacentHTML|localStorage|sessionStorage/);
    assert.match(script, /textContent/);
  }
});

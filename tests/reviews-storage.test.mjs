import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getStore } from '@netlify/blobs';
import { localReviewStore } from '../scripts/local-review-store.mjs';
import { createReviewService } from '../lib/reviews.mjs';
import { samplePurchase, submission } from './helpers/review-store.mjs';

test('local review storage persists across instances and honors conditional writes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dc-review-storage-'));
  try {
    let store = localReviewStore(directory);
    let service = createReviewService({ store });
    const invitation = await service.invite(samplePurchase);
    await service.submit(submission(invitation.token));
    await assert.rejects(service.submit(submission(invitation.token)), { status: 409 });
    const pending = (await service.queue()).reviews[0];
    await service.moderate({ id: pending.id, etag: pending.etag, status: 'approved' });
    await assert.rejects(service.moderate({ id: pending.id, etag: pending.etag, status: 'hidden', reason: 'spam' }), { status: 409 });
    store = localReviewStore(directory);
    service = createReviewService({ store });
    assert.equal((await service.published()).count, 1);
    assert.equal((await service.published({ productId: samplePurchase.products[0].id })).average, 2);
    assert.equal((await service.invitation(invitation.token)).submitted, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('Netlify SDK preserves conditional-write headers and returns read versions', async () => {
  const calls = [];
  const store = getStore({
    name: 'adapter-test', siteID: 'test-only', token: 'test-only', edgeURL: 'https://example.invalid', uncachedEdgeURL: 'https://example.invalid', consistency: 'strong',
    fetch: async (input, init) => {
      calls.push({ input, init });
      if (init?.method?.toUpperCase() === 'PUT') return new Response(null, { status: init.headers['if-match'] === '"stale"' ? 412 : 200, headers: { etag: '"version-1"' } });
      return new Response(JSON.stringify({ review: null }), { status: 200, headers: { etag: '"version-1"', 'Content-Type': 'application/json' } });
    }
  });
  assert.equal((await store.setJSON('orders/example', { review: null }, { onlyIfNew: true })).modified, true);
  assert.equal(calls.at(-1).init.headers['if-none-match'], '*');
  const entry = await store.getWithMetadata('orders/example', { type: 'json', consistency: 'strong' });
  assert.equal(entry.etag, '"version-1"');
  assert.deepEqual(entry.data, { review: null });
  assert.equal((await store.setJSON('orders/example', { review: {} }, { onlyIfMatch: entry.etag })).modified, true);
  assert.equal(calls.at(-1).init.headers['if-match'], entry.etag);
  assert.equal((await store.setJSON('orders/example', { review: {} }, { onlyIfMatch: '"stale"' })).modified, false);
});

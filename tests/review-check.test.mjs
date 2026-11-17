import test from 'node:test';
import assert from 'node:assert/strict';
import { checkReviewStorage } from '../lib/review-check.mjs';
import { createReviewHandlers } from '../lib/review-http.mjs';
import { memoryReviewStore } from './helpers/review-store.mjs';

test('hosted storage check verifies the real workflow and leaves its fixture hidden', async () => {
  const store = memoryReviewStore();
  const result = await checkReviewStorage(store);
  assert.equal(result.ok, true);
  assert.equal(result.checks.length, 8);
  assert.equal([...store.records.values()][0].data.status, 'hidden');
  assert.ok(!JSON.stringify(result).includes('token'));
});

test('diagnostics require admin authentication and cannot access customer review storage', async () => {
  const key = 'isolated-diagnostic-test-key-32-characters';
  let diagnosticCalls = 0;
  const handlers = createReviewHandlers({
    adminKey: () => key,
    getStore: () => assert.fail('Customer storage must not be touched'),
    loadPurchase: () => assert.fail('Stripe must not be touched'),
    getDiagnosticStore: () => { diagnosticCalls++; return memoryReviewStore(); }
  });
  const request = (auth = '') => new Request('https://discontinuedclub.com/.netlify/functions/review-admin', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: auth }, body: JSON.stringify({ action: 'check' })
  });
  assert.equal((await handlers.admin(request())).status, 401);
  assert.equal(diagnosticCalls, 0);
  assert.equal((await handlers.admin(request(`Bearer ${key}`))).status, 200);
  assert.equal(diagnosticCalls, 1);
});

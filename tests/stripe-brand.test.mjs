import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('store trust surfaces use the official Stripe badge asset', async () => {
  const [app, home, drinks, productGenerator, badge] = await Promise.all([
    read('assets/app.js'),
    read('index.html'),
    read('rare-drinks.html'),
    read('scripts/generate-product-pages.mjs'),
    read('assets/images/powered-by-stripe.svg')
  ]);

  for (const content of [app, home, drinks, productGenerator]) {
    assert.match(content, /assets\/images\/powered-by-stripe\.svg/);
  }
  assert.match(badge, /<svg[^>]+width="150"[^>]+height="34"/);
  assert.doesNotMatch(app, /Payments processed securely by Stripe/);
  assert.doesNotMatch(app, /Opening Stripe/);
  assert.doesNotMatch(home, /Secure checkout by Stripe/);
  assert.doesNotMatch(drinks, /Secure checkout by Stripe/);
});

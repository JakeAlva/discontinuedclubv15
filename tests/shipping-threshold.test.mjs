import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { XMLParser } from 'fast-xml-parser';
import { catalog, directPriceCents, shippingQuote, storeConfig } from '../lib/store-catalog.mjs';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');
const app = await read('assets/app.js');
const quoteCode = app.slice(app.indexOf('  function getShippingQuote('), app.indexOf('  let renderedCartCount'));
const clientQuote = vm.runInNewContext(quoteCode + '\ngetShippingQuote', {
  storeConfig,
  freeShippingThresholdCents: storeConfig.freeShippingThresholdCents
});

test('cart progress and trusted checkout agree at both old and new thresholds', () => {
  for (const weight of [16, 48, 96, 160, 192, 400, 640, 1120]) {
    const lines = [{ item: { shippingWeightOz: weight }, quantity: 1 }];
    for (const subtotal of [9999, 10000, 15000, 19999, 20000, 20001, 25000]) {
      const client = clientQuote(subtotal, lines);
      const server = shippingQuote(subtotal, lines);
      assert.equal(client.amount, server.amountCents);
      assert.equal(client.threshold, 20000);
      assert.equal(client.remaining, Math.max(0, 20000 - subtotal));
      assert.equal(client.progress, Math.min(100, Math.round(subtotal / 200)));
    }
  }
});

test('public policies and generated product pages no longer promise the old threshold', async () => {
  for (const path of ['terms.html', 'shipping-returns.html']) {
    const html = await read('dist/' + path);
    assert.match(html, /\$200/);
    assert.doesNotMatch(html, /\$100\b/);
    assert.match(html, /before sales tax/);
  }
  for (const item of catalog) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const html = await read(`dist/products/${slug}-${item.id}.html`);
    assert.doesNotMatch(html, /\$100\b|data-free-shipping-threshold="10000"/);
    if (item.directCheckoutEnabled !== false) assert.match(html, /free at a \$200\.00 item subtotal/);
  }
  assert.doesNotMatch(app, /\$100\b|\|\| 10000/);
  const checkout = await read('netlify/functions/create-checkout.mjs');
  assert.doesNotMatch(checkout, /\$100\b|free_100_plus|adjustable_quantity/);
  assert.match(checkout, /shippingQuote\(itemSubtotalCents, lines\)/);
});

test('merchant feed shipping charges agree with the updated checkout rules', async () => {
  const feed = new XMLParser({ parseTagValue: false }).parse(await read('google-merchant-feed.xml')).rss.channel.item;
  for (const item of catalog.filter((entry) => entry.directCheckoutEnabled !== false)) {
    const record = feed.find((entry) => entry['g:id'] === `dc-${item.id}`);
    assert.ok(record);
    const quote = shippingQuote(directPriceCents(item), [{ item, quantity: 1 }]);
    assert.equal(record['g:shipping']['g:price'], `${(quote.amountCents / 100).toFixed(2)} USD`);
  }
});

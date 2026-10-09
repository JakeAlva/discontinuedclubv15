import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { catalog, directPriceCents, formatMoney, maxQuantity, parsePriceCents, storeConfig } from '../lib/store-catalog.mjs';

const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
const shoes = catalog.filter((item) => item.category === 'kids-shoes');
const productCardCode = app.slice(app.indexOf('  function productCard(item)'), app.indexOf('  function soldCard(item)'));
const productCard = runInNewContext(productCardCode + '\nproductCard', {
  storeConfig,
  productSlug: (item) => `products/${item.id}.html`,
  listingImagePath: (item) => `assets/images/listings/branded/${item.id}.webp`,
  getDirectPriceCents: directPriceCents,
  parsePriceCents,
  formatMoney,
  getMaxQuantity: maxQuantity,
  escapeHtml: (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'),
  categoryLabels: { 'kids-shoes': "Designer kids' shoes", drinks: 'Rare drinks' }
});

test('shoe cards omit scarcity badges while other departments keep their stock labels', () => {
  for (const item of [...shoes, { ...shoes[0], maxQuantity: 2 }]) {
    const html = productCard(item);
    assert.doesNotMatch(html, /condition-badge|Last one|in stock/i);
    assert.ok(html.includes(item.name));
    assert.ok(html.includes(formatMoney(directPriceCents(item))));
  }
  assert.match(productCard({ ...shoes[0], category: 'drinks' }), /condition-badge">Last one/);
  assert.match(productCard({ ...shoes[0], category: 'drinks', maxQuantity: 2 }), /condition-badge">2 in stock/);
});

test('shoe product pages show factual pair quantities without an urgency badge', async () => {
  for (const item of shoes) {
    const slug = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;
    const html = await readFile(new URL(`../products/${slug}.html`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /Last one|sold-status available/i);
    assert.match(html, /1 pair currently listed/);
    assert.match(html, /One available/);
    assert.match(html, /"availability":"https:\/\/schema.org\/InStock"/);
    assert.equal(maxQuantity(item), 1);
  }
});

test('single-pair buttons use neutral cart feedback, enforce the limit and re-enable on removal', () => {
  const item = shoes[0];
  const label = {};
  const arrow = {};
  const attributes = {};
  const button = {
    dataset: { addToCart: item.id },
    querySelector: (selector) => selector === '[data-add-label]' ? label : arrow,
    classList: { toggle() {} },
    setAttribute: (key, value) => { attributes[key] = value; }
  };
  const feedback = { dataset: { productActionFeedback: item.id } };
  let quantity = 0;
  const code = app.slice(app.indexOf('  function syncAddButtons(onlyId)'), app.indexOf('  function saveCart()'));
  const sync = runInNewContext(code + '\nsyncAddButtons', {
    catalog: [item],
    getMaxQuantity: maxQuantity,
    cartQuantityFor: () => quantity,
    document: { querySelectorAll: (selector) => selector === '[data-add-to-cart]' ? [button] : [feedback] }
  });
  sync();
  assert.equal(button.disabled, false);
  assert.equal(label.textContent, 'Add to cart');
  quantity = 1;
  sync(item.id);
  assert.equal(button.disabled, true);
  assert.equal(label.textContent, 'In your cart');
  assert.equal(button.title, 'This pair is already in your cart');
  assert.match(attributes['aria-label'], /this pair is already in your cart/);
  assert.equal(feedback.textContent, 'In your cart. Availability is confirmed at checkout.');
  quantity = 0;
  sync(item.id);
  assert.equal(button.disabled, false);
  assert.equal(label.textContent, 'Add to cart');
});

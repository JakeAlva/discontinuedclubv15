import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../assets/style.css', import.meta.url), 'utf8');

test('successful cart additions trigger localized purchase feedback', () => {
  assert.match(app, /function celebrateCartAddition\(button\)/);
  assert.match(app, /celebrateCartAddition\(addButton\)/);
  assert.match(app, /className = 'purchase-confetti'/);
  assert.match(styles, /\.purchase-confetti \{ position: fixed;/);
  assert.match(styles, /@keyframes purchase-confetti-pop/);
});

test('adding an item acknowledges the cart without forcing the drawer open', () => {
  assert.match(app, /function acknowledgeCartAddition\(\)/);
  assert.match(app, /data-cart-nudge/);
  assert.match(app, /acknowledgeCartAddition\(\)/);
  assert.doesNotMatch(app, /setTimeout\(openCart/);
  assert.match(styles, /\.cart-trigger\.cart-attention/);
  assert.match(styles, /@keyframes cart-trigger-shake/);
});

test('the add confirmation exposes the live free-shipping progress', () => {
  assert.match(app, /class="cart-nudge" data-cart-nudge/);
  assert.match(app, /data-shipping-progress-copy/);
  assert.match(app, /data-shipping-progress-amount/);
  assert.match(app, /data-shipping-progress-bar/);
  assert.match(app, /Add ' \+ formatMoney\(shipping\.remaining\) \+ ' more/);
});

test('purchase motion honors the reduced motion preference', () => {
  assert.match(app, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.purchase-confetti \{ display: none; \}/);
});

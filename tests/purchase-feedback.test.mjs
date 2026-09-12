import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../assets/style.css', import.meta.url), 'utf8');

test('successful cart additions trigger localized purchase feedback', () => {
  assert.match(app, /function celebrateCartAddition\(button\)/);
  assert.match(app, /if \(result\.added > 0\) celebrateCartAddition\(addButton\)/);
  assert.match(app, /className = 'purchase-confetti'/);
  assert.match(styles, /\.purchase-confetti \{ position: fixed;/);
  assert.match(styles, /@keyframes purchase-confetti-pop/);
});

test('purchase motion honors the reduced motion preference', () => {
  assert.match(app, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.purchase-confetti \{ display: none; \}/);
});

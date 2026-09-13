import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../assets/style.css', import.meta.url), 'utf8');

test('the first-visit store finder uses real current product imagery', () => {
  assert.match(app, /Every image below is a real product from current inventory/);
  assert.match(app, /const spotlight = catalog\.find/);
  assert.match(app, /listingImagePath\(spotlight, 'branded', false\)/);
  assert.match(app, /class="finder-option-media"/);
  assert.match(styles, /\.finder-option-media img/);
  assert.match(app, /const spotlightIds = \{ care: '406760474283' \}/);
});

test('the richer finder only loads when it is meant to open', () => {
  assert.match(app, /const shouldOpen = params\.get\('showFinder'\) === '1'/);
  assert.match(app, /if \(!shouldOpen\) return;/);
  assert.match(app, /document\.body\.classList\.add\('finder-open'\)/);
  assert.match(styles, /body\.finder-open \{ overflow: hidden; \}/);
});

test('finder departments keep distinct campaign accents and mobile layouts', () => {
  assert.match(styles, /\.finder-option\[data-category="apparel"\]::before/);
  assert.match(styles, /\.finder-option\[data-category="collectibles"\]::before/);
  assert.match(styles, /\.finder-option\[data-category="care"\]::before/);
  assert.match(styles, /grid-template-columns: 96px minmax\(0, 1fr\)/);
});

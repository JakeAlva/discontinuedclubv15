import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('entry guide is removed without removing search, navigation, or cart controls', async () => {
  const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../assets/style.css', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /setupFinder|openFinder|closeFinder|finderMarkup|showFinder|dc_store_finder_seen|Where should we take you/);
  assert.doesNotMatch(styles, /brand-finder|finder-open|finder-option/);
  for (const control of ['setupHeaderSearch()', 'closeMenu()', 'closeCart()']) assert.ok(app.includes(control));
});

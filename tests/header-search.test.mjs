import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../assets/style.css', import.meta.url), 'utf8');
const matchingCode = app.slice(app.indexOf('  function normalizeSearch('), app.indexOf('  function closeHeaderSearch('));
const matches = vm.runInNewContext(matchingCode + '\nmatchesProductSearch');

test('header search opens a labeled native dialog instead of navigating', () => {
  assert.match(app, /<button[^>]+id="store-search-trigger"[^>]+aria-haspopup="dialog"[^>]+aria-controls="store-search-dialog"/);
  assert.match(app, /<dialog[^>]+id="store-search-dialog" aria-labelledby="store-search-title"/);
  assert.match(app, /dialog\.showModal\(\)/);
  assert.match(app, /input\.focus\(\{ preventScroll: true \}\)/);
  assert.match(app, /searchTrigger\.focus\(\{ preventScroll: true \}\)/);
  assert.match(app, /dialog\.addEventListener\('keydown', function \(event\) \{\s+if \(event\.key === 'Escape'\) \{\s+event\.preventDefault\(\);\s+closeHeaderSearch\(\);/);
  assert.match(app, /event\.shiftKey && document\.activeElement === first/);
  assert.match(app, /!event\.shiftKey && document\.activeElement === last/);
  assert.match(app, /setupHeaderSearch\(\);/);
  assert.doesNotMatch(app, /<a[^>]+aria-label="Search the store"/);
});

test('product matching tolerates accents, case, extra space, and reordered words', () => {
  assert.equal(matches('Pokemon Mega Evolution booster pack', '  PACK   pokémon  '), true);
  assert.equal(matches('Red Bull Curuba Elderflower 4 Pack', 'RED curuba'), true);
  assert.equal(matches('Red Bull Curuba Elderflower 4 Pack', 'curuba blueberry'), false);
  assert.equal(matches('Red Bull Curuba Elderflower 4 Pack', ''), true);
  assert.equal(matches('', 'curuba'), false);
  assert.equal(matches('Product', '<script>'), false);
});

test('inline and full catalog search use the same matching rules', () => {
  assert.match(app, /matchesProductSearch\(item\.name \+ ' ' \+ item\.detail \+ ' ' \+ categoryLabels\[item\.category\], query\)/);
  assert.match(app, /matchesProductSearch\(card\.dataset\.search \|\| '', query\)/);
  assert.match(app, /input\.addEventListener\('input', update\)/);
  assert.match(app, /matches\.slice\(0, 6\)/);
  assert.match(app, /escapeHtml\(item\.name\)/);
  assert.match(app, /empty\.hidden = matches\.length > 0/);
  assert.match(app, /all\.disabled = matches\.length === 0/);
});

test('search remains bounded on narrow and short viewports', () => {
  assert.match(styles, /\.header-search \{[^}]+max-height: calc\(100dvh - 48px\)/);
  assert.match(styles, /\.header-search \{[^}]+overflow: auto/);
  assert.match(styles, /\.header-search-field input \{[^}]+font-size: 16px/);
  assert.match(styles, /\.header-search-copy strong \{[^}]+overflow-wrap: anywhere/);
});

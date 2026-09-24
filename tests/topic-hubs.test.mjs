import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from '../scripts/journal-data.mjs';

const root = resolve(import.meta.dirname, '..');
const hubs = [
  ['discontinued-monster-energy-flavors.html', reports.filter((report) => report.brand === 'Monster Energy').length],
  ['discontinued-red-bull-flavors.html', reports.filter((report) => report.brand === 'Red Bull').length],
  ['discontinued-energy-drink-flavors-2026.html', reports.filter((report) => ['Monster Energy', 'Red Bull', 'Alani Nu', 'CELSIUS'].includes(report.brand)).length]
];

test('topic hubs are indexable, structured, and connected to the journal', async () => {
  const sitemap = await readFile(resolve(root, 'sitemap-pages.xml'), 'utf8');
  const blog = await readFile(resolve(root, 'blog.html'), 'utf8');

  for (const [file, count] of hubs) {
    const html = await readFile(resolve(root, file), 'utf8');
    assert.ok(html.includes(`<link rel="canonical" href="https://discontinuedclub.com/${file}">`));
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/);
    assert.match(html, /"@type":"CollectionPage"/);
    assert.match(html, /"@type":"ItemList"/);
    assert.ok(html.includes(`"numberOfItems":${count}`));
    assert.match(html, /journal\/is-[^"<]+\.html/);
    assert.ok(sitemap.includes(`https://discontinuedclub.com/${file}`));
    assert.ok(blog.includes(file));
  }
});

test('topic hub report cards keep confirmed and rumor statuses visibly distinct', async () => {
  const monster = await readFile(resolve(root, 'discontinued-monster-energy-flavors.html'), 'utf8');
  assert.match(monster, /Confirmed U\.S\. discontinuations/);
  assert.match(monster, /Rumored next, not confirmed/);
  assert.match(monster, /status-discontinued/);
  assert.match(monster, /status-rumor/);
  assert.match(monster, /Reserve Orange Dreamsicle/);
});

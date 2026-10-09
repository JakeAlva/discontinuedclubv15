import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from '../scripts/journal-data.mjs';
import { monsterArchive } from '../scripts/monster-archive.mjs';

const root = resolve(import.meta.dirname, '..');
const statusReports = reports.filter((report) => report.statusKey !== 'launch');
const hubs = [
  ['discontinued-monster-energy-flavors.html', statusReports.filter((report) => report.brand === 'Monster Energy').length],
  ['discontinued-red-bull-flavors.html', statusReports.filter((report) => report.brand === 'Red Bull').length],
  ['discontinued-energy-drink-flavors-2026.html', statusReports.filter((report) => ['Monster Energy', 'Red Bull', 'Alani Nu', 'CELSIUS'].includes(report.brand)).length]
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
    const isMonster = file === 'discontinued-monster-energy-flavors.html';
    assert.ok(html.includes(`"numberOfItems":${isMonster ? monsterArchive.length : count}`));
    assert.equal([...html.matchAll(isMonster ? /data-archive-entry/g : /class="topic-report-card"/g)].length, isMonster ? monsterArchive.length : count);
    assert.match(html, /journal\/is-[^"<]+\.html/);
    assert.ok(sitemap.includes(`https://discontinuedclub.com/${file}`));
    assert.ok(blog.includes(file));
  }
});

test('Monster timeline keeps completed and reported future departures visibly distinct', async () => {
  const monster = await readFile(resolve(root, 'discontinued-monster-energy-flavors.html'), 'utf8');
  assert.match(monster, /U\.S\. discontinued/);
  assert.match(monster, /Reported exit before 2027/);
  assert.match(monster, /monster-evidence-discontinued/);
  assert.match(monster, /monster-evidence-watch/);
  assert.match(monster, /Reserve Orange Dreamsicle/);
});

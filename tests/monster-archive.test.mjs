import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { monsterArchive, monsterArchiveSources, monsterArchiveStatuses } from '../scripts/monster-archive.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { catalog } from '../lib/store-catalog.mjs';
import { soldItems } from '../scripts/sold-data.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');

test('Monster archive records have unique anchors, sourced dates and valid article links', () => {
  assert.ok(monsterArchive.length >= 80);
  assert.equal(new Set(monsterArchive.map((item) => item.id)).size, monsterArchive.length);
  for (const item of monsterArchive) {
    assert.ok(monsterArchiveStatuses[item.status]);
    assert.ok(item.dateLabel.includes(String(item.year)));
    assert.ok(item.sources.length > 0);
    for (const source of item.sources) assert.ok(monsterArchiveSources[source], source);
    if (item.article) assert.ok(reports.some((report) => report.slug === item.article), item.article);
  }
  assert.equal(monsterArchive.filter((item) => item.status === 'watch').length, 6);
  assert.ok(monsterArchive.some((item) => item.status === 'historical'));
  assert.ok(monsterArchive.some((item) => item.status === 'returned'));
});

test('timeline is crawlable without scripts and explicitly qualifies incomplete historical evidence', async () => {
  const html = await read('dist/discontinued-monster-energy-flavors.html');
  assert.equal((html.match(/data-archive-entry/g) || []).length, monsterArchive.length);
  assert.match(html, /not a claim that every regional size or formula/);
  assert.match(html, /documented-by year is not an invented launch or retirement date/);
  assert.match(html, /data-archive-filters hidden/);
  assert.match(html, /assets\/monster-archive.js\?v=90/);
  assert.match(await read('sitemap-pages.xml'), /discontinued-monster-energy-flavors.html<\/loc><lastmod>2026-10-09/);
});

test('Green Tea coverage has one canonical article and a permanent redirect from the duplicate', async () => {
  const previous = 'monster-rehab-green-tea-discontinuation-rumor-september-2026';
  const current = 'is-monster-rehab-green-tea-being-discontinued';
  assert.ok(!reports.some((report) => report.slug === previous));
  await assert.rejects(access(resolve(root, `dist/journal/${previous}.html`)));
  assert.ok((await read('_redirects')).includes(`/journal/${previous}.html  /journal/${current}.html  301`));
  const sitemap = await read('sitemap-journal.xml');
  assert.ok(!sitemap.includes(previous));
  assert.match(sitemap, /is-monster-rehab-green-tea-being-discontinued.html<\/loc><lastmod>2026-10-09/);
});

test('every Monster article links to the archive and modified dates retain original publication dates', async () => {
  for (const report of reports.filter((item) => item.brand === 'Monster Energy')) {
    const html = await read(`dist/journal/${report.slug}.html`);
    assert.match(html, /href="discontinued-monster-energy-flavors.html"/);
    if (report.modifiedDate === '2026-10-09') {
      const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
      assert.notEqual(graph[0].datePublished, graph[0].dateModified);
      assert.match(html, /Updated October 9, 2026/);
    }
  }
});

test('built shop and sold grids expose all product links before JavaScript runs', async () => {
  const shop = await read('dist/out-now.html');
  const sold = await read('dist/sold-archive.html');
  assert.equal((shop.match(/class="product-card"/g) || []).length, catalog.length);
  assert.equal((sold.match(/class="product-card sold-card"/g) || []).length, soldItems.length);
  for (const item of catalog) assert.ok(shop.includes(`-${item.id}.html`));
  assert.ok(!shop.includes('data-shop-catalog></div>'));
  assert.ok(!sold.includes('data-sold-catalog></div>'));
});

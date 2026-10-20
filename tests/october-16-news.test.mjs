import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import { sweetLightningKfcReport as dew } from '../scripts/sweet-lightning-kfc-report.mjs';
import { corePowerBananaReturnReport as banana } from '../scripts/core-power-banana-return-report.mjs';
import { milkBarEmpanadaReport as dessert } from '../scripts/milk-bar-empanada-report.mjs';
import { drinkFlavorWatchReport as watch } from '../scripts/drink-flavor-watch-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [dew, banana, dessert];
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('October 16 reports are crawlable, searchable, illustrated and dated correctly', async () => {
  const sitemap = new XMLParser().parse(await read('dist/sitemap-journal.xml')).urlset.url;
  const index = JSON.parse(await read('dist/assets/journal-index.json'));
  const files = (await readdir(resolve(root, 'dist'))).filter((name) => /^blog(?:-page-\d+)?\.html$/.test(name));
  const library = (await Promise.all(files.map((name) => read(`dist/${name}`)))).join('');
  for (const report of additions) {
    assert.ok(reports.includes(report));
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.equal(sitemap.filter((item) => item.loc === canonical).length, 1);
    assert.equal(sitemap.find((item) => item.loc === canonical).lastmod, '2026-10-16');
    assert.ok(library.includes(`href="${href}"`));
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.match(html, /Published October 16, 2026/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) {
      assert.ok(reports.some((item) => item.slug === slug), slug);
      assert.ok(html.includes(`href="journal/${slug}.html"`));
    }
    const meta = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(meta.width, report.imageWidth);
    assert.equal(meta.height, report.imageHeight);
    assert.ok(meta.width >= 800 && meta.height >= 800);
    assert.match(report.disclosure, /not sponsored/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-16');
    assert.equal(graph[0].dateModified, '2026-10-16');
    assert.equal(graph[0].image, `https://discontinuedclub.com/${report.image}`);
    assert.equal(graph[0].mainEntityOfPage, canonical);
    assert.ok(!graph.some((item) => ['Product', 'Offer'].includes(item['@type'])));
    for (const brand of report.brands) {
      assert.ok(selectReports(index, { q: report.product, brand, sort: 'newest', page: 1 }).items.some((item) => item.slug === report.slug));
    }
  }
});

test('October 16 reporting separates future changes, confirmed returns and promotion dates', () => {
  assert.equal(dew.statusKey, 'rumor');
  assert.match(dew.answer, /does not name Sweet Lightning/);
  assert.match(body(dew), /editorial inference/);
  assert.match(body(dew), /January 2027/);
  assert.match(dew.caption, /2019.*historical/);
  assert.equal(banana.statusKey, 'launch');
  assert.match(banana.answer, /January 2027/);
  assert.match(banana.answer, /replace Strawberry Banana/);
  assert.match(body(banana), /not established a last production date/);
  assert.match(dessert.answer, /\$3.49/);
  assert.match(body(dessert), /October 28 date is the empanada reward window, not a confirmed last day/);
  assert.match(body(dessert), /February 20, 2025/);
});

test('the earlier Core Power roundup points to confirmation without redating its original publication', async () => {
  assert.equal(watch.checkedDate, '2026-09-23');
  assert.equal(watch.modifiedDate, '2026-10-16');
  assert.match(watch.answer, /now has official confirmation/);
  assert.ok(body(watch).includes(`journal/${banana.slug}.html`));
  const html = await read(`dist/journal/${watch.slug}.html`);
  assert.match(html, /Published September 23, 2026/);
  assert.match(html, /Updated October 16, 2026/);
  assert.ok(html.includes(`href="journal/${banana.slug}.html"`));
});

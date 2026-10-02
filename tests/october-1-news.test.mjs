import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { reports } from '../scripts/journal-data.mjs';
import { dunkinHalloween2026Report as dunkin } from '../scripts/dunkin-halloween-2026-report.mjs';
import { fantaGhostFaceReport as fanta } from '../scripts/fanta-ghost-face-report.mjs';
import { cheetosPhantomHeatReport as cheetos } from '../scripts/cheetos-phantom-heat-report.mjs';
import { selectReports } from '../assets/journal-library.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const additions = [dunkin, fanta, cheetos];
const copy = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('October 1 reporting separates releases, recipes and promotion dates', () => {
  assert.match(dunkin.answer, /September 30/);
  assert.match(copy(dunkin), /former has zero total sugars, while the latter has sugar/);
  assert.match(copy(fanta), /12-fluid-ounce U.S. can/);
  assert.match(copy(fanta), /game deadline/);
  assert.match(copy(fanta), /not a stated production cutoff/);
  assert.match(cheetos.answer, /August 31, 2026/);
  assert.match(copy(cheetos), /manufacturer descriptions, not our verdict/);
  for (const report of additions) {
    assert.equal(report.checkedDate, '2026-10-01');
    assert.equal(report.statusKey, 'launch');
    assert.equal(report.shop, undefined);
    assert.ok(report.sources.length >= 3);
    assert.ok(report.statusParagraphs && report.buyerParagraphs && report.disclosure);
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
  }
});

test('new reports have official images, canonical pages and crawlable discovery links', async () => {
  for (const report of additions) {
    const href = `journal/${report.slug}.html`;
    for (const file of ['blog.html', 'sitemap-journal.xml']) {
      assert.ok((await read(file)).includes(href), `${file}: ${href}`);
    }
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans|U.S.-market definition of discontinued/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0]['@type'], 'Article');
    assert.equal(graph[0].datePublished, '2026-10-01');
    assert.equal(graph[0].headline, report.title);
    assert.equal(graph[0].image, `https://discontinuedclub.com/${report.image}`);
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.equal(image.format, 'webp');
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    assert.ok(image.width >= 1000 && image.height >= 1000);
    assert.match(report.caption, /official/);
    for (const source of report.sources) assert.ok(html.includes(source.url));
  }
});

test('October news is searchable and pagination exposes the expanding archive', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const base = { q: '', brand: '', status: '', sort: 'newest', page: 1 };
  const newest = selectReports(index, base);
  assert.equal(newest.pages, Math.ceil(reports.length / 6));
  for (const report of additions) {
    assert.ok(newest.items.some((item) => item.slug === report.slug));
    assert.equal(selectReports(index, { ...base, q: report.product, brand: report.brand, status: 'launch' }).items[0].slug, report.slug);
    assert.ok(!(await read('discontinued-energy-drink-flavors-2026.html')).includes(report.slug));
  }
  assert.ok((await read('sitemap-pages.xml')).includes(`blog-page-${newest.pages}.html`));
});

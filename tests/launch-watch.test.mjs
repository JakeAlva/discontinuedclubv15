import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports, readState } from '../assets/journal-library.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const launchReports = reports.filter((report) => ['new-soda-rumors-coca-cola-pepsi-mr-pibb', 'core-power-banana-powerade-watermelon-new-drink-flavors'].includes(report.slug));

test('launch-watch articles distinguish reported concepts from verified existing products', () => {
  assert.equal(launchReports.length, 2);
  const [sodas, drinks] = launchReports;
  assert.match(sodas.answer, /not verified official U.S. launch announcements/);
  assert.match(sodas.answer, /unconfirmed 2027/);
  assert.ok(sodas.sections.every((section) => section.paragraphs.length >= 2));
  assert.match(drinks.answer, /Sprite Chill Strawberry Kiwi already has a documented U.S. release history/);
  assert.match(drinks.sections.find((section) => section.id === 'powerade-watermelon').paragraphs.join(' '), /Power Water/);
  assert.equal(drinks.evidenceImages, undefined);
  assert.deepEqual(reports.filter((report) => report.featured), [sodas]);
  for (const report of launchReports) {
    assert.equal(report.checkedDate, '2026-09-23');
    assert.equal(report.shop, undefined);
    assert.ok(report.disclosure.includes('U.S.'));
  }
});

test('roundups are searchable under each covered brand and the new launch status', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const base = { q: '', brand: '', status: 'launch', sort: 'newest', page: 1 };
  assert.equal(readState(new URL('https://discontinuedclub.com/blog.html?status=launch')).status, 'launch');
  assert.equal(selectReports(index, base).total, reports.filter((report) => report.statusKey === 'launch').length);
  for (const report of launchReports) {
    for (const brand of report.brands) {
      assert.ok(selectReports(index, { ...base, brand }).items.some((item) => item.slug === report.slug), brand);
    }
  }
  assert.equal(selectReports(index, { ...base, q: 'pineapple coconut' }).total, 1);
  assert.equal(selectReports(index, { ...base, brand: 'Monster Energy' }).total, 0);
});

test('new articles have crawlable discovery, accurate schema, and no sales or discontinued boilerplate', async () => {
  for (const report of launchReports) {
    const href = `journal/${report.slug}.html`;
    for (const file of ['blog.html', 'sitemap-journal.xml']) assert.ok((await read(file)).includes(href), file);
    const html = await read(`dist/${href}`);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans|U.S.-market definition of discontinued/);
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.ok(html.includes(`href="https://discontinuedclub.com/${href}"`));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-09-23');
    assert.equal(graph[0].headline, report.title);
    assert.ok(!graph.some((node) => ['Product', 'Offer'].includes(node['@type'])));
    assert.ok(!(await read('discontinued-energy-drink-flavors-2026.html')).includes(href));
    for (const source of report.sources) assert.ok(html.includes(source.url));
  }
});

test('launch-watch covers use labeled editorial artwork, never phone photos or screenshot galleries', async () => {
  for (const report of launchReports) {
    const metadata = await sharp(resolve(root, report.image)).metadata();
    assert.equal(metadata.format, 'png');
    assert.ok(metadata.width >= 1200);
    assert.equal(metadata.width, metadata.height);
    assert.equal(metadata.exif, undefined);
    assert.equal(metadata.iptc, undefined);
    assert.match(report.caption, /AI-assisted editorial reconstruction/);
    assert.match(report.caption, /not official photography/i);
    const html = await read(`dist/journal/${report.slug}.html`);
    assert.doesNotMatch(html, /article-evidence-gallery|id="evidence-images"/);
    const renderedImages = [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(renderedImages.includes(report.image));
    assert.ok(renderedImages.every((src) => !/reel-evidence|new-soda-rumors-september-2026\.jpg/.test(src)));
  }
});

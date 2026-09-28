import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { c4AllHoppedUpReport as c4 } from '../scripts/c4-all-hopped-up-report.mjs';
import { alaniVoodooVanillaReport as alani } from '../scripts/alani-voodoo-vanilla-report.mjs';
import { wonka2026Report as wonka } from '../scripts/wonka-2026-report.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const additions = [c4, alani, wonka];
const copy = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('September 28 news retains market, price and availability caveats', () => {
  assert.match(copy(c4), /\$14\.99/);
  assert.match(copy(c4), /\$27\.99/);
  assert.match(copy(c4), /could not resolve the difference/);
  assert.match(copy(c4), /September 30/);
  assert.match(alani.answer, /not verified a discontinuation notice or restock date/);
  assert.match(copy(alani), /does not list Voodoo Vanilla as a third flavor/);
  assert.match(copy(wonka), /not a verified reissue/);
  assert.match(wonka.answer, /November 2026/);
  for (const report of additions) {
    assert.equal(report.checkedDate, '2026-09-28');
    assert.equal(report.statusKey, 'launch');
    assert.equal(report.shop, undefined);
    assert.ok(report.sources.length >= 2);
    assert.ok(report.statusParagraphs && report.buyerParagraphs && report.disclosure);
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
  }
});

test('new articles have official images, crawlable links and consistent editorial metadata', async () => {
  for (const report of additions) {
    const href = `journal/${report.slug}.html`;
    for (const file of ['index.html', 'blog.html', 'sitemap-journal.xml']) {
      assert.ok((await read(file)).includes(href), `${file}: ${href}`);
    }
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`href="https://discontinuedclub.com/${href}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans|U.S.-market definition of discontinued/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0]['@type'], 'Article');
    assert.equal(graph[0].headline, report.title);
    assert.equal(graph[0].datePublished, '2026-09-28');
    assert.equal(graph[0].dateModified, '2026-09-28');
    assert.equal(graph[0].image, `https://discontinuedclub.com/${report.image}`);
    assert.equal(graph[0].about['@type'], 'Thing');
    assert.ok(!JSON.stringify(graph).includes('"Offer"'));
    for (const source of report.sources) assert.ok(html.includes(source.url));
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.equal(image.format, 'webp');
    assert.ok(image.width >= 768 && image.height >= 768);
    assert.match(report.caption, /official/);
  }
});

test('new brands and topics are searchable without implying they are discontinued', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const base = { q: '', brand: '', status: 'launch', sort: 'newest', page: 1 };
  const latest = selectReports(index, base).items.map((item) => item.slug);
  for (const report of additions) {
    assert.ok(latest.includes(report.slug));
    assert.equal(selectReports(index, { ...base, brand: report.brand }).items[0].slug, report.slug);
    assert.ok(!(await read('discontinued-energy-drink-flavors-2026.html')).includes(report.slug));
  }
  assert.equal(selectReports(index, { ...base, q: 'hopped' }).items[0].slug, c4.slug);
  assert.equal(selectReports(index, { ...base, q: 'voodoo vanilla' }).items[0].slug, alani.slug);
  assert.equal(selectReports(index, { ...base, q: 'wonka' }).items[0].slug, wonka.slug);
});

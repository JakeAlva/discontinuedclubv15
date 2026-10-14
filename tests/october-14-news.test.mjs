import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { cardMarkup, selectReports } from '../assets/journal-library.mjs';
import { prodaProteinSodaReport as proda } from '../scripts/proda-protein-soda-report.mjs';
import { littleDebbieHoliday2026Report as debbie } from '../scripts/little-debbie-holiday-2026-report.mjs';
import { olipopPomegranateSparkleReport as olipop } from '../scripts/olipop-pomegranate-sparkle-report.mjs';
import { dunkinBerryBattieReport as dunkin } from '../scripts/dunkin-berry-battie-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [proda, debbie, olipop, dunkin];
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('four October 13/14 edition stories are indexable, sourced, illustrated and linked', async () => {
  const sitemap = new XMLParser().parse(await read('dist/sitemap-journal.xml')).urlset.url;
  const library = await read('dist/blog.html');
  for (const report of additions) {
    assert.ok(reports.includes(report));
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.equal(sitemap.filter((row) => row.loc === canonical).length, 1);
    assert.ok(library.includes(`href="${href}"`));
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug));
    const meta = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(meta.width, report.imageWidth);
    assert.equal(meta.height, report.imageHeight);
    assert.ok(meta.width >= 450 && meta.height >= 600);
    assert.ok(report.imageCredit);
    assert.match(report.disclosure, /not sponsored/);
    assert.match(report.buyerParagraphs.join(' '), /does not currently sell/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-14');
    assert.equal(graph[0].dateModified, '2026-10-14');
    assert.equal(graph[0].headline, report.title);
    assert.equal(graph[0].mainEntityOfPage, canonical);
    assert.equal(graph[1].mainEntity.length, report.faq.length);
    assert.match(html, /Published October 14, 2026/);
    assert.doesNotMatch(html, /Published October 13, 2026/);
    assert.ok(html.includes(`datetime="${report.editionDate}"`));
  }
});

test('editions provide a two-day schedule without backdating publication metadata', async () => {
  const index = JSON.parse(await read('dist/assets/journal-index.json'));
  assert.deepEqual(additions.map((r) => r.editionDate).sort(), ['2026-10-13', '2026-10-13', '2026-10-14', '2026-10-14']);
  const newest = selectReports(index, { q: '', sort: 'newest', page: 1 }).items;
  assert.deepEqual(newest.slice(0, 4).map((r) => r.slug), [dunkin.slug, olipop.slug, debbie.slug, proda.slug]);
  for (const report of additions) {
    const item = index.find((r) => r.slug === report.slug);
    assert.equal(item.date, '2026-10-14');
    assert.equal(item.editionDate, report.editionDate);
    assert.match(cardMarkup(item), /2026 edition/);
    assert.ok(selectReports(index, { q: report.product, brand: report.brand, sort: 'newest', page: 1 }).items.some((r) => r.slug === report.slug));
  }
  const home = await read('dist/index.html');
  for (const report of [dunkin, olipop, debbie]) assert.ok(home.includes(`journal/${report.slug}.html`));
});

test('the reports keep product, promotion and evidence distinctions explicit', () => {
  assert.match(proda.answer, /not an announcement that the first cans go on sale/);
  assert.match(body(proda), /subscription and a one-time order/);
  assert.match(body(debbie), /20 muffins does not mean 20 individually wrapped/);
  assert.match(body(debbie), /Chocolate Chip Mini Muffins/);
  assert.match(body(olipop), /30 calories and 2 grams/);
  assert.match(body(olipop), /35 calories and 4 grams/);
  assert.match(body(olipop), /cannot determine/);
  assert.match(dunkin.answerHeading, /October 14.*October 16/);
  assert.match(body(dunkin), /while supplies last at participating U.S. locations/);
  assert.ok(additions.every((r) => r.statusKey === 'launch'));
});

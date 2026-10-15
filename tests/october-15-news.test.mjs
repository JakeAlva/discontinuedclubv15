import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { cardMarkup, selectReports } from '../assets/journal-library.mjs';
import { hintTreatYourselfReport as hint } from '../scripts/hint-treat-yourself-report.mjs';
import { wingstopWickedPunchReport as wingstop } from '../scripts/wingstop-wicked-punch-report.mjs';
import { poppiSourAppleReport as poppi } from '../scripts/poppi-sour-apple-report.mjs';
import { dotsChipotleHoneyReport as dots } from '../scripts/dots-chipotle-honey-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [hint, wingstop, poppi, dots];
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('October 14/15 editions are linked, indexable, sourced and illustrated', async () => {
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
    assert.match(html, /Published October 15, 2026/);
    assert.doesNotMatch(html, /Published October 14, 2026/);
    assert.ok(html.includes(`datetime="${report.editionDate}"`));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-15');
    assert.equal(graph[0].dateModified, '2026-10-15');
    assert.equal(graph[0].mainEntityOfPage, canonical);
    assert.equal(graph[0].image, `https://discontinuedclub.com/${report.image}`);
    assert.equal(graph[1].mainEntity.length, report.faq.length);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug));
    const meta = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(meta.width, report.imageWidth);
    assert.equal(meta.height, report.imageHeight);
    assert.ok(meta.width >= 600 && meta.height >= 900);
    assert.ok(report.imageCredit);
    assert.match(report.disclosure, /not sponsored/);
    assert.match(report.buyerParagraphs.join(' '), /does not currently sell/);
  }
});

test('two articles belong to each edition without backdating their publication', async () => {
  assert.deepEqual(additions.map((report) => report.editionDate).sort(), ['2026-10-14', '2026-10-14', '2026-10-15', '2026-10-15']);
  const index = JSON.parse(await read('dist/assets/journal-index.json'));
  const current = index.filter((item) => additions.some((report) => report.slug === item.slug));
  assert.deepEqual(selectReports(current, { sort: 'newest', page: 1 }).items.map((item) => item.slug), [dots.slug, poppi.slug, hint.slug, wingstop.slug]);
  for (const report of additions) {
    const item = index.find((entry) => entry.slug === report.slug);
    assert.equal(item.date, '2026-10-15');
    assert.equal(item.editionDate, report.editionDate);
    assert.match(cardMarkup(item), /2026 edition/);
    assert.ok(selectReports(index, { q: report.product, brand: report.brand, sort: 'newest', page: 1 }).items.some((entry) => entry.slug === report.slug));
  }
  const home = await read('dist/index.html');
  for (const report of [hint, poppi, dots]) assert.ok(home.includes(`journal/${report.slug}.html`));
  const pages = (await readdir(resolve(root, 'dist'))).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  const library = (await Promise.all(pages.map((file) => read(`dist/${file}`)))).join('');
  for (const report of reports) assert.ok(library.includes(`journal/${report.slug}.html`), `${report.slug} remains crawlable through pagination`);
});

test('the new reports preserve timing, purchase-option and seasonal-status distinctions', () => {
  assert.match(body(hint), /\$22\.99 for a one-time order and \$18\.99 with a subscription/);
  assert.match(body(hint), /not our tasting notes/);
  assert.match(body(wingstop), /October 23.*October 27.*November 5/);
  assert.match(body(wingstop), /participating locations, while supplies last/);
  assert.match(wingstop.answer, /both its member-access date and wider launch are still ahead/);
  assert.match(poppi.answerHeading, /not confirmed discontinued/);
  assert.match(body(poppi), /through the end of October, while supplies last/);
  assert.match(body(poppi), /not a zero-sugar drink/);
  assert.match(body(dots), /16-ounce bag.*5-ounce bag/);
  assert.match(body(dots), /without a fixed final sale date/);
  assert.ok(additions.every((report) => report.statusKey === 'launch' && !report.shop));
});

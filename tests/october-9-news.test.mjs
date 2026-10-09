import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import { sevenUpShirleyTempleReport as sevenUp } from '../scripts/seven-up-shirley-temple-report.mjs';
import { bauduccoSkippyReport as bauducco } from '../scripts/bauducco-skippy-report.mjs';
import { utzChickenDippingSauceReport as utz } from '../scripts/utz-chicken-dipping-sauce-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [sevenUp, bauducco, utz];
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('October 9 articles are discoverable, indexable and use credited full-size product images', async () => {
  const sitemap = new XMLParser().parse(await read('dist/sitemap-journal.xml')).urlset.url.map((item) => item.loc);
  for (const report of additions) {
    assert.ok(reports.includes(report));
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.equal(sitemap.filter((url) => url === canonical).length, 1);
    for (const file of ['dist/index.html', 'dist/blog.html']) assert.ok((await read(file)).includes(`href="${href}"`), file);
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-09');
    assert.equal(graph[0].dateModified, '2026-10-09');
    assert.equal(graph[0].headline, report.title);
    assert.equal(graph[0].mainEntityOfPage, canonical);
    assert.equal(graph[0].image, `https://discontinuedclub.com/${report.image}`);
    assert.equal(graph[1].mainEntity.length, report.faq.length);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug));
    const image = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    assert.ok(image.width >= 1200);
    assert.ok(report.imageCredit);
    assert.equal(report.shop, undefined);
    assert.match(report.buyerParagraphs.join(' '), /does not currently sell/);
    assert.match(report.disclosure, /not sponsored/);
  }
});

test('October 9 reporting preserves release, packaging and stock distinctions', () => {
  assert.match(sevenUp.answer, /2026 holiday plans/);
  assert.match(sevenUp.answer, /20-ounce package for 2027/);
  assert.match(sevenUp.statusParagraphs.join(' '), /not found a precise 2026 first-sale date/);
  assert.match(body(sevenUp), /out of stock/);
  assert.match(bauducco.answer, /2025 range/);
  assert.match(body(bauducco), /title does not name SKIPPY/);
  assert.match(body(bauducco), /not transferring that ingredient panel/);
  assert.match(bauducco.caption, /promotional/);
  assert.match(utz.answer, /permanent addition/);
  assert.match(body(utz), /7.5 ounces.*7.75 ounces/);
  assert.match(body(utz), /14-count case/);
  assert.match(body(utz), /not found a named restaurant partnership/);
});

test('the journal indexes the new products and the SKIPPY partner brand', async () => {
  const index = JSON.parse(await read('dist/assets/journal-index.json'));
  for (const report of additions) {
    const result = selectReports(index, { q: report.product, brand: report.brand, status: 'launch', sort: 'newest', page: 1 });
    assert.ok(result.items.some((item) => item.slug === report.slug));
  }
  const partner = selectReports(index, { q: 'Chocottone', brand: 'SKIPPY', sort: 'newest', page: 1 });
  assert.ok(partner.items.some((item) => item.slug === bauducco.slug));
});

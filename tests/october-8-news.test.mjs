import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import { cocaColaPrebioticReport as coke } from '../scripts/coca-cola-prebiotic-report.mjs';
import { bloomStrawberryShortieReport as bloom } from '../scripts/bloom-strawberry-shortie-report.mjs';
import { smoodCandyDatesReport as smood } from '../scripts/smood-candy-dates-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [coke, bloom, smood];
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('October 8 reports have crawlable links, accurate dates and real high-resolution packshots', async () => {
  const sitemap = new XMLParser().parse(await read('dist/sitemap-journal.xml')).urlset.url.map((item) => item.loc);
  for (const report of additions) {
    assert.ok(reports.includes(report));
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.equal(sitemap.filter((url) => url === canonical).length, 1);
    assert.ok((await read('dist/blog.html')).includes(`href="${href}"`), 'October 8 reports remain discoverable after the homepage rotates');
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(schema[0].datePublished, '2026-10-08');
    assert.equal(schema[0].dateModified, '2026-10-08');
    assert.equal(schema[0].headline, report.title);
    assert.equal(schema[0].mainEntityOfPage, canonical);
    assert.equal(schema[0].image, `https://discontinuedclub.com/${report.image}`);
    assert.equal(schema[1].mainEntity.length, report.faq.length);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug));
    const dimensions = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(dimensions.width, report.imageWidth);
    assert.equal(dimensions.height, report.imageHeight);
    assert.ok(dimensions.width >= 1200);
    assert.ok(report.imageCredit);
    assert.equal(report.shop, undefined);
    assert.match(report.buyerParagraphs.join(' '), /does not currently sell/);
    assert.match(report.disclosure, /not sponsored/);
  }
});

test('October 8 articles distinguish regions, launch dates, assortments and nutrition claims', () => {
  assert.match(coke.answer, /parts of New York, New Jersey and Pennsylvania/);
  assert.match(coke.answer, /late October 2026/);
  assert.match(coke.answer, /nationwide release date has not been announced/);
  assert.match(body(coke), /34 milligrams/);
  assert.match(body(coke), /caffeine-free/);
  assert.match(bloom.answer, /October 2026/);
  assert.match(bloom.answer, /January 2027/);
  assert.match(body(bloom), /six Strawberry Shortie, six Shirley Temple and six Glacier Crush/);
  assert.match(body(bloom), /180 milligrams/);
  assert.match(body(bloom), /does not, on its own, establish an end date/);
  assert.match(smood.answer, /does not mean both new flavors/);
  assert.match(body(smood), /Hy-Vee planned toward the end of the year/);
  assert.match(body(smood), /13 grams of total sugar and 0 grams of added sugar/);
  assert.match(smood.disclosure, /brand-promoted release/);
});

test('new journal entries can be searched by product and all covered prebiotic brands', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  for (const report of additions) {
    const result = selectReports(index, { q: report.product, brand: report.brand, status: 'launch', sort: 'newest', page: 1 });
    assert.ok(result.items.some((item) => item.slug === report.slug));
  }
  for (const brand of ['Sprite', 'Fresca']) {
    const result = selectReports(index, { q: 'prebiotic', brand, sort: 'newest', page: 1 });
    assert.ok(result.items.some((item) => item.slug === coke.slug));
  }
  const apple = selectReports(index, { q: 'green apple', brand: 'SMOOD SWEETS', sort: 'newest', page: 1 });
  assert.ok(apple.items.some((item) => item.slug === smood.slug));
});

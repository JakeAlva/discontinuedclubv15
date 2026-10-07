import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import { drPepperIceCreamFloatReport as pepper } from '../scripts/dr-pepper-ice-cream-float-report.mjs';
import { ghostAwRootBeerReport as ghost } from '../scripts/ghost-aw-root-beer-report.mjs';
import { dunkinDoomsdayReport as dunkin } from '../scripts/dunkin-doomsday-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [pepper, ghost, dunkin];

test('October 7 stories have crawlable discovery, accurate schema and verified image dimensions', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const sitemap = new XMLParser().parse(await read('dist/sitemap-journal.xml')).urlset.url.map((item) => item.loc);
  for (const report of additions) {
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.ok(reports.includes(report));
    assert.equal(sitemap.filter((url) => url === canonical).length, 1);
    for (const file of ['dist/index.html', 'dist/blog.html']) assert.ok((await read(file)).includes(`href="${href}"`), file);
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(schema[0].datePublished, '2026-10-07');
    assert.equal(schema[0].dateModified, '2026-10-07');
    assert.equal(schema[0].headline, report.title);
    assert.equal(schema[0].mainEntityOfPage, canonical);
    assert.equal(schema[1].mainEntity.length, report.faq.length);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug));
    const dimensions = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(dimensions.width, report.imageWidth);
    assert.equal(dimensions.height, report.imageHeight);
    assert.ok(dimensions.width >= 1200);
    assert.ok(report.imageCredit);
    const found = selectReports(index, { q: report.product, brand: report.brand, status: 'launch', sort: 'newest', page: 1 });
    assert.ok(found.items.some((item) => item.slug === report.slug));
  }
});

test('October 7 reports distinguish future launches, ingredients and foreign-market products', () => {
  assert.match(pepper.answer, /February 2027/);
  assert.match(pepper.answer, /not established.*identical/);
  assert.ok(pepper.sources.some((source) => source.url.includes('drpepper.de')));
  assert.match(ghost.answer, /permanent offerings in 2027/);
  assert.match(ghost.sections.flatMap((section) => section.paragraphs).join(' '), /200 milligrams/);
  assert.match(dunkin.answerHeading, /November 4, not today/);
  for (const report of additions) {
    assert.equal(report.shop, undefined);
    assert.match(report.buyerParagraphs.join(' '), /does not currently sell/);
    assert.match(report.disclosure, /not sponsored/);
  }
});

test('journal search finds shopping questions and both GHOST collaboration brands', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  for (const [q, brand, report] of [['vanilla float', 'Dr Pepper', pepper], ['root beer', 'A&W', ghost], ['doom', "Dunkin'", dunkin]]) {
    const result = selectReports(index, { q, brand, sort: 'newest', page: 1 });
    assert.ok(result.items.some((item) => item.slug === report.slug));
  }
});

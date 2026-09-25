import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from '../scripts/journal-data.mjs';

const root = resolve(import.meta.dirname, '..');
const slug = 'is-monster-rehab-strawberry-lemonade-discontinued';
const read = (file) => readFile(resolve(root, file), 'utf8');

test('new Rehab report keeps reported status, regional caveats, and Juice identity distinct', () => {
  const report = reports.find((item) => item.slug === slug);
  assert.equal(report.checkedDate, '2026-09-21');
  assert.equal(report.statusLabel, 'Reported U.S. discontinuation');
  assert.match(report.answer, /2025/);
  assert.match(report.answer, /have not verified a manufacturer notice/);
  assert.match(report.answer, /Juice Monster Strawberry Lemonade/);
  assert.match(report.answer, /different line/);
  assert.equal(report.shop, undefined, 'do not imply we carry the retired Rehab drink');
  assert.ok(report.sources.some((source) => source.url.includes('monster-discontinuing-flavors-2025')));
  assert.ok(report.sources.filter((source) => source.url.includes('monsterenergy.com')).length >= 3);
  const copy = report.sections.flatMap((section) => section.paragraphs).join(' ');
  assert.match(copy, /Puerto Rico is a U.S. territory, not a foreign country/);
  assert.match(copy, /not verified current production or local stock/);
  assert.match(copy, /Discontinued Club does not currently list Rehab Strawberry Lemonade for sale/);
});

test('new Rehab article is discoverable, dated, and indexable with the correct single-can image', async () => {
  const report = reports.find((item) => item.slug === slug);
  let library = '';
  for (const file of (await readdir(root)).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file))) library += await read(file);
  assert.ok(library.includes('journal/' + slug + '.html'), 'article remains accessible through crawlable journal pagination');
  for (const file of ['discontinued-monster-energy-flavors.html', 'discontinued-energy-drink-flavors-2026.html', 'sitemap-journal.xml']) {
    assert.ok((await read(file)).includes('journal/' + slug + '.html'), file);
  }
  const html = await read('dist/journal/' + slug + '.html');
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const article = schema['@graph'].find((item) => item['@type'] === 'Article');
  assert.equal(article.datePublished, '2026-09-21');
  assert.equal(article.dateModified, '2026-09-21');
  assert.equal(article.mainEntityOfPage, 'https://discontinuedclub.com/journal/' + slug + '.html');
  assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/);
  assert.match(html, /Image source: Monster Energy, Puerto Rico product page/);
  assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart/);
  const image = await readFile(resolve(root, report.image));
  assert.equal(image.subarray(1, 4).toString(), 'PNG');
  assert.ok(image.readUInt32BE(20) > image.readUInt32BE(16), 'use the portrait can, not the landscape Rehab logo');
  assert.ok(image.length > 10000);
});

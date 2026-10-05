import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { pitchBlackUkReport as report } from '../scripts/pitch-black-uk-report.mjs';
import { selectReports } from '../assets/journal-library.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const href = `journal/${report.slug}.html`;

test('Pitch Black is discoverable as a sourced article with the official UK image', async () => {
  for (const file of ['index.html', 'blog.html', 'sitemap-journal.xml']) {
    assert.ok((await read(file)).includes(href), `${file} must link the new article`);
  }
  const html = await read(`dist/${href}`);
  assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
  assert.match(html, /content="index, follow, max-image-preview:large"/);
  assert.match(html, /Image source: Carlsberg Britvic/);
  assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  assert.equal(graph[0]['@type'], 'Article');
  assert.equal(graph[0].datePublished, '2026-10-05');
  assert.equal(graph[0].dateModified, '2026-10-05');
  assert.equal(graph[0].headline, report.title);
  assert.equal(graph[1].mainEntity.length, report.faq.length);
  const image = await sharp(resolve(root, report.image)).metadata();
  assert.equal(image.width, report.imageWidth);
  assert.equal(image.height, report.imageHeight);
  assert.equal(image.format, 'webp');
  for (const source of report.sources) assert.ok(html.includes(source.url));
  const index = JSON.parse(await read('assets/journal-index.json'));
  const results = selectReports(index, { q: 'Pitch Black', brand: 'Mountain Dew', status: 'launch', sort: 'newest', page: 1 });
  assert.ok(results.items.some((item) => item.slug === report.slug));
});

test('Pitch Black coverage separates confirmed UK plans from unconfirmed U.S. availability', () => {
  assert.equal(report.shop, undefined);
  assert.equal(report.statusKey, 'launch');
  assert.equal(report.statusLabel, 'U.S. return not confirmed');
  assert.match(report.answer, /not verified an announcement of a new nationwide U.S./);
  const copy = report.sections.flatMap((section) => section.paragraphs).join(' ');
  assert.match(copy, /wholesaler Booker in October/);
  assert.match(copy, /national UK rollout from November 2026/);
  assert.match(copy, /historical announcement does not verify/);
  assert.match(copy, /not established that the recipes are identical/);
  assert.match(report.disclosure, /does not currently sell Pitch Black/);
  assert.ok(report.statusParagraphs.length && report.buyerParagraphs.length);
  assert.equal(report.sources.length, 5);
});

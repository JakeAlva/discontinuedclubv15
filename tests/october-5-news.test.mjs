import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { crushBigTroppaPunchReport as crush } from '../scripts/crush-big-troppa-punch-report.mjs';
import { mugVanillaHowlerReport as mug } from '../scripts/mug-vanilla-howler-report.mjs';
import { selectReports } from '../assets/journal-library.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

test('October 5 stories have static discovery links, metadata and real product assets', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  for (const report of [crush, mug]) {
    const href = `journal/${report.slug}.html`;
    assert.equal(report.checkedDate, '2026-10-05');
    assert.equal(report.statusKey, 'current');
    assert.equal(report.statusLabel, 'Limited-time release');
    assert.equal(report.shop, undefined);
    for (const path of ['index.html', 'blog.html', 'sitemap-journal.xml']) {
      assert.ok((await read(path)).includes(href), `${path} must link ${href}`);
    }
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.match(html, /By Discontinued Club Research/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-05');
    assert.equal(graph[0].dateModified, '2026-10-05');
    assert.equal(graph[0].headline, report.title);
    assert.equal(graph[1].mainEntity.length, report.faq.length);
    assert.ok(report.sources.length >= 4);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    const metadata = await sharp(resolve(root, report.image)).metadata();
    assert.equal(metadata.width, report.imageWidth);
    assert.equal(metadata.height, report.imageHeight);
    assert.ok(metadata.width >= 1000);
    const result = selectReports(index, { q: report.product, brand: report.brand, status: 'current', sort: 'newest', page: 1 });
    assert.ok(result.items.some((item) => item.slug === report.slug));
  }
});

test('limited releases do not imply a new October launch or confirmed discontinuation', () => {
  assert.match(crush.answer, /not verified a firm national end date/);
  assert.match(crush.sections.flatMap((section) => section.paragraphs).join(' '), /not a claim that Crush launched a new flavor today/);
  assert.match(crush.sections.flatMap((section) => section.paragraphs).join(' '), /Electric Blue Razz/);
  assert.match(mug.answer, /do not prove fresh stock/);
  assert.match(mug.sections.flatMap((section) => section.paragraphs).join(' '), /June 14, 2026/);
  for (const report of [crush, mug]) {
    assert.match(report.disclosure, /does not currently sell/);
    assert.ok(report.sources.some((source) => source.url.includes('pepsicopartners.com')));
  }
});

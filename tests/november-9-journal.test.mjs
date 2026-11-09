import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from '../scripts/journal-data.mjs';

const root = resolve(import.meta.dirname, '..');
const slugs = ['crystal-pepsi-history-failure-comebacks', 'surge-soda-history-fan-comeback'];
const additions = reports.filter((report) => report.editionDate === '2026-11-09');
const strip = (value) => value.replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' ');

test('November 9 publishes exactly two substantial, sourced historical articles', async () => {
  assert.deepEqual(additions.map((report) => report.slug), slugs);
  for (const report of additions) {
    const body = strip([report.answer, ...report.sections.flatMap((section) => section.paragraphs)].join(' '));
    assert.ok(body.trim().split(/\s+/).length >= 1700, `${report.slug} needs original long-form content`);
    assert.equal(report.checkedDate, '2026-11-09');
    assert.equal(report.readTime, 10);
    assert.ok(report.sections.length >= 10);
    assert.equal(new Set(report.sections.map((section) => section.id)).size, report.sections.length);
    assert.ok(report.sources.length >= 9);
    assert.ok(report.statusParagraphs && report.buyerParagraphs && report.disclosure);
    assert.equal(report.shop, undefined, 'historical publicity images must not imply store inventory');
    assert.ok(report.relatedSlugs.includes(slugs.find((slug) => slug !== report.slug)));
    assert.ok((await readFile(resolve(root, report.image))).length > 1000);
    const html = await readFile(resolve(root, 'journal', `${report.slug}.html`), 'utf8');
    assert.ok(html.includes('"datePublished":"2026-11-09"'));
    assert.ok(html.includes(`https://discontinuedclub.com/journal/${report.slug}.html`));
    assert.ok(html.includes('index, follow, max-image-preview:large'));
    for (const source of report.sources) assert.ok(html.includes(source.url));
  }
});

test('historical returns do not become current inventory or confirmed future launches', () => {
  const [crystal, surge] = additions;
  assert.match(crystal.answer, /not verified.*2027.*rumor/);
  assert.match(crystal.sections.find((section) => section.id === 'last-return').paragraphs.join(' '), /not another open retail launch/);
  assert.match(surge.answer, /not verified broad new U\.S\. canned distribution/);
  assert.match(surge.sections.find((section) => section.id === 'current-status').paragraphs.join(' '), /could not independently retrieve.*secondary historical evidence/);
  for (const report of additions) {
    assert.equal(report.statusKey, 'format');
    assert.match(report.caption, /historical|past/i);
    assert.doesNotMatch(report.answer, /buy now|in stock|preorder/i);
  }
});

test('both new articles are discoverable in the first journal page, search index and sitemap', async () => {
  const index = await readFile(resolve(root, 'blog.html'), 'utf8');
  const search = JSON.parse(await readFile(resolve(root, 'assets/journal-index.json'), 'utf8'));
  const sitemap = await readFile(resolve(root, 'sitemap-journal.xml'), 'utf8');
  for (const slug of slugs) {
    assert.ok(index.includes(`journal/${slug}.html`));
    assert.ok(JSON.stringify(search).includes(slug));
    assert.ok(sitemap.includes(`/journal/${slug}.html`));
  }
});

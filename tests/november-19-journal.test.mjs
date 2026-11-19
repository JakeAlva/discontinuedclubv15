import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { reports } from '../scripts/journal-data.mjs';
import { catalog } from '../lib/store-catalog.mjs';

const additions = reports.filter((report) => report.editionDate === '2026-11-19');
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('November 19 adds two sourced, substantial guides with real product images', async () => {
  assert.equal(additions.length, 2);
  for (const report of additions) {
    assert.equal(report.checkedDate, '2026-11-19');
    const prose = [report.answer, ...report.sections.flatMap((section) => section.paragraphs)].join(' ').replace(/<[^>]*>/g, ' ');
    assert.ok(prose.split(/\s+/).length >= 1000);
    assert.ok(report.sources.length >= 2);
    assert.ok(report.statusParagraphs && report.buyerParagraphs && report.disclosure);
    assert.equal(new Set(report.sections.map((section) => section.id)).size, report.sections.length);
    for (const slug of report.relatedSlugs) assert.ok(reports.some((candidate) => candidate.slug === slug));
    assert.ok((await readFile(new URL(`../${report.image}`, import.meta.url))).length > 1000);
    const html = await read(`journal/${report.slug}.html`);
    assert.ok(html.includes('"datePublished":"2026-11-19"'));
    assert.ok(html.includes(`https://discontinuedclub.com/journal/${report.slug}.html`));
    assert.ok(html.includes(report.shop.href));
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const match of html.matchAll(/href="(products\/[^"]+)"/g)) await read(match[1]);
    assert.doesNotMatch(prose, /\b\d+ (?:cans|bottles) (?:left|in stock)\b/i);
  }
});

test('new guides separate release history from unverified dates and current production', () => {
  const [sprite, dew] = additions;
  assert.match(sprite.sections.find((section) => section.id === 'new-artwork').paragraphs.join(' '), /not an announcement that Lymonade Legacy has returned/);
  assert.match(dew.sections.find((section) => section.id === 'baja-origin').paragraphs.join(' '), /printed code|code still needs verification/);
  assert.match(dew.sidebar, /not run a side-by-side tasting/);
  const bottle = catalog.find((item) => item.id === '406738017949');
  assert.doesNotMatch(bottle.detail, /2021/);
  assert.match(bottle.detail, /printed date unverified/);
});

test('both guides appear in the journal, search index and sitemap', async () => {
  for (const path of ['blog.html', 'assets/journal-index.json', 'sitemap-journal.xml']) {
    const content = await read(path);
    for (const report of additions) assert.ok(content.includes(report.slug), `${report.slug} missing from ${path}`);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { reports } from '../scripts/journal-data.mjs';
import { homeJournalMarkup } from '../scripts/generate-journal-library.mjs';
import { selectReports } from '../assets/journal-library.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const additions = reports.filter((report) => report.editionDate === '2026-11-20');

test('November 20 adds two substantial, sourced articles with working product links', async () => {
  assert.equal(additions.length, 2);
  for (const report of additions) {
    const prose = [report.answer, ...report.sections.flatMap((section) => section.paragraphs)].join(' ').replace(/<[^>]*>/g, ' ');
    assert.ok(prose.split(/\s+/).length >= 650);
    assert.ok(report.sources.length >= 2);
    assert.ok(report.statusParagraphs && report.buyerParagraphs && report.disclosure);
    assert.equal(new Set(report.sections.map((section) => section.id)).size, report.sections.length);
    for (const slug of report.relatedSlugs) assert.ok(reports.some((candidate) => candidate.slug === slug));
    await readFile(new URL(`../${report.image}`, import.meta.url));
    await read(report.shop.href);
    const html = await read(`journal/${report.slug}.html`);
    assert.ok(html.includes('"datePublished":"2026-11-20"'));
    assert.ok(html.includes(report.shop.href));
    for (const source of report.sources) assert.ok(html.includes(source.url));
    assert.doesNotMatch(prose, /\b\d+ cans (?:left|in stock)\b/i);
    for (const path of ['blog.html', 'assets/journal-index.json', 'sitemap-journal.xml']) assert.ok((await read(path)).includes(report.slug));
  }
});

test('preorder guide preserves payment timing, conditional shipping and separate-cart terms', () => {
  const pear = additions.find((report) => report.brand === 'Bloom Nutrition');
  assert.match(pear.answer, /Payment is collected when you order/);
  assert.match(pear.answer, /November 30, 2026.*provided/);
  assert.match(pear.sections.map((s) => s.paragraphs.join(' ')).join(' '), /ordered separately from ready-to-ship/);
  assert.match(pear.caption, /not a photograph of the incoming batch/);
  const winter = additions.find((report) => report.brand === 'Alani Nu');
  assert.match(winter.answer, /new recipe/);
  assert.match(winter.sidebar, /not a taste test/);
});

test('homepage publishes the same latest three stories as the journal, without JavaScript', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const expected = selectReports(index, { sort: 'newest', page: 1 }).items.slice(0, 3);
  const home = await read('index.html');
  const slot = home.match(/<!-- home-journal:start -->([\s\S]*?)<!-- home-journal:end -->/)[1];
  assert.equal((slot.match(/class="home-journal-story"/g) || []).length, 3);
  assert.equal(slot.trim(), homeJournalMarkup(index));
  let previous = -1;
  for (const report of expected) {
    const position = slot.indexOf(`journal/${report.slug}.html`);
    assert.ok(position > previous);
    previous = position;
    assert.ok(slot.includes(`datetime="${report.editionDate || report.date}"`));
    assert.ok(slot.includes(`src="${report.image}"`));
  }
  assert.doesNotMatch(slot, /November 2 \/|October 30 \/|editorial-card/);
});

test('home story generation sorts by edition and escapes article fields', () => {
  const report = { slug: 'older', product: 'Test', title: '<Test & "title">', cardCopy: 'A & B', image: 'test.webp', readTime: 3, date: '2026-11-01' };
  const markup = homeJournalMarkup([report, { ...report, slug: 'new-edition', editionDate: '2026-11-20' }]);
  assert.ok(markup.indexOf('journal/new-edition.html') < markup.indexOf('journal/older.html'));
  assert.ok(markup.includes('&lt;Test &amp; &quot;title&quot;&gt;'));
  assert.ok(markup.includes('A &amp; B'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from '../scripts/journal-data.mjs';

const root = resolve(import.meta.dirname, '..');
const journalDirectory = resolve(root, 'journal');

function readableWordCount(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

test('journal publishes every researched report as a substantial, indexable article', async () => {
  const files = (await readdir(journalDirectory)).filter((file) => file.endsWith('.html')).sort();
  const expectedFiles = reports.map((report) => `${report.slug}.html`).sort();
  assert.deepEqual(files, expectedFiles);
  assert.ok(reports.length >= 14);

  for (const report of reports) {
    const file = `${report.slug}.html`;
    const html = await readFile(resolve(journalDirectory, file), 'utf8');
    assert.match(html, new RegExp(`<link rel="canonical" href="https://discontinuedclub\\.com/journal/${file}">`));
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/);
    assert.match(html, /<base href="\.\.\/">/);
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /"about":\{"@type":"Thing"/);
    assert.doesNotMatch(html, /"about":\{"@type":"Product"/);
    assert.ok(html.includes(`<time datetime="${report.checkedDate || '2026-09-11'}">`));
    assert.ok(html.includes(`src="${report.image}"`), `${file} should use its one-can editorial image`);
    assert.match(html, /class="article-hero-media"><img[^>]+style="aspect-ratio: 1 \/ 1"/, 'portrait packshots should keep a stable square display area');
    assert.ok(html.includes(`status-${report.statusKey}`), `${file} should expose its evidence status`);
    assert.ok(readableWordCount(html) >= 900, `${file} should contain at least 900 readable words`);
    assert.doesNotMatch(html, /assets\/images\/listings\/branded\//);
    assert.doesNotMatch(html, /(?:href|src)="\.\.\/assets\//);
    const toc = html.match(/<nav class="article-toc"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(toc, `${file} should have an article guide`);
    for (const [, href] of toc.matchAll(/href="([^"]+)"/g)) {
      const destination = new URL(href, 'https://discontinuedclub.com/');
      assert.equal(destination.pathname, `/journal/${file}`, 'base href must not send section links to the homepage');
      assert.ok(html.includes(`id="${destination.hash.slice(1)}"`), `${file} should contain its section target`);
    }
    for (const source of report.sources) assert.ok(html.includes(source.url), `${file} should link ${source.url}`);
    if (report.shop) assert.ok(html.includes(`href="${report.shop.href}"`), `${file} should link to its relevant product`);
  }
});

test('journal separates U.S. discontinuations, current formats, and unconfirmed rumors', () => {
  const blueberry = reports.find((report) => report.slug === 'is-red-bull-blue-edition-blueberry-discontinued');
  const ultraRed = reports.find((report) => report.slug === 'is-monster-ultra-red-discontinued');
  const liveWire = reports.find((report) => report.slug === 'is-mountain-dew-livewire-discontinued');
  const fujiApple = reports.find((report) => report.slug === 'is-red-bull-fuji-apple-ginger-discontinued');
  const rumors = reports.filter((report) => report.statusKey === 'rumor');

  assert.equal(blueberry.statusKey, 'discontinued');
  assert.equal(ultraRed.statusKey, 'discontinued');
  assert.equal(liveWire.statusKey, 'current');
  assert.match(liveWire.answer, /older design/i);
  assert.equal(fujiApple.statusKey, 'format');
  assert.match(fujiApple.answer, /only available with sugar/i);
  assert.deepEqual([...new Set(rumors.map((report) => report.product))].sort(), [
    'Juice Monster Rio Punch',
    'Monster Rehab Green Tea',
    'Monster Ultra Fantasy Ruby Red'
  ]);
  for (const report of rumors) {
    assert.match(report.statusLabel, /not confirmed/i);
    assert.match(report.answer, /September 8/i);
  }
});

test('journal index and sitemap expose every status report', async () => {
  const index = await readFile(resolve(root, 'blog.html'), 'utf8');
  const sitemap = await readFile(resolve(root, 'sitemap-journal.xml'), 'utf8');

  assert.match(index, /United States market/);
  assert.match(index, /Discontinuation watch/);
  assert.ok(index.includes(`${reports.length} individual articles`));
  for (const report of reports) {
    const file = `${report.slug}.html`;
    assert.ok(index.includes(`journal/${file}`), `blog.html should link to ${file}`);
    assert.ok(sitemap.includes(`https://discontinuedclub.com/journal/${file}`), `journal sitemap should include ${file}`);
  }
});

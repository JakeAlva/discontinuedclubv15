import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from '../scripts/journal-data.mjs';

const root = resolve(import.meta.dirname, '..');

test('Aussie Lemonade distinguishes reported U.S. status from overseas listings', async () => {
  const report = reports.find((item) => item.slug === 'is-monster-aussie-lemonade-discontinued');
  assert.equal(report.checkedDate, '2026-09-16');
  assert.match(report.statusLabel, /Reported/);
  assert.match(report.answer, /2025/);
  assert.match(report.answer, /Australia and Great Britain/);
  assert.match(report.answer, /did not locate a public manufacturer notice/);
  assert.equal(report.shop, undefined, 'do not advertise nonexistent store inventory');
  for (const file of ['discontinued-monster-energy-flavors.html', 'sitemap-journal.xml']) {
    assert.ok((await readFile(resolve(root, file), 'utf8')).includes(`journal/${report.slug}.html`), file);
  }
  const libraryPages = (await readdir(root)).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  let library = '';
  for (const file of libraryPages) library += await readFile(resolve(root, file), 'utf8');
  assert.ok(library.includes(`journal/${report.slug}.html`), 'Aussie Lemonade remains discoverable in the paginated journal');
  const html = await readFile(resolve(root, 'journal', `${report.slug}.html`), 'utf8');
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const article = schema['@graph'].find((item) => item['@type'] === 'Article');
  assert.equal(article.datePublished, '2026-09-16');
  assert.equal(article.mainEntityOfPage, `https://discontinuedclub.com/journal/${report.slug}.html`);
  assert.ok((await readFile(resolve(root, report.image))).length > 1000);
});

test('built pages retain the stable, square DC favicon and canonical addresses', async () => {
  const output = resolve(root, 'dist');
  const png = await readFile(resolve(output, 'favicon.png'));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 96);
  assert.equal(png.readUInt32BE(20), 96);
  assert.deepEqual(png, await readFile(resolve(root, 'favicon.png')));
  for (const directory of ['', 'journal', 'products', 'sold']) {
    for (const file of await readdir(resolve(output, directory))) {
      if (!file.endsWith('.html')) continue;
      const html = await readFile(resolve(output, directory, file), 'utf8');
      if (html.startsWith('google-site-verification:')) continue;
      assert.match(html, /<link rel="icon" type="image\/png" sizes="96x96" href="\/favicon.png">/, file);
      if (!/<meta name="robots" content="noindex/.test(html)) {
        assert.match(html, /<link rel="canonical" href="https:\/\/discontinuedclub\.com\//, file);
      }
    }
  }
  const robots = await readFile(resolve(output, 'robots.txt'), 'utf8');
  assert.doesNotMatch(robots, /Disallow:\s*\//);
  assert.match(robots, /Sitemap: https:\/\/discontinuedclub\.com\/sitemap.xml/);
});

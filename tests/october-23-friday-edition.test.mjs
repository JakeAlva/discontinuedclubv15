import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { reports } from '../scripts/journal-data.mjs';
import { alaniWitchsBrewSizesReport as witch } from '../scripts/alani-witchs-brew-sizes-report.mjs';
import { hiddenValleySpookyRanchReport as ranch } from '../scripts/hidden-valley-spooky-ranch-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, 'dist', file), 'utf8');

for (const report of [witch, ranch]) {
  test(`${report.slug} distinguishes Friday edition from actual publication`, async () => {
    assert.equal(reports.filter((item) => item.slug === report.slug).length, 1);
    const href = `journal/${report.slug}.html`;
    const html = await read(href);
    assert.match(html, /October 23, 2026 edition/);
    assert.match(html, /Published October 25, 2026/);
    assert.match(html, /"datePublished":"2026-10-25"/);
    const libraryPages = (await readdir(resolve(root, 'dist'))).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
    const library = (await Promise.all(libraryPages.map(read))).join('');
    assert.ok(library.includes(href));
    assert.ok((await read('sitemap-journal.xml')).includes(href));
    assert.ok(JSON.parse(await read('assets/journal-index.json')).some((item) => item.slug === report.slug));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug));
    for (const [, target] of html.matchAll(/href="([^"#]+\.html)(?:#[^"]*)?"/g)) {
      if (!target.startsWith('https://')) await access(resolve(root, 'dist', target));
    }
    const image = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    assert.doesNotMatch(html, /For older full cans|data-add-to-cart/);
  });
}

test('seasonal guides qualify stock, flavor and end-date claims', async () => {
  const witchHtml = await read(`journal/${witch.slug}.html`);
  assert.match(witchHtml, /200 mg/);
  assert.match(witchHtml, /100 mg/);
  assert.match(witchHtml, /33.6 fl oz/);
  assert.match(witchHtml, /not a reservation or a guarantee of stock/);
  const ranchHtml = await read(`journal/${ranch.slug}.html`);
  assert.match(ranchHtml, /November 1, 2026/);
  assert.match(ranchHtml, /while supplies last/);
  assert.match(ranchHtml, /not a verified quote/);
  assert.match(ranchHtml, /We have not tasted it/);
  assert.match(ranchHtml, /effect is on the packaging/);
  assert.doesNotMatch(ranchHtml, /article-shop-callout/);
});

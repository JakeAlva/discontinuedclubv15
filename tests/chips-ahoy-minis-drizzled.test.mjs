import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { reports } from '../scripts/journal-data.mjs';
import { chipsAhoyMinisDrizzledReport as report } from '../scripts/chips-ahoy-minis-drizzled-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const href = `journal/${report.slug}.html`;

test('Minis Drizzled report is discoverable with October 22 metadata and official artwork', async () => {
  assert.ok(reports.includes(report));
  assert.equal(reports.filter((item) => item.slug === report.slug).length, 1);
  const html = await read(`dist/${href}`);
  const pages = (await readdir(resolve(root, 'dist'))).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  const library = (await Promise.all(pages.map((file) => read(`dist/${file}`)))).join('\n');
  assert.ok(library.includes(`href="${href}"`));
  assert.ok((await read('dist/sitemap-journal.xml')).includes(href));
  assert.ok(JSON.parse(await read('dist/assets/journal-index.json')).some((item) => item.slug === report.slug));
  assert.ok(html.includes(`rel="canonical" href="https://discontinuedclub.com/${href}"`));
  assert.match(html, /"datePublished":"2026-10-22"/);
  assert.match(html, /Published October 22, 2026/);
  for (const source of report.sources) assert.ok(html.includes(source.url));
  for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
  for (const [, target] of html.matchAll(/href="([^"#]+\.html)(?:#[^"]*)?"/g)) {
    if (!target.startsWith('https://')) await access(resolve(root, 'dist', target));
  }
  const image = await sharp(resolve(root, 'dist', report.image)).metadata();
  assert.equal(image.width, report.imageWidth);
  assert.equal(image.height, report.imageHeight);
});

test('Minis Drizzled coverage separates a retail rollout from stock and discontinuation claims', async () => {
  const html = await read(`dist/${href}`);
  assert.equal(report.statusKey, 'current');
  assert.match(report.answer, /October 21, 2026/);
  assert.match(report.statusParagraphs.join(' '), /Limited distribution is not the same as limited edition/);
  assert.match(report.statusParagraphs.join(' '), /does not establish a seasonal end date/);
  assert.match(html, /does not establish Fudge availability/);
  assert.match(html, /We have not tasted either version/);
  assert.doesNotMatch(html, /For older full cans|article-shop-callout|data-add-to-cart/);
});

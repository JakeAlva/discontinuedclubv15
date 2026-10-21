import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { reports } from '../scripts/journal-data.mjs';
import { monsterVanillaShotReport as monster } from '../scripts/monster-vanilla-shot-report.mjs';
import { oceanSprayCranberryCiderReport as cider } from '../scripts/ocean-spray-cranberry-cider-report.mjs';
import { waffleHouseSalsaReport as salsa } from '../scripts/waffle-house-salsa-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, 'dist', path), 'utf8');
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('October 21 articles are published, discoverable and use verified local images', async () => {
  const libraryPages = (await readdir(resolve(root, 'dist'))).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  const blog = (await Promise.all(libraryPages.map(read))).join('\n');
  const sitemap = await read('sitemap-journal.xml');
  const index = JSON.parse(await read('assets/journal-index.json'));
  for (const report of [monster, cider, salsa]) {
    const href = `journal/${report.slug}.html`;
    const html = await read(href);
    assert.ok(reports.includes(report));
    assert.ok(blog.includes(`href="${href}"`));
    assert.ok(sitemap.includes(`https://discontinuedclub.com/${href}`));
    assert.ok(index.some((entry) => entry.slug === report.slug));
    assert.match(html, /Published October 21, 2026/);
    assert.match(html, /"datePublished":"2026-10-21"/);
    assert.match(html, /"dateModified":"2026-10-21"/);
    assert.doesNotMatch(html, /For older full cans|article-shop-callout/);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((entry) => entry.slug === slug), slug);
    for (const [, href] of html.matchAll(/href="([^"#]+\.html)(?:#[^"]*)?"/g)) {
      if (!href.startsWith('https://')) await access(resolve(root, 'dist', href));
    }
    const images = [{ src: report.image, width: report.imageWidth, height: report.imageHeight }, ...report.sections.filter((section) => section.image).map((section) => section.image)];
    for (const image of images) {
      const metadata = await sharp(resolve(root, 'dist', image.src)).metadata();
      assert.equal(metadata.width, image.width);
      assert.equal(metadata.height, image.height);
      assert.ok(html.includes(image.src));
    }
  }
});

test('new reports separate confirmed specifications from dates, availability and recipe assumptions', () => {
  assert.match(monster.answer, /160 mg/);
  assert.match(monster.answer, /220 calories/);
  assert.match(monster.answer, /10/);
  assert.match(body(monster), /210 calories/);
  assert.match(body(monster), /not a dated launch announcement/);
  assert.match(cider.answer, /October 2026/);
  assert.match(body(cider), /select Walmart stores/);
  assert.match(cider.statusParagraphs.join(' '), /does not give a final production month/);
  assert.match(salsa.answer, /October 19, 2026/);
  assert.match(body(salsa), /does not say the new packet uses the same recipe/);
  assert.match(salsa.statusParagraphs.join(' '), /no verified month/);
});

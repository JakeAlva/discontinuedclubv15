import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import { pepsiVanillaCreamReport as pepsi } from '../scripts/pepsi-vanilla-cream-report.mjs';
import { doritosLemonPepperReport as doritos } from '../scripts/doritos-lemon-pepper-report.mjs';
import { redBullArcticBerryReturnReport as arctic } from '../scripts/red-bull-arctic-berry-return-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, 'dist', path), 'utf8');
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('October 19 news is dated, indexed, searchable and illustrated with intact source assets', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const sitemap = new XMLParser().parse(await read('sitemap-journal.xml')).urlset.url;
  const firstPage = await read('blog.html');
  for (const report of [pepsi, doritos, arctic]) {
    assert.ok(reports.includes(report));
    assert.equal(report.format, 'news-brief');
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.ok(firstPage.includes(`href="${href}"`));
    assert.equal(sitemap.filter((entry) => entry.loc === canonical).length, 1);
    assert.equal(sitemap.find((entry) => entry.loc === canonical).lastmod, '2026-10-19');
    const html = await read(href);
    assert.match(html, /Published October 19, 2026/);
    assert.match(html, /index, follow, max-image-preview:large/);
    assert.doesNotMatch(html, /For older full cans/);
    const article = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'][0];
    assert.equal(article.headline, report.title);
    assert.doesNotMatch(article.headline, /&amp;/);
    assert.equal(article.datePublished, '2026-10-19');
    assert.equal(article.dateModified, '2026-10-19');
    assert.equal(article.mainEntityOfPage, canonical);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
    const media = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(media.width, report.imageWidth);
    assert.equal(media.height, report.imageHeight);
    assert.ok(media.width >= 500 && media.height >= 500, 'do not substitute low-resolution thumbnails');
    assert.ok(selectReports(index, { q: report.product, brand: report.brand, sort: 'newest', page: 1 }).items.some((item) => item.slug === report.slug));
  }
});

test('news keeps current launches, future timing and limited returns distinct', async () => {
  assert.match(body(pepsi), /October 19 announcement/);
  assert.match(body(pepsi), /12-pack cans and 20-ounce bottles/);
  assert.match(body(pepsi), /not tasted/);
  assert.match(doritos.answer, /early 2027/);
  assert.match(body(doritos), /will not turn the broad timing into a January date/);
  assert.match(arctic.answer, /not confirmation of a permanent/);
  assert.match(body(arctic), /not a case containing 24 Arctic Berry cans/);
  assert.match(arctic.evidenceNote, /September announcement/);
  assert.match(arctic.disclosure, /sells the featured can/);
  const html = await read(`journal/${arctic.slug}.html`);
  assert.ok(html.includes(`href="${arctic.shop.href}"`));
  assert.match(html, /article-shop-callout/);
});

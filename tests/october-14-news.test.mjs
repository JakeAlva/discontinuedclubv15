import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { cardMarkup, selectReports } from '../assets/journal-library.mjs';
import { prodaProteinSodaReport as proda } from '../scripts/proda-protein-soda-report.mjs';
import { littleDebbieHoliday2026Report as debbie } from '../scripts/little-debbie-holiday-2026-report.mjs';
import { olipopPomegranateSparkleReport as olipop } from '../scripts/olipop-pomegranate-sparkle-report.mjs';
import { dunkinBerryBattieReport as dunkin } from '../scripts/dunkin-berry-battie-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const additions = [proda, debbie, olipop, dunkin];
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');

test('four October 13/14 edition stories are indexable, sourced, illustrated and linked', async () => {
  const sitemap = new XMLParser().parse(await read('dist/sitemap-journal.xml')).urlset.url;
  const pages = (await readdir(resolve(root, 'dist'))).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  const library = (await Promise.all(pages.map((file) => read(`dist/${file}`)))).join('');
  for (const report of additions) {
    assert.ok(reports.includes(report));
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.equal(sitemap.filter((row) => row.loc === canonical).length, 1);
    assert.ok(library.includes(`href="${href}"`));
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug));
    const meta = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(meta.width, report.imageWidth);
    assert.equal(meta.height, report.imageHeight);
    assert.ok(meta.width >= 450 && meta.height >= 600);
    assert.ok(report.imageCredit);
    assert.match(report.disclosure, /not sponsored/);
    assert.match(report.buyerParagraphs.join(' '), /does not currently sell/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-14');
    assert.equal(graph[0].dateModified, report.modifiedDate || '2026-10-14');
    assert.equal(graph[0].headline, report.title);
    assert.equal(graph[0].mainEntityOfPage, canonical);
    assert.equal(graph[1].mainEntity.length, report.faq.length);
    assert.match(html, /Published October 14, 2026/);
    assert.doesNotMatch(html, /Published October 13, 2026/);
    assert.ok(html.includes(`datetime="${report.editionDate}"`));
  }
});

test('Dunkin sleeve update uses the official photo throughout the article and journal', async () => {
  assert.equal(dunkin.image, 'assets/images/journal/dunkin-bat-cup-sleeve-official.webp');
  assert.equal(dunkin.modifiedDate, '2026-10-16');
  assert.match(dunkin.imageAlt, /purple wings/);
  assert.match(dunkin.caption, /actual promotional bat cup sleeve/);
  const html = await read(`dist/journal/${dunkin.slug}.html`);
  assert.ok(html.includes(`src="${dunkin.image}"`));
  assert.ok(html.includes(`property="og:image" content="https://discontinuedclub.com/${dunkin.image}"`));
  assert.match(html, /Updated October 16, 2026/);
  assert.doesNotMatch(html, /pictured cup is not wearing/);
  const index = JSON.parse(await read('dist/assets/journal-index.json'));
  assert.equal(index.find((item) => item.slug === dunkin.slug).image, dunkin.image);
  const sitemap = new XMLParser().parse(await read('dist/sitemap-journal.xml')).urlset.url;
  assert.equal(sitemap.find((row) => row.loc.endsWith(`${dunkin.slug}.html`)).lastmod, '2026-10-16');
});

test('Dunkin keeps the original drink photo inside the drink section alongside the sleeve hero', async () => {
  const media = dunkin.sections.find((section) => section.id === 'drink').image;
  assert.equal(media.src, 'assets/images/journal/dunkin-berry-battie-official.webp');
  const html = await read(`dist/journal/${dunkin.slug}.html`);
  const drinkSection = html.match(/<section id="drink">[\s\S]*?<\/section>/)[0];
  assert.ok(drinkSection.includes(`<figure class="article-inline-media"><img src="${media.src}"`));
  assert.match(drinkSection, /width="450" height="600" loading="lazy" decoding="async"/);
  assert.ok(drinkSection.includes(`<figcaption>${media.caption}</figcaption>`));
  const meta = await sharp(resolve(root, 'dist', media.src)).metadata();
  assert.equal(meta.width, media.width);
  assert.equal(meta.height, media.height);
  assert.equal((html.match(/class="article-inline-media"/g) || []).length, 1);
  assert.ok(html.includes(`src="${dunkin.image}"`));
});

test('editions provide a two-day schedule without backdating publication metadata', async () => {
  const index = JSON.parse(await read('dist/assets/journal-index.json'));
  assert.deepEqual(additions.map((r) => r.editionDate).sort(), ['2026-10-13', '2026-10-13', '2026-10-14', '2026-10-14']);
  const editionItems = index.filter((item) => additions.some((report) => report.slug === item.slug));
  const newest = selectReports(editionItems, { q: '', sort: 'newest', page: 1 }).items;
  assert.deepEqual(newest.slice(0, 4).map((r) => r.slug), [dunkin.slug, olipop.slug, debbie.slug, proda.slug]);
  for (const report of additions) {
    const item = index.find((r) => r.slug === report.slug);
    assert.equal(item.date, '2026-10-14');
    assert.equal(item.editionDate, report.editionDate);
    assert.match(cardMarkup(item), /2026 edition/);
    assert.ok(selectReports(index, { q: report.product, brand: report.brand, sort: 'newest', page: 1 }).items.some((r) => r.slug === report.slug));
  }
});

test('the reports keep product, promotion and evidence distinctions explicit', () => {
  assert.match(proda.answer, /not an announcement that the first cans go on sale/);
  assert.match(body(proda), /subscription and a one-time order/);
  assert.match(body(debbie), /20 muffins does not mean 20 individually wrapped/);
  assert.match(body(debbie), /Chocolate Chip Mini Muffins/);
  assert.match(body(olipop), /30 calories and 2 grams/);
  assert.match(body(olipop), /35 calories and 4 grams/);
  assert.match(body(olipop), /cannot determine/);
  assert.match(dunkin.answerHeading, /October 14.*October 16/);
  assert.match(body(dunkin), /while supplies last at participating U.S. locations/);
  assert.ok(additions.every((r) => r.statusKey === 'launch'));
});

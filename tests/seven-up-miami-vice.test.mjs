import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { sevenUpMiamiViceReport as report } from '../scripts/seven-up-miami-vice-report.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const href = `journal/${report.slug}.html`;

test('Miami Vice report preserves uncertainty and visibly identifies concept imagery', () => {
  assert.equal(report.checkedDate, '2026-09-25');
  assert.equal(report.statusKey, 'launch');
  assert.match(report.statusLabel, /unconfirmed/);
  assert.match(report.answer, /have not found an official U.S. announcement/);
  assert.match(report.imageAlt, /AI-generated.*not official packaging/);
  assert.match(report.caption, /imagined packaging, not a product photograph/);
  assert.match(report.disclosure, /not evidence for the rumor/);
  assert.equal(report.shop, undefined);
  assert.ok(report.buyerParagraphs && report.statusParagraphs);
  const copy = report.sections.flatMap((section) => section.paragraphs).join(' ');
  assert.match(copy, /could not substantiate a 2027 launch window/);
  assert.match(copy, /speculative flavor notes, not a verified 7UP formula/);
  assert.match(copy, /mango and peach/);
  assert.match(copy, /could not establish the original source/);
  assert.equal(report.sources.length, 4);
  for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
});

test('Miami Vice article is discoverable, indexable and has editorial rather than product schema', async () => {
  for (const file of ['index.html', 'blog.html', 'sitemap-journal.xml']) {
    assert.ok((await read(file)).includes(href), file);
  }
  const html = await read(`dist/${href}`);
  assert.ok(html.includes(`href="https://discontinuedclub.com/${href}"`));
  assert.match(html, /content="index, follow, max-image-preview:large"/);
  assert.ok(html.includes(report.caption));
  assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans/);
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  assert.equal(graph[0]['@type'], 'Article');
  assert.equal(graph[0].about['@type'], 'Thing');
  assert.equal(graph[0].headline, report.title);
  assert.equal(graph[0].datePublished, report.checkedDate);
  assert.equal(graph[0].image, `https://discontinuedclub.com/${report.image}`);
  assert.ok(!JSON.stringify(graph).includes('"Offer"'));
  for (const source of report.sources) assert.ok(html.includes(source.url));
  const image = await sharp(resolve(root, report.image)).metadata();
  assert.ok(image.width >= 1200);
  assert.equal(image.width, image.height);
});

test('Miami Vice is searchable without leaking into discontinuation-only hubs', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const base = { q: '', brand: '7UP', status: 'launch', sort: 'newest', page: 1 };
  for (const q of ['7up miami vice', 'strawberry pineapple coconut']) {
    assert.equal(selectReports(index, { ...base, q }).items[0].slug, report.slug);
  }
  assert.ok(!(await read('discontinued-energy-drink-flavors-2026.html')).includes(href));
  assert.ok((await read('sitemap-pages.xml')).includes('/blog-page-5.html'));
});

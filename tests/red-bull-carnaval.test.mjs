import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import { redBullCarnavalEditionReport as report } from '../scripts/red-bull-carnaval-edition-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, 'dist', path), 'utf8');

test('Carnaval article is discoverable, dated correctly and uses the sourced can image', async () => {
  assert.ok(reports.includes(report));
  const href = `journal/${report.slug}.html`;
  const canonical = `https://discontinuedclub.com/${href}`;
  const html = await read(href);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'][0];
  assert.equal(schema.datePublished, '2026-10-20');
  assert.equal(schema.dateModified, '2026-10-20');
  assert.equal(schema.mainEntityOfPage, canonical);
  assert.match(html, /index, follow, max-image-preview:large/);
  assert.match(html, /Published October 20, 2026/);
  assert.ok((await read('blog.html')).includes(`href="${href}"`));
  const sitemap = new XMLParser().parse(await read('sitemap-journal.xml')).urlset.url;
  assert.equal(sitemap.filter((entry) => entry.loc === canonical).length, 1);
  assert.equal(sitemap.find((entry) => entry.loc === canonical).lastmod, '2026-10-20');
  const index = JSON.parse(await read('assets/journal-index.json'));
  assert.ok(selectReports(index, { q: 'Carnaval', brand: 'Red Bull', sort: 'newest', page: 1 }).items.some((item) => item.slug === report.slug));
  for (const source of report.sources) assert.ok(html.includes(source.url));
  for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug));
  const metadata = await sharp(resolve(root, 'dist', report.image)).metadata();
  assert.equal(metadata.width, report.imageWidth);
  assert.equal(metadata.height, report.imageHeight);
  assert.equal(metadata.width, 1200);
  assert.match(html, /Image source:.*GKPB/);
  assert.doesNotMatch(html, /For older full cans|article-shop-callout/);
  for (const hub of ['discontinued-red-bull-flavors.html', 'discontinued-energy-drink-flavors-2026.html']) {
    assert.ok(!(await read(hub)).includes(href), 'launch reporting must not appear as a discontinuation');
  }
});

test('Carnaval report does not turn retailer listings or launch rumors into confirmed availability', () => {
  const body = report.sections.flatMap((section) => section.paragraphs).join(' ');
  assert.equal(report.statusKey, 'launch');
  assert.equal(report.statusLabel, 'U.S. launch not confirmed');
  assert.match(report.answer, /not found an official U.S. launch announcement/);
  assert.match(body, /have not sampled/);
  assert.match(body, /showed the item as unavailable/);
  assert.match(body, /location-specific result/);
  assert.match(body, /early-2027 release as probable/);
  assert.match(body, /not publishing a January release date/);
  assert.match(body, /unanswered formula comparison/);
  assert.match(report.caption, /not our own shelf photograph/);
  assert.equal(report.shop, undefined);
});

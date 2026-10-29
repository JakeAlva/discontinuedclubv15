import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import sharp from 'sharp';
import { alaniFallArrivalsReport as arrivals } from '../scripts/alani-fall-arrivals-report.mjs';
import { alaniAppleComparisonReport as comparison } from '../scripts/alani-apple-comparison-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

test('Alani announcements keep stock quantities private and distinguish incoming stock from live offers', () => {
  for (const report of [arrivals, comparison]) {
    assert.equal(report.checkedDate, '2026-10-29');
    assert.equal(report.shop, undefined);
    const copy = JSON.stringify(report);
    assert.doesNotMatch(copy, /\b(?:20|8|twenty|eight)\s+(?:cans|units)\b/i);
    assert.match(copy, /not.*preorder/i);
    assert.match(copy, /not.*taste test|not.*tasting scores|not.*taste-tested/i);
  }
  assert.match(arrivals.sections[0].paragraphs.join(' '), /Jacob.*reports seeing/);
  assert.match(arrivals.sections[0].paragraphs.join(' '), /do not have an archived copy/);
  assert.match(arrivals.sections[0].paragraphs.join(' '), /not calling it an official 24-hour sale/);
  assert.match(arrivals.answer, /Arrival timing, prices and pack options have not been announced/);
  assert.match(JSON.stringify(arrivals), /cannot promise that everyone will get a can/);
});

test('October 29 articles have working media, crawlable links, canonical URLs and discovery entries', async () => {
  const sitemap = new XMLParser().parse(await read('sitemap-journal.xml')).urlset.url;
  const index = JSON.parse(await read('assets/journal-index.json'));
  const library = await read('blog.html');
  for (const report of [arrivals, comparison]) {
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.equal(sitemap.filter((row) => row.loc === canonical).length, 1);
    assert.equal(sitemap.find((row) => row.loc === canonical).lastmod, '2026-10-29');
    assert.ok(library.includes(href));
    assert.equal(index.find((row) => row.slug === report.slug).date, '2026-10-29');
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.match(html, /name="robots" content="index, follow/);
    assert.doesNotMatch(html, /\b(?:20|8|twenty|eight)\s+(?:cans|units)\b/i);
    const article = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'][0];
    assert.equal(article.datePublished, '2026-10-29');
    assert.equal(article.mainEntityOfPage, canonical);
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.ok(image.width >= 1200);
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    for (const [, link] of html.matchAll(/href="([^"#]+)"/g)) {
      if (/^(?:https?:|mailto:)/.test(link)) continue;
      const pathname = link.split(/[?#]/)[0].replace(/^\//, '');
      await access(resolve(root, pathname));
    }
  }
});

test('older Voodoo guide points to the incoming batch without rewriting its original date', async () => {
  const html = await read('journal/alani-voodoo-vanilla-sold-out-discontinued.html');
  assert.ok(html.includes(`journal/${arrivals.slug}.html`));
  const article = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'][0];
  assert.equal(article.datePublished, '2026-09-28');
  assert.equal(article.dateModified, '2026-10-29');
});

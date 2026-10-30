import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import sharp from 'sharp';
import { statuses } from '../assets/journal-library.mjs';
import { swigLiquidDeathReport as swig } from '../scripts/swig-liquid-death-report.mjs';
import { hersheysStrawberryKissesReport as kisses } from '../scripts/hersheys-strawberry-kisses-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

test('October 30 news distinguishes promotion, package and flavor availability', () => {
  for (const report of [swig, kisses]) {
    assert.equal(report.checkedDate, '2026-10-30');
    assert.equal(report.shop, undefined);
    assert.equal(report.statusKey, 'launch');
    assert.ok(statuses.some(([key]) => key === report.statusKey));
    assert.match(report.disclosure, /not sponsored/);
    assert.match(report.disclosure, /not taste-tested/);
  }
  assert.match(swig.answer, /Swig says.*48 hours/);
  assert.match(swig.answer, /through October 31, while supplies last/);
  assert.match(swig.sections[0].paragraphs.join(' '), /energy drink, not its plain or sparkling water/);
  assert.match(kisses.answer, /7\.8 oz/);
  assert.match(kisses.sections[1].paragraphs.join(' '), /\$5\.99/);
  assert.match(kisses.faq.at(-1).answer, /not confirmed a single nationwide launch date/);
});

test('October 30 articles are discoverable, correctly dated and have intact links and images', async () => {
  const sitemap = new XMLParser().parse(await read('sitemap-journal.xml')).urlset.url;
  const index = JSON.parse(await read('assets/journal-index.json'));
  const library = await read('blog.html');
  for (const report of [swig, kisses]) {
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.equal(sitemap.filter((row) => row.loc === canonical).length, 1);
    assert.equal(sitemap.find((row) => row.loc === canonical).lastmod, report.checkedDate);
    assert.ok(library.includes(href));
    assert.equal(index.find((row) => row.slug === report.slug).date, report.checkedDate);
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.match(html, /name="robots" content="index, follow/);
    assert.doesNotMatch(html, /data-add-to-cart|article-shop-callout/);
    const article = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'][0];
    assert.equal(article.datePublished, report.checkedDate);
    assert.equal(article.mainEntityOfPage, canonical);
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.equal(image.width, report.imageWidth);
    assert.equal(image.height, report.imageHeight);
    assert.ok(image.width >= 1200);
    for (const [, link] of html.matchAll(/href="([^"#]+)"/g)) {
      if (/^(?:https?:|mailto:)/.test(link)) continue;
      await access(resolve(root, link.split(/[?#]/)[0].replace(/^\//, '')));
    }
  }
});

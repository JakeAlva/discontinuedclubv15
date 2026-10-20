import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import { laysHolidayFlavorsReport as lays } from '../scripts/lays-holiday-flavors-report.mjs';
import { oreoBananaPuddingReturnReport as oreo } from '../scripts/oreo-banana-pudding-return-report.mjs';
import { sunnydSpookydReport as sunnyd } from '../scripts/sunnyd-spookyd-report.mjs';
import { oreoFlavorVoteReport as originalOreo } from '../scripts/oreo-flavor-vote-report.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, 'dist', path), 'utf8');
const body = (report) => report.sections.flatMap((section) => section.paragraphs).join(' ');
const articleData = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'][0];

test('October 20 stories have crawlable links, publication dates, search entries and high-resolution images', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const sitemap = new XMLParser().parse(await read('sitemap-journal.xml')).urlset.url;
  const blog = await read('blog.html');
  for (const report of [lays, oreo, sunnyd]) {
    assert.ok(reports.includes(report));
    const href = `journal/${report.slug}.html`;
    const canonical = `https://discontinuedclub.com/${href}`;
    assert.ok(blog.includes(`href="${href}"`));
    assert.equal(sitemap.filter((entry) => entry.loc === canonical).length, 1);
    assert.equal(sitemap.find((entry) => entry.loc === canonical).lastmod, '2026-10-20');
    const html = await read(href);
    assert.match(html, /Published October 20, 2026/);
    assert.match(html, /index, follow, max-image-preview:large/);
    assert.doesNotMatch(html, /For older full cans|article-shop-callout/);
    const article = articleData(html);
    assert.equal(article.headline, report.title);
    assert.equal(article.datePublished, '2026-10-20');
    assert.equal(article.dateModified, '2026-10-20');
    assert.equal(article.mainEntityOfPage, canonical);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((item) => item.slug === slug), slug);
    const images = [{ src: report.image, width: report.imageWidth, height: report.imageHeight }, ...report.sections.filter((section) => section.image).map((section) => section.image)];
    for (const image of images) {
      assert.ok(html.includes(image.src));
      const metadata = await sharp(resolve(root, 'dist', image.src)).metadata();
      assert.equal(metadata.width, image.width);
      assert.equal(metadata.height, image.height);
      assert.ok(metadata.width >= 1200);
    }
    assert.ok(selectReports(index, { q: report.product, brand: report.brand, sort: 'newest', page: 1 }).items.some((item) => item.slug === report.slug));
  }
});

test('new reporting distinguishes staged launches, limited returns and unknown flavor claims', () => {
  assert.match(body(lays), /October 25/);
  assert.match(body(lays), /November 8/);
  assert.match(body(lays), /December 1/);
  assert.match(body(lays), /select retailers/);
  assert.match(body(lays), /not sampled/);
  assert.match(oreo.answer, /2027/);
  assert.match(body(oreo), /limited-time return/);
  assert.match(body(oreo), /not read the year as a January launch/);
  assert.match(oreo.caption, /not a confirmed preview of the 2027 packaging/);
  assert.match(sunnyd.answer, /August 2026/);
  assert.match(body(sunnyd), /not a claim that the product launched today/);
  assert.match(body(sunnyd), /not an official reveal/);
  assert.match(body(sunnyd), /121\.5 fluid ounces/);
  assert.match(body(sunnyd), /not equal-volume servings/);
});

test('original OREO guide is corrected without backdating its publication or leaving voting open', async () => {
  const html = await read(`journal/${originalOreo.slug}.html`);
  const article = articleData(html);
  assert.equal(article.datePublished, '2026-09-25');
  assert.equal(article.dateModified, '2026-10-20');
  assert.match(html, /Banana Pudding won/);
  assert.doesNotMatch(html, /vote is still open|No winner yet|winner has not been announced|Not as of September 25/);
  assert.ok(html.includes(`journal/${oreo.slug}.html`));
  assert.ok((await read(`journal/${oreo.slug}.html`)).includes(`journal/${originalOreo.slug}.html`));
});

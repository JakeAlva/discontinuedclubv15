import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { falloutVaultDwellerReport as fallout } from '../scripts/fallout-vault-dweller-report.mjs';
import { oreoFlavorVoteReport as oreo } from '../scripts/oreo-flavor-vote-report.mjs';
import { selectReports } from '../assets/journal-library.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');

test('September news preserves release caveats and keeps reporting separate from sales', () => {
  const falloutCopy = fallout.sections.flatMap((section) => section.paragraphs).join(' ');
  const oreoCopy = oreo.sections.flatMap((section) => section.paragraphs).join(' ');
  assert.match(falloutCopy, /2067687/);
  assert.match(falloutCopy, /12 fl oz \(355 mL\)/);
  assert.match(falloutCopy, /dates conflict/);
  assert.match(falloutCopy, /vanilla cream soda/);
  assert.match(oreoCopy, /limited-time/);
  assert.match(oreoCopy, /October 13/);
  assert.match(oreo.answer, /October 12, 2026/);
  assert.match(oreoCopy, /not permanent placement/);
  for (const report of [fallout, oreo]) {
    assert.equal(report.checkedDate, '2026-09-25');
    assert.equal(report.statusKey, 'launch');
    assert.equal(report.shop, undefined);
    assert.ok(report.sources.length >= 2);
    assert.ok(report.sections.every((section) => section.paragraphs.length >= 2));
    assert.match(report.buyerParagraphs.join(' '), /not (?:taste-tested|conducted a taste test)/);
    assert.ok(report.statusParagraphs && report.disclosure && report.buyerParagraphs);
  }
});

test('new stories have real images, crawlable discovery and matching article metadata', async () => {
  for (const report of [fallout, oreo]) {
    const href = `journal/${report.slug}.html`;
    for (const file of ['index.html', 'blog.html', 'sitemap-journal.xml']) {
      assert.ok((await read(file)).includes(href), `${file} must expose ${href}`);
    }
    const html = await read(`dist/${href}`);
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.ok(html.includes(`href="https://discontinuedclub.com/${href}"`));
    assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart|For older full cans|U.S.-market definition of discontinued/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].headline, report.title);
    assert.equal(graph[0].datePublished, '2026-09-25');
    assert.equal(graph[0].image, `https://discontinuedclub.com/${report.image}`);
    assert.equal(graph[0].about['@type'], 'Thing');
    assert.ok(!(await read('discontinued-energy-drink-flavors-2026.html')).includes(href));
    const image = await sharp(resolve(root, report.image)).metadata();
    assert.ok(image.width >= 673 && image.height >= 673);
    assert.equal(image.width, image.height);
    assert.doesNotMatch(report.caption, /AI-assisted|mockup|reconstruction/);
    for (const source of report.sources) assert.ok(html.includes(source.url));
  }
});

test('journal supports snack and collector news in brand filters and search', async () => {
  const index = JSON.parse(await read('assets/journal-index.json'));
  const base = { q: '', brand: '', status: 'launch', sort: 'newest', page: 1 };
  assert.deepEqual(selectReports(index, base).items.slice(0, 2).map((item) => item.slug), [fallout.slug, oreo.slug]);
  for (const report of [fallout, oreo]) {
    assert.equal(selectReports(index, { ...base, brand: report.brand }).items[0].slug, report.slug);
  }
  assert.equal(selectReports(index, { ...base, q: 'chicken waffles' }).items[0].slug, oreo.slug);
  assert.equal(selectReports(index, { ...base, q: 'quartz cranberry' }).items[0].slug, fallout.slug);
  assert.match(await read('blog.html'), /new drinks and snacks/);
});

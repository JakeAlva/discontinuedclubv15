import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { redBullArchive, redBullSources, redBullStatuses, redBullArchiveReviewed } from '../scripts/red-bull-archive.mjs';

const root = resolve(import.meta.dirname, '..');
const html = await readFile(resolve(root, 'discontinued-red-bull-flavors.html'), 'utf8');

test('Red Bull records are chronological, uniquely anchored and sourced', () => {
  assert.ok(redBullArchive.length >= 35);
  assert.equal(new Set(redBullArchive.map((item) => item.id)).size, redBullArchive.length);
  assert.equal(redBullArchive[0].year, 1997);
  assert.equal(redBullArchive.at(-1).year, 2026);
  redBullArchive.forEach((item, index) => {
    assert.ok(item.year >= (redBullArchive[index - 1]?.year || 0));
    assert.ok(redBullStatuses[item.status]);
    assert.ok(item.start && item.endLabel && item.note && item.imageAlt);
    assert.ok(item.sources.length);
    item.sources.forEach((key) => assert.ok(redBullSources[key]?.[1].startsWith('https://'), key));
    assert.ok(html.includes(`id="red-bull-${item.id}"`), item.id);
  });
});

test('every Red Bull entry has a real local photo and a working local credit when used', async () => {
  for (const item of redBullArchive) {
    const metadata = await sharp(resolve(root, item.image)).metadata();
    assert.ok(metadata.width >= 100 && metadata.height >= 100, item.id);
    assert.ok(item.photoCredit && item.photoUrl);
    if (!item.photoUrl.startsWith('https://')) await access(resolve(root, item.photoUrl));
  }
});

test('retirement windows and missing-month disclosures remain visible without JavaScript', () => {
  assert.equal((html.match(/data-archive-entry/g) || []).length, redBullArchive.length);
  assert.equal((html.match(/class="red-bull-lifespan"/g) || []).length, redBullArchive.length);
  assert.match(html, /By March 2016/);
  assert.match(html, /Around March 2022/);
  assert.match(html, /Late 2025–Jan 2026/);
  assert.match(html, /end month not published/);
  assert.doesNotMatch(html, /FAQPage|class="topic-report-card"/);
  assert.match(html, /assets\/red-bull-archive.js\?v=1/);
  assert.match(html, /aria-label="Filter Red Bull history"/);
});

test('same-color cans and returning flavors stay separate', () => {
  const byId = Object.fromEntries(redBullArchive.map((item) => [item.id, item]));
  assert.equal(byId.watermelon.status, 'current');
  assert.equal(byId['watermelon-sugarfree'].status, 'discontinued');
  assert.equal(byId['strawberry-apricot'].status, 'current');
  assert.equal(byId['strawberry-apricot-sugarfree'].status, 'discontinued');
  assert.equal(byId['peach-nectarine'].status, 'discontinued');
  assert.equal(byId['white-peach'].status, 'returned');
  assert.match(byId['arctic-berry'].note, /not a permanent nationwide standalone/);
  assert.equal(byId['plum-twist'].year, 2018);
  assert.ok(!redBullArchive.some((item) => /carnaval/i.test(item.name)));
});

test('Red Bull timeline metadata and sitemap use the review date and matching item count', async () => {
  const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((item) => item['@type'] === 'CollectionPage');
  assert.equal(schema.dateModified, redBullArchiveReviewed);
  assert.equal(schema.mainEntity.numberOfItems, redBullArchive.length);
  assert.equal(schema.mainEntity.itemListElement.length, redBullArchive.length);
  const sitemap = await readFile(resolve(root, 'sitemap-pages.xml'), 'utf8');
  assert.ok(sitemap.includes(`discontinued-red-bull-flavors.html</loc><lastmod>${redBullArchiveReviewed}</lastmod>`));
});

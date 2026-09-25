import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PAGE_SIZE, readState, selectReports, pageNumbers, stateHref, cardMarkup } from '../assets/journal-library.mjs';
import { reports } from '../scripts/journal-data.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const data = reports.map((report) => ({ ...report, date: report.checkedDate || '2026-09-11' }));
const base = { q: '', brand: '', status: '', sort: 'newest', page: 1 };

test('journal search combines words, accent-insensitive names, brand and evidence status', () => {
  const result = selectReports(data, { ...base, q: 'MONSTER cafe', brand: 'Monster Energy', status: 'rumor' });
  assert.equal(result.total, 1);
  assert.equal(result.items[0].product, 'Java Monster Caf\u00e9 Latte');
  assert.equal(selectReports(data, { ...base, q: 'cafe', brand: 'Red Bull' }).total, 0);
  const rumors = selectReports(data, { ...base, status: 'rumor' });
  assert.ok(rumors.items.every((report) => report.statusKey === 'rumor'));
  assert.equal(selectReports(data, base).items[0].slug, 'jones-fallout-vault-dweller-nuka-cola-quartz-cranberry');
  const alphabetical = selectReports(data, { ...base, sort: 'az' }).items.map((report) => report.product);
  assert.deepEqual(alphabetical, [...alphabetical].sort((a, b) => a.localeCompare(b, 'en')));
});

test('large journal libraries render six results and bounded page controls', () => {
  const thousand = Array.from({ length: 2000 }, (_, i) => ({ ...data[0], slug: `flavor-${i}`, product: `Flavor ${String(i).padStart(4, '0')}` }));
  const result = selectReports(thousand, { ...base, page: 166 });
  assert.equal(result.total, 2000);
  assert.equal(result.pages, 334);
  assert.equal(result.items.length, PAGE_SIZE);
  assert.ok(pageNumbers(result.page, result.pages).length <= 7);
  assert.deepEqual(pageNumbers(166, 334), [1, null, 165, 166, 167, null, 334]);
  assert.equal(selectReports(thousand, { ...base, page: 9999 }).page, 334);
  assert.equal(selectReports(thousand, { ...base, q: 'missing', page: 9 }).page, 1);
  assert.equal(selectReports(thousand, { ...base, q: 'missing' }).items.length, 0);
  assert.deepEqual(pageNumbers(1, 1), [1]);
});

test('URLs preserve searches and static pagination with defensive page bounds', () => {
  const url = (path) => new URL(path, 'https://discontinuedclub.com/');
  assert.equal(readState(url('blog-page-3.html')).page, 3);
  assert.equal(readState(url('blog-page-3')).page, 3);
  assert.equal(readState(url('blog-page-3/')).page, 3);
  assert.equal(readState(url('blog.html?page=-4&sort=evil&status=unknown')).page, 1);
  assert.equal(readState(url('blog.html?page=Infinity')).page, 1);
  assert.equal(readState(url('blog.html?page=1.5')).page, 1);
  assert.equal(readState(url('blog.html?q=' + 'a'.repeat(200))).q.length, 160);
  const state = { ...base, q: 'Cafe & cream', brand: 'Monster Energy', status: 'rumor', sort: 'az', page: 2 };
  assert.deepEqual(readState(url(stateHref(state))), state);
  assert.equal(stateHref(base), 'blog.html');
  assert.equal(stateHref({ ...base, page: 4 }), 'blog-page-4.html');
  assert.doesNotMatch(cardMarkup({ ...data[0], title: '<img src=x onerror=alert(1)>' }), /<img src=x/);
});

test('static journal pages expose every article once and remain independently indexable', async () => {
  const pages = (await readdir(root)).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  const index = JSON.parse(await read('assets/journal-index.json'));
  assert.equal(pages.length, Math.ceil(reports.length / PAGE_SIZE));
  assert.deepEqual(index.map((item) => item.slug).sort(), reports.map((item) => item.slug).sort());
  const linked = [];
  const sitemap = await read('sitemap-pages.xml');
  for (const file of pages) {
    const html = await read('dist/' + file);
    assert.ok(html.includes(`<link rel="canonical" href="https://discontinuedclub.com/${file}">`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.ok(sitemap.includes('https://discontinuedclub.com/' + file));
    assert.match(html, /journal-library\.mjs\?v=63/);
    assert.match(html, /journal-index\.json\?v=63/);
    const cards = [...html.matchAll(/<h2><a href="journal\/([^"#]+)\.html">/g)].map((match) => match[1]);
    assert.ok(cards.length > 0 && cards.length <= PAGE_SIZE);
    linked.push(...cards);
    if (file !== 'blog.html') assert.match(html, /href="blog.html" data-journal-page="1"/);
  }
  assert.deepEqual(linked.sort(), reports.map((report) => report.slug).sort());
});

test('Cafe Latte article is sourced, dated, appropriately unconfirmed, and discoverable', async () => {
  const report = reports.find((item) => item.slug === 'is-java-monster-cafe-latte-being-discontinued');
  assert.equal(report.statusKey, 'rumor');
  assert.equal(report.checkedDate, '2026-09-23');
  assert.equal(report.featured, false);
  assert.match(report.answer, /not confirmed discontinued/);
  assert.match(report.answer, /not verified a production end date/);
  assert.equal(report.shop, undefined);
  assert.equal(report.sources.length, 3);
  for (const file of ['blog.html', 'discontinued-monster-energy-flavors.html', 'discontinued-energy-drink-flavors-2026.html', 'sitemap-journal.xml']) {
    assert.ok((await read(file)).includes('journal/' + report.slug + '.html'), file);
  }
  const html = await read('dist/journal/' + report.slug + '.html');
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  assert.equal(graph[0].datePublished, '2026-09-23');
  assert.equal(graph[0].dateModified, '2026-09-23');
  assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart/);
  const image = await readFile(resolve(root, report.image));
  assert.equal(image.subarray(1, 4).toString(), 'PNG');
  assert.ok(image.readUInt32BE(20) > image.readUInt32BE(16));
});

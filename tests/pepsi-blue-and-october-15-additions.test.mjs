import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLParser } from 'fast-xml-parser';
import { catalog, categories, directPriceCents, maxQuantity } from '../lib/store-catalog.mjs';
import { reports } from '../scripts/journal-data.mjs';
import { selectReports } from '../assets/journal-library.mjs';
import { pepsiBlueStatusReport as pepsi } from '../scripts/pepsi-blue-status-report.mjs';
import { bublyFallMocktailsReport as bubly } from '../scripts/bubly-fall-mocktails-report.mjs';
import { kidfreshMiniMuffinsReport as kidfresh } from '../scripts/kidfresh-mini-muffins-report.mjs';
import createCheckout from '../netlify/functions/create-checkout.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFile(resolve(root, file), 'utf8');
const additions = [pepsi, bubly, kidfresh];
const productPath = 'products/pepsi-blue-berry-cola-2021-bottle-407290859464.html';

test('Pepsi Blue matches the verified one-bottle eBay listing and direct discount', async () => {
  const item = catalog.find((row) => row.id === '407290859464');
  assert.equal(catalog.filter((row) => row.id === item.id).length, 1);
  assert.equal(maxQuantity(item), 1);
  assert.equal(item.price, '$12.99');
  assert.equal(directPriceCents(item), 1254);
  assert.equal(item.shippingWeightOz, 32);
  assert.match(item.detail, /One full, unopened 16.9 fl oz.*2021/);
  assert.match(item.purchaseNote, /older collectible.*No expiration date has been verified/);
  assert.equal(categories.all.count, catalog.length);
  assert.equal(categories.drinks.count, catalog.filter((row) => row.category === 'drinks').length);
  const html = await read(`dist/${productPath}`);
  assert.match(html, /class="product-quantity-single"/);
  assert.match(html, /12\.54/);
  assert.ok(html.includes(item.purchaseNote));
  for (const path of ['index.html', 'rare-drinks.html']) {
    assert.ok((await read(`dist/${path}`)).includes(`data-listing-count="drinks">${categories.drinks.count}</span>`));
  }
  for (const variant of ['branded', 'merchant']) {
    const meta = await sharp(resolve(root, `dist/assets/images/listings/${variant}/${item.id}.webp`)).metadata();
    assert.equal(meta.width, 1200);
    assert.equal(meta.height, 1200);
  }
  const parser = new XMLParser({ parseTagValue: false });
  const feed = parser.parse(await read('dist/google-merchant-feed.xml')).rss.channel.item;
  const entry = feed.find((row) => row['g:id'] === `dc-${item.id}`);
  assert.equal(entry['g:price'], '12.54 USD');
  assert.equal(entry['g:availability'], 'in_stock');
  assert.equal(entry['g:image_link'], `https://discontinuedclub.com/assets/images/listings/merchant/${item.id}.webp`);
  assert.ok((await read('dist/sitemap-products.xml')).includes(`https://discontinuedclub.com/${productPath}`));
});

test('three new reports are search-ready, illustrated and crawlable without client-side search', async () => {
  const pages = (await readdir(resolve(root, 'dist'))).filter((file) => /^blog(?:-page-\d+)?\.html$/.test(file));
  const library = (await Promise.all(pages.map((file) => read(`dist/${file}`)))).join('');
  const index = JSON.parse(await read('dist/assets/journal-index.json'));
  const sitemap = new XMLParser().parse(await read('dist/sitemap-journal.xml')).urlset.url;
  const home = await read('dist/index.html');
  for (const report of additions) {
    assert.ok(reports.includes(report));
    const href = `journal/${report.slug}.html`;
    const url = `https://discontinuedclub.com/${href}`;
    assert.ok(home.includes('href="blog.html"'), 'Older posts remain reachable through the journal library');
    assert.ok(library.includes(`href="${href}"`));
    assert.equal(sitemap.filter((row) => row.loc === url).length, 1);
    const html = await read(`dist/${href}`);
    assert.ok(html.includes(`rel="canonical" href="${url}"`));
    assert.match(html, /content="index, follow, max-image-preview:large"/);
    assert.match(html, /Published October 15, 2026/);
    assert.doesNotMatch(html, /For older full cans/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0].datePublished, '2026-10-15');
    assert.equal(graph[0].dateModified, '2026-10-15');
    assert.equal(graph[0].mainEntityOfPage, url);
    assert.equal(graph[0].image, `https://discontinuedclub.com/${report.image}`);
    assert.equal(graph[1].mainEntity.length, report.faq.length);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    for (const slug of report.relatedSlugs) assert.ok(reports.some((row) => row.slug === slug));
    const meta = await sharp(resolve(root, 'dist', report.image)).metadata();
    assert.equal(meta.width, report.imageWidth);
    assert.equal(meta.height, report.imageHeight);
    assert.ok(report.imageCredit);
    assert.ok(selectReports(index, { q: report.product, brand: report.brand, sort: 'newest', page: 1 }).items.some((row) => row.slug === report.slug));
    if (report !== pepsi) assert.doesNotMatch(html, /article-shop-callout|data-add-to-cart/);
  }
  assert.match(await read(`dist/journal/${pepsi.slug}.html`), /article-shop-callout/);
  assert.equal(pepsi.shop.href, productPath);
});

test('the articles distinguish resale history, seasonal launches and actual serving sizes', () => {
  assert.match(pepsi.answer, /resale.*does not establish/);
  assert.match(pepsi.evidenceNote, /not verified.*2026.*exact final production/);
  assert.match(bubly.answer, /September 7, 2026/);
  assert.match(bubly.sidebar, /October guide to a September launch/);
  assert.match(kidfresh.answer, /October 15, 2026/);
  assert.match(kidfresh.sections.flatMap((section) => section.paragraphs).join(' '), /per serving, not per individual/);
  assert.equal(pepsi.statusKey, 'discontinued');
  assert.equal(bubly.statusKey, 'launch');
  assert.equal(kidfresh.statusKey, 'launch');
});

test('checkout rejects two Pepsi Blue bottles before contacting Stripe', async () => {
  const keys = ['STRIPE_CHECKOUT_ENABLED', 'STRIPE_SECRET_KEY'];
  const previous = keys.map((key) => process.env[key]);
  process.env.STRIPE_CHECKOUT_ENABLED = 'true';
  process.env.STRIPE_SECRET_KEY = 'sk_test_no_network_should_be_used';
  try {
    const response = await createCheckout(new Request('https://discontinuedclub.com/.netlify/functions/create-checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://discontinuedclub.com' },
      body: JSON.stringify({ items: [{ id: '407290859464', quantity: 2 }] })
    }));
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /available quantity changed/);
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
});

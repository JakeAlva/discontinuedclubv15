import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { browsableSoldItems, replacementListings } from '../lib/browse-catalog.mjs';
import { catalog, directPriceCents, maxQuantity, priceLookupKey } from '../lib/store-catalog.mjs';
import { pepsiSodaShopHistoryReport } from '../scripts/pepsi-soda-shop-history-report.mjs';
import { nikeCollegeGlovesReport } from '../scripts/nike-college-gloves-report.mjs';

const read = (file) => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('browse catalog deduplicates relistings and never gives unavailable products purchase controls', async () => {
  const sold = browsableSoldItems();
  const ids = new Set(catalog.map((item) => item.id));
  assert.equal(new Set(sold.map((item) => item.id)).size, sold.length);
  for (const item of sold) {
    assert.ok(!ids.has(item.id));
    assert.ok(!replacementListings[item.id]);
  }
  const shop = await read('dist/out-now.html');
  const cards = [...shop.matchAll(/<article class="product-card sold-card"[\s\S]*?<\/article>/g)].map((match) => match[0]);
  assert.equal(cards.length, sold.length);
  for (const item of sold) {
    const card = cards.find((html) => html.includes(`restock=${item.id}`));
    assert.ok(card, item.id);
    assert.match(card, /Out of stock/);
    assert.doesNotMatch(card, /data-add-to-cart|Buy on eBay|\$/);
    const page = await read(`dist/sold/${item.slug}.html`);
    assert.match(page, /Notify me when back in stock/);
    assert.doesNotMatch(page, /data-add-to-cart|Buy on eBay/);
  }
  assert.match(await read('dist/_redirects'), /\/sold-archive\.html\s+\/out-now\.html\?availability=out\s+301!/);
  assert.match(shop, /id="catalog-availability"/);
  assert.doesNotMatch(shop, />Sold archive<|>Previously sold</);
});

test('restock form uses the existing contact inbox and explicit product-only email consent', async () => {
  const html = await read('dist/contact.html');
  assert.match(html, /data-contact-form name="contact" method="POST"/);
  assert.match(html, /data-netlify="true"/);
  assert.match(html, /name="restockConsent" value="yes"/);
  assert.match(html, /not a newsletter signup/);
  assert.match(html, /No restock date, reservation, price or availability is guaranteed/);
  const app = await read('assets/app.js');
  assert.match(app, /contactForm\.elements\.restockConsent\.required = requested/);
  assert.match(app, /catalog\.concat\(soldCatalog\)\.find/);
  assert.match(app, /elements\.message\.value = 'Please email me if '/);
  for (const page of ['dist/index.html', 'dist/out-now.html', 'dist/blog.html']) {
    assert.match(await read(page), /assets\/sold-catalog\.js/);
  }
});

test('a live product gains one restock link only at verified zero and loses it when replenished', async () => {
  const source = await read('assets/app.js');
  const code = source.slice(source.indexOf('  function syncAddButtons(onlyId)'), source.indexOf('  function saveCart()'));
  const item = catalog.find((item) => item.id === '407329572793');
  let quantity = 0, verified = true, link, inserted = 0;
  const card = { dataset: {} };
  const label = {};
  const button = {
    dataset: { addToCart: item.id },
    parentElement: { querySelector: () => link }, closest: () => card,
    querySelector: (selector) => selector === '[data-add-label]' ? label : {},
    classList: { toggle() {} }, setAttribute() {},
    insertAdjacentElement: (_, element) => { link = element; inserted++; }
  };
  const sync = runInNewContext(code + '\nsyncAddButtons', {
    catalog: [item], inventoryState: 'ready', getMaxQuantity: () => quantity, hasLiveStock: () => verified,
    cartQuantityFor: () => 0, encodeURIComponent,
    document: { querySelectorAll: (selector) => selector === '[data-add-to-cart]' ? [button] : [], createElement: () => ({ dataset: {} }) }
  });
  sync(); sync();
  assert.equal(inserted, 1);
  assert.equal(link.href, `contact.html?restock=${item.id}`);
  assert.equal(link.hidden, false);
  assert.equal(button.disabled, true);
  assert.equal(card.dataset.availability, 'out');
  quantity = 3; sync();
  assert.equal(link.hidden, true);
  assert.equal(button.disabled, false);
  verified = false; sync();
  assert.equal(link.hidden, true);
  assert.equal(button.disabled, true);
  assert.equal(card.dataset.availability, 'unknown');
});

test('new glove listings retain advertised quantities, direct discount and uniform assets', async () => {
  for (const id of ['407384251656', '407381590762']) {
    const item = catalog.find((item) => item.id === id);
    assert.equal(item.price, '$149.99');
    assert.equal(directPriceCents(item), 14474);
    assert.equal(maxQuantity(item), 1);
    assert.equal(priceLookupKey(item), `dc_${id}_direct`);
    for (const folder of ['branded', 'merchant']) await access(new URL(`../assets/images/listings/${folder}/${id}.webp`, import.meta.url));
    for (const image of item.gallery) await access(new URL('../' + image.src, import.meta.url));
  }
});

test('both November 24 articles have sources, real photographs and discovery links', async () => {
  for (const report of [pepsiSodaShopHistoryReport, nikeCollegeGlovesReport]) {
    assert.equal(report.editionDate, '2026-11-24');
    assert.ok(report.sections.flatMap((section) => section.paragraphs).join(' ').split(/\s+/).length >= 650);
    const html = await read(`dist/journal/${report.slug}.html`);
    assert.match(html, /index, follow/);
    for (const source of report.sources) assert.ok(html.includes(source.url));
    await access(new URL('../' + report.image, import.meta.url));
    for (const file of ['dist/blog.html', 'dist/index.html', 'dist/sitemap-journal.xml']) assert.ok((await read(file)).includes(report.slug), file);
  }
});

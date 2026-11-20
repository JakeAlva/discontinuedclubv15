import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');

test('homepage search stays separated from the benefits row at every breakpoint', async () => {
  const css = await readFile(resolve(root, 'assets/style.css'), 'utf8');
  const rules = [...css.matchAll(/\.store-search-wrap\s*\{([^}]+)\}/g)];
  assert.ok(rules.length > 0);
  for (const [, declarations] of rules) {
    const gap = declarations.match(/margin-top:\s*(-?[\d.]+)px/);
    assert.ok(gap && Number(gap[1]) >= 24, 'Search needs at least 24px of clear space below the benefits band');
  }
});

test('campaign carousel promotes current products and curated collections', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];

  assert.equal(slides.length, 4);
  for (const [index, slide] of slides.entries()) {
    assert.equal((slide.match(/class="campaign-visual"/g) ?? []).length, 1);
    assert.equal((slide.match(/<img /g) ?? []).length, 1);
    const destinations = [
      /href="\/pear-scare"/,
      /href="products\/alani-nu-voodoo-vanilla-energy-elixir-8-4-oz-single-can-407329572793\.html"/,
      /href="products\/liquid-death-x-pop-tarts-carnage-407039382525\.html"/,
      /href="out-now\.html\?category=kids-shoes"/
    ];
    assert.match(slide, destinations[index]);
    assert.match(slide, /src="assets\/images\/campaign\/scenes\/[^"]+-desktop\.webp\?v=\d+"/);
    assert.match(slide, /srcset="assets\/images\/campaign\/scenes\/[^"]+-mobile\.webp\?v=\d+"/);
    assert.ok(slide.includes('aria-label="' + (index + 1) + ' of 4"'));
  }

  assert.equal((html.match(/<strong>Out now<\/strong>/gi) ?? []).length, 1);
  assert.match(slides[0], /<h1 class="sr-only">Bloom Pear Scare preorder<\/h1>/);
  assert.match(slides[1], /<h2>Alani Voodoo Vanilla<br>&amp; Ruby Apple<\/h2>/);
  assert.doesNotMatch(slides.join(''), /Journey Together|Destined Rivals|pokemon-arrivals/);
  assert.doesNotMatch(slides[0], /four-pack|Two lots|booster boxes/i);
  assert.match(slides[0], /fetchpriority="high"/);
  assert.doesNotMatch(slides[0], /loading="lazy"/);
  assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) ?? []).length, 1);
  assert.equal((html.match(/fetchpriority="high"/g) ?? []).length, 1);
  for (const slide of slides.slice(1)) assert.match(slide, /loading="lazy"/);
  const dots = [...html.matchAll(/<button[^>]+data-campaign-dot="\d+"[^>]*>/g)].map(([tag]) => tag);
  assert.match(dots[0], /aria-label="Show promotion 1: Bloom Pear Scare preorder".*aria-current="true"/);
  assert.match(dots[1], /Alani Voodoo Vanilla and Ruby Apple/);
  assert.match(dots[2], /Liquid Death x Pop-Tarts/);
  assert.match(dots[3], /Designer kids' shoes/);
  assert.doesNotMatch(html, /class="campaign-price"/);
  assert.doesNotMatch(slides.join(''), /Blueberry|407203102419|redbull-(desktop|mobile)/);
});

test('refreshed campaigns use native-resolution artwork and dedicated mobile compositions', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  for (const campaign of ['liquid-carnage', 'designer-kids-shoes', 'alani-pair', 'pear-scare-preorder']) {
    for (const size of ['desktop', 'mobile']) {
      const file = 'assets/images/campaign/scenes/' + campaign + '-' + size + '.webp';
      const metadata = await sharp(resolve(root, file)).metadata();
      assert.ok(html.includes(file + '?v=1'));
      assert.ok(metadata.width >= (size === 'desktop' ? 1900 : 1024));
      assert.ok(metadata.height >= (size === 'desktop' ? 700 : 1024));
      if (size === 'desktop') assert.ok(html.includes('width="' + metadata.width + '" height="' + metadata.height + '"'));
      else assert.ok(html.includes('media="(max-width: ' + (['alani-pair', 'pear-scare-preorder'].includes(campaign) ? 700 : 1000) + 'px)" srcset="' + file + '?v=1"'));
    }
  }
  assert.doesNotMatch(html, /scenes\/(?:liquid|pokemon)-(?:desktop|mobile)\.webp/);
  const css = await readFile(resolve(root, 'assets/style.css'), 'utf8');
  assert.match(css, /@media \(min-width: 1662px\)[\s\S]*?\.campaign-slide-pokemon \.campaign-media \{ object-fit: contain; object-position: right center; \}/);
});

test('designer kids shoes replace the jersey campaign without changing the jersey listing', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];
  const shoes = slides.find((slide) => slide.includes('campaign-slide-shoes'));
  assert.match(shoes, /campaign-slide-shoes/);
  assert.match(shoes, /<h2>Designer kids' shoes<\/h2>/);
  assert.match(shoes, /pre-owned pairs/);
  assert.equal((shoes.match(/href="out-now\.html\?category=kids-shoes"/g) ?? []).length, 2);
  assert.doesNotMatch(shoes, /new with tags|authenticity guarantee|last one|\$\d/i);
  assert.doesNotMatch(slides.join(''), /jersey-(desktop|mobile)|Drysdale|407176877843/);
  const { catalog } = await import('../lib/store-catalog.mjs');
  for (const id of ['407277122050', '407274649287']) {
    const item = catalog.find((product) => product.id === id);
    assert.equal(item.category, 'kids-shoes');
    assert.match(item.condition, /Pre-owned/);
  }
  assert.ok(catalog.some((item) => item.id === '407176877843'));
});

test('live Alani single cans replace the Halloween campaign without reviving sold Lime Slush', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];
  const teaser = slides.find((slide) => slide.includes('campaign-slide-alani'));
  assert.match(teaser, /campaign-slide-alani/);
  assert.match(teaser, /Now available/);
  assert.match(teaser, /individual unopened cans/);
  assert.match(teaser, /products\/alani-nu-ruby-apple-12-oz-single-can-407332173468\.html/);
  assert.doesNotMatch(slides.join(''), /Lime Slush|407293533835|campaign-slide-lime/);
  assert.doesNotMatch(teaser, /Currently unavailable|Date to be announced|preorder|next year|2027|\$/i);
  assert.equal((html.match(/data-campaign-dot="\d+"/g) ?? []).length, slides.length);
  for (const size of ['desktop', 'mobile']) {
    assert.ok((await stat(resolve(root, 'assets/images/campaign/scenes/alani-pair-' + size + '.webp'))).size > 10000);
  }
  const journal = await readFile(resolve(root, 'journal/is-alani-nu-lime-slush-discontinued.html'), 'utf8');
  assert.match(journal, /Neither archive is a preorder/);
  assert.match(journal, /not an announcement of new production or a manufacturer relaunch/);
  assert.ok((await readFile(resolve(root, 'sitemap-journal.xml'), 'utf8')).includes('is-alani-nu-lime-slush-discontinued.html'));
  assert.doesNotMatch(html, /<meta name="robots" content="noindex/);
});

test('Pear Scare leads with readable, linked preorder terms without changing the offer', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slide = html.match(/<article class="campaign-slide campaign-slide-pear"[\s\S]*?<\/article>/)?.[0];
  assert.ok(slide);
  assert.match(slide, /href="\/pear-scare"/);
  assert.match(slide, /\$7\.99 per 12 oz can/);
  assert.match(slide, /Expected to ship November 30, 2026, subject to incoming delivery/);
  assert.match(slide, /Pay now; shipping and applicable tax extra/);
  assert.match(slide, /<span>Preorder Pear Scare<\/span>/);
  assert.doesNotMatch(slide, /in stock|guaranteed|only \d+|free shipping/i);
  const css = await readFile(resolve(root, 'assets/style.css'), 'utf8');
  assert.match(css, /\.campaign-slide-pear \.campaign-media\s*\{[^}]*object-fit: contain/);
  assert.match(css, /\.campaign-slide-pear \.campaign-visual:focus-visible/);
  assert.match(html, /In-stock orders placed before 12 PM Central/);
  assert.match(html, /Preorders follow their listed shipping schedule/);
  assert.match(await readFile(resolve(root, '_redirects'), 'utf8'), /\/pear-scare\s+\/products\/bloom-pear-scare[^\n]+302/);
  for (const size of ['desktop', 'mobile']) {
    assert.ok((await stat(resolve(root, 'assets/images/campaign/scenes/pear-scare-preorder-' + size + '.webp'))).size < 350000);
  }
});

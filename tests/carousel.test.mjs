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

  assert.equal(slides.length, 3);
  for (const [index, slide] of slides.entries()) {
    assert.equal((slide.match(/class="campaign-visual"/g) ?? []).length, 1);
    assert.equal((slide.match(/<img /g) ?? []).length, 1);
    const destinations = [
      /href="products\/liquid-death-x-pop-tarts-carnage-407039382525\.html"/,
      /href="out-now\.html\?category=kids-shoes"/,
      /href="products\/alani-nu-witch-s-brew-12-oz-4-pack-407293550787\.html"/
    ];
    assert.match(slide, destinations[index]);
    assert.match(slide, /src="assets\/images\/campaign\/scenes\/[^"]+-desktop\.webp\?v=\d+"/);
    assert.match(slide, /srcset="assets\/images\/campaign\/scenes\/[^"]+-mobile\.webp\?v=\d+"/);
    assert.ok(slide.includes('aria-label="' + (index + 1) + ' of 3"'));
  }

  assert.equal((html.match(/<strong>Out now<\/strong>/gi) ?? []).length, 1);
  assert.match(slides[0], /<h1>Liquid Death x Pop-Tarts<\/h1>/);
  assert.doesNotMatch(slides.join(''), /Journey Together|Destined Rivals|pokemon-arrivals/);
  assert.doesNotMatch(slides[0], /four-pack|Two lots|booster boxes/i);
  assert.match(slides[0], /fetchpriority="high"/);
  assert.doesNotMatch(slides[0], /loading="lazy"/);
  assert.equal((html.match(/<h1>/g) ?? []).length, 1);
  assert.equal((html.match(/fetchpriority="high"/g) ?? []).length, 1);
  for (const slide of slides.slice(1)) assert.match(slide, /loading="lazy"/);
  const dots = [...html.matchAll(/<button[^>]+data-campaign-dot="\d+"[^>]*>/g)].map(([tag]) => tag);
  assert.match(dots[0], /aria-label="Show promotion 1: Liquid Death x Pop-Tarts".*aria-current="true"/);
  assert.match(dots[1], /Designer kids' shoes/);
  assert.match(dots[2], /Alani Nu Witch's Brew/);
  assert.doesNotMatch(html, /class="campaign-price"/);
  assert.doesNotMatch(slides.join(''), /Blueberry|407203102419|redbull-(desktop|mobile)/);
});

test('refreshed campaigns use native-resolution artwork and dedicated mobile compositions', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  for (const campaign of ['liquid-carnage', 'designer-kids-shoes', 'witchs-brew']) {
    for (const size of ['desktop', 'mobile']) {
      const file = 'assets/images/campaign/scenes/' + campaign + '-' + size + '.webp';
      const metadata = await sharp(resolve(root, file)).metadata();
      assert.ok(html.includes(file + '?v=1'));
      assert.ok(metadata.width >= (size === 'desktop' ? 1900 : 1536));
      assert.ok(metadata.height >= (size === 'desktop' ? 780 : 1024));
      if (size === 'desktop') assert.ok(html.includes('width="' + metadata.width + '" height="' + metadata.height + '"'));
      else assert.ok(html.includes('media="(max-width: 1000px)" srcset="' + file + '?v=1"'));
    }
  }
  assert.doesNotMatch(html, /scenes\/(?:liquid|pokemon)-(?:desktop|mobile)\.webp/);
  const css = await readFile(resolve(root, 'assets/style.css'), 'utf8');
  assert.match(css, /@media \(min-width: 1662px\)[\s\S]*?\.campaign-slide-pokemon \.campaign-media \{ object-fit: contain; object-position: right center; \}/);
});

test('designer kids shoes replace the jersey campaign without changing the jersey listing', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];
  const shoes = slides[1];
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

test('Witch\'s Brew replaces the sold Lime Slush reserve campaign', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];
  const teaser = slides.at(-1);
  assert.match(teaser, /campaign-slide-witch/);
  assert.match(teaser, /Halloween pick/);
  assert.match(teaser, /four full-size 12 oz cans/);
  assert.match(teaser, /products\/alani-nu-witch-s-brew-12-oz-4-pack-407293550787\.html/);
  assert.doesNotMatch(slides.join(''), /Lime Slush|407293533835|campaign-slide-lime/);
  assert.doesNotMatch(teaser, /Currently unavailable|Date to be announced|preorder|next year|2027|\$/i);
  assert.equal((html.match(/data-campaign-dot="\d+"/g) ?? []).length, slides.length);
  for (const size of ['desktop', 'mobile']) {
    assert.ok((await stat(resolve(root, 'assets/images/campaign/scenes/witchs-brew-' + size + '.webp'))).size > 10000);
  }
  const journal = await readFile(resolve(root, 'journal/is-alani-nu-lime-slush-discontinued.html'), 'utf8');
  assert.match(journal, /Neither archive is a preorder/);
  assert.match(journal, /not an announcement of new production or a manufacturer relaunch/);
  assert.ok((await readFile(resolve(root, 'sitemap-journal.xml'), 'utf8')).includes('is-alani-nu-lime-slush-discontinued.html'));
  assert.doesNotMatch(html, /<meta name="robots" content="noindex/);
});

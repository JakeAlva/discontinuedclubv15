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
    const destination = index === 1
      ? /href="out-now\.html\?category=kids-shoes"/
      : index === 2
      ? /href="out-now\.html\?category=collectibles"/
      : index === 3
        ? /href="journal\/is-alani-nu-lime-slush-discontinued\.html"/
        : /href="products\/[^"]+\.html"/;
    assert.match(slide, destination);
    assert.match(slide, /src="assets\/images\/campaign\/scenes\/[^"]+-desktop\.webp\?v=\d+"/);
    assert.match(slide, /srcset="assets\/images\/campaign\/scenes\/[^"]+-mobile\.webp\?v=\d+"/);
    assert.ok(slide.includes('aria-label="' + (index + 1) + ' of 4"'));
  }

  assert.equal((html.match(/<strong>Out now<\/strong>/gi) ?? []).length, 1);
  assert.match(slides[2], /Pokemon booster bundles/);
  assert.match(slides[2], /Ascended Heroes and Destined Rivals are here/);
  assert.match(slides[2], /Journey Together, single packs, and more/);
  assert.doesNotMatch(slides[2], /four-pack|Two lots|booster boxes/i);
  assert.doesNotMatch(html, /class="campaign-price"/);
  assert.doesNotMatch(slides.join(''), /Blueberry|407203102419|redbull-(desktop|mobile)/);
});

test('refreshed campaigns use native-resolution artwork and dedicated mobile compositions', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  for (const campaign of ['liquid-carnage', 'pokemon-arrivals', 'designer-kids-shoes']) {
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

test('Lime Slush teaser stays last, indexable, and unavailable for purchase', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];
  const teaser = slides.at(-1);
  assert.match(teaser, /campaign-slide-lime/);
  assert.match(teaser, /Currently unavailable/);
  assert.match(teaser, /One four-pack is reserved/);
  assert.match(teaser, /Date to be announced/);
  assert.doesNotMatch(teaser, /data-add-to-cart|href="products\/|preorder|next year|2027|\$/i);
  assert.equal((html.match(/data-campaign-dot="\d+"/g) ?? []).length, slides.length);
  for (const size of ['desktop', 'mobile']) {
    assert.ok((await stat(resolve(root, 'assets/images/campaign/scenes/lime-' + size + '.webp'))).size > 10000);
  }
  const journal = await readFile(resolve(root, 'journal/is-alani-nu-lime-slush-discontinued.html'), 'utf8');
  assert.match(journal, /not available to buy or preorder/);
  assert.match(journal, /not an announcement of new production or a manufacturer relaunch/);
  assert.ok((await readFile(resolve(root, 'sitemap-journal.xml'), 'utf8')).includes('is-alani-nu-lime-slush-discontinued.html'));
  assert.doesNotMatch(html, /<meta name="robots" content="noindex/);
});
